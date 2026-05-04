"""
Import-Skript für WahlEra Kandidaten-Daten.

Liest die CSV von Google Forms ein und erzeugt candidates_data.json.
Unterstützt eine corrections.json, die manuelle Korrekturen enthält
und bei Re-Imports nicht überschrieben wird, sondern nachträglich
angewendet wird.

Usage:
    python import_candidates.py
"""

import csv
import json
import os
import re

# =============================================================================
# Configuration
# =============================================================================
CSV_FILE = 'Wahl-O-Mat_ Kandidatenpositionierung (Antworten) - Formularantworten 1 (4).csv'
OUTPUT_FILE = 'candidates_data.json'
CORRECTIONS_FILE = 'corrections.json'

# =============================================================================
# Mapping: CSV-Spalten-Hints -> data.js Fragen-IDs
#
# Die CSV hat 24 "alte" Fragen (je 3 Spalten: Antwort, Begründung, Fokus)
# plus 2 neue Fragen am Ende. Die 10 Fragen in data.js müssen auf die
# richtigen CSV-Spaltengruppen gemappt werden.
#
# CSV Fragen-Reihenfolge (0-basiert, jede Frage hat 3 Spalten ab Index 5):
#  0: Venezuela Reformen (Hint: "Venezuela hat Reformen durchgeführt")         -> q01
#  1: BeNe Kooperation (Hint: "Kooperation oder Konfrontation mit den Benelux") -> q02
#  2: Kongress Ressourcen (Hint: "begrenzte zeitliche Ressourcen")              -> NICHT in data.js (alt)
#  3: Turnier vs. Kerngebiete (Hint: "Profit vs. territoriale Integrität")     -> q07
#  4: Expansion vs. Spielerstärke (Hint: "Expansion oder Konzentration")       -> q08
#  5: Venezuela Kooperation 2 (Hint: "Venezuela strebt weiter")                -> NICHT in data.js (alt)
#  6: Macht/Politik/Profit (Hint: "Internationale Macht")                      -> NICHT in data.js (alt)
#  7: Frankreich (Hint: "Historische Aussöhnung")                              -> NICHT in data.js (alt)
#  8: Mittelmeer (Hint: "Kooperation oder Konfrontation im Mittelmeerraum")    -> NICHT in data.js (alt)
#  9: Struktur vs. freies Mandat (Hint: "Mehr Struktur vs. freies Mandat")     -> q05
# 10: Kongressarbeit (Hint: "Bewertung der bisherigen Kongressarbeit")         -> q06
# 11: Embargos (Hint: "Embargos verhängen")                                    -> NICHT in data.js (alt)
# 12: USA oder Niederlande (Hint: "USA oder Niederlande")                      -> NICHT in data.js (alt)
# 13: Schweiz/Gambia (Hint: "Schweiz, Gambia")                                 -> NICHT in data.js (alt)
# 14: Spion (Hint: "Bist du ein Spion")                                        -> q09
# 15: Casual vs. Vollzeit (Hint: "Casual-Spieler oder Vollzeit")               -> q10
# 16: Marketing (Hint: "Bewertung von externem Marketing")                     -> NICHT in data.js (alt)
# 17: Demokratie vs. Autokratie (Hint: "Demokratischer Konsens")               -> NICHT in data.js (alt)
# 18: Fraktionszwang (Hint: "Fraktionszwang")                                  -> NICHT in data.js (alt)
# 19: Katzen/Hunde (Hint: "am häufigsten vorgeschlagen")                       -> NICHT in data.js (alt)
# 20: Farbdiskussionen (Hint: "Farbdiskussionen")                              -> NICHT in data.js (alt)
# 21: Externe Tools (Hint: "Fokus auf die Spielmechaniken")                    -> NICHT in data.js (alt)
# 22: Entwickler (Hint: "Umgang mit den Entwicklern")                          -> NICHT in data.js (alt)
# 23: Ernst der Wahl (Hint: "Wie ernst nimmst du die Wahl")                    -> NICHT in data.js (alt)
#
# Nach den 24 alten Fragen kommen Feedback-Spalten, dann die 2 neuen Fragen:
# Die 2 neuen Fragen sind am Ende der CSV (nach Feedback/Link-Spalten):
# "Neue Proxy-Projekte oder bestehende konsolidieren?"                         -> q03
# "Finanzielle Großzügigkeit gegenüber Verbündeten oder nationaler Sparfokus?" -> q04
# =============================================================================

# CSV-Fragenindex (0-basiert in der Fragenreihenfolge) -> data.js Fragen-ID
# Nur die 10 Fragen, die in data.js vorkommen
CSV_Q_INDEX_TO_QID = {
    0: "q01",   # Venezuela Reformen
    1: "q02",   # BeNe Kooperation
    3: "q07",   # Turnier vs. Kerngebiete
    4: "q08",   # Expansion vs. Spielerstärke
    9: "q05",   # Struktur vs. freies Mandat
    10: "q06",  # Kongressarbeit
    14: "q09",  # Spion
    15: "q10",  # Casual vs. Vollzeit
}

# Die 2 neuen Fragen am Ende der CSV (nach Feedback-Block)
# Diese werden separat gehandhabt, da sie nicht in den 24-Fragen-Block fallen
NEW_QUESTIONS_HINT_TO_QID = {
    "Neue Proxy-Projekte": "q03",
    "Finanzielle Großzügigkeit": "q04",
}


# =============================================================================
# Party Mapping
# =============================================================================
PARTY_MAPPING = {
    "azbarbeit": [
        "azb", "azb - arbeit. zukunft. beständigkeit.",
        "azb - arbeit. zukunft. beständigkeit. ",
        "azb - arbeit. zukunft. beständigkeit",
    ],
    "azbzeit": [
        "azb-arbeitszeit ist meine zeit",
        "azb - arbeitszeit ist meine zeit",
        "azb-arbeitszeit ist meine zeit",
    ],
    "azbaggr": [
        "azb - aggregation zerstreuter buendnisse - fck nzs",
        "azb - aggregation zerstreuter buendnisse fck nzs",
        "aggregation zerstreuter bündnisse",
        "arbeitszeitbetrug & nachtwache - aggregation zerstreuter buendnisse - fck nzs",
        "arbeitszeitbetrug & nachtwache",
    ],
    "adav": [
        "adav", "adav - allgemeiner deutscher arbeiterverein",
        "allgemeiner deutscher arbeiterverein", "adav ",
        "adav - allgemeiner deutscher arbeiter, bauern und tierverein",
    ],
    "deutschland": ["deutschland-partei", "deutschland partei"],
    "wumms": ["wums", "w.u.m.s.", "wumms", "w.u.m.s", "w.u.m.s ", "wumms"],
    "graue": ["die grauen", "diegrauen"],
    "fdpd": ["fdpd", "freie demokratische patei deutschland kurz fdpd"],
    "diepartei": ["die partei"],
    "sumpflagler": ["sumpflagler"],
    "ueberfluss": ["partei zur überflusskontrolle", "partei zur ueberflusskontrolle"],
    "parteilos": ["parteilos", "keine", "keine partei", "parteilos ", "einheitspartei"],
}

# Name overrides by username (lowercased)
PARTY_OVERRIDES = {
    "winfried_kretschmann": "deutschland",
    "oil-bert": "azbarbeit",
    "marcell_davis": "azbarbeit",
    "fishi": "parteilos",
    "legendarylama": "parteilos",
}


def is_google_forms_link(text):
    """Prüft ob der Text ein Google-Forms-Link oder app.warera.io Link ist."""
    t = text.strip().lower()
    return "http" in t or "app.warera.io" in t or "forms.gle" in t


def map_party(raw_party, username):
    """Mappt den Parteinamen aus der CSV auf die data.js Partei-ID."""
    u = username.lower().strip()

    # Specific username overrides
    for name_part, pid in PARTY_OVERRIDES.items():
        if name_part in u:
            return pid

    p = str(raw_party).lower().strip()

    # Skip Google Forms links
    if is_google_forms_link(p):
        return "parteilos"

    # Direct match
    for pid, variants in PARTY_MAPPING.items():
        if p in variants:
            return pid

    # Fuzzy fallback
    if "arbeit. zukunft" in p or p == "azb":
        return "azbarbeit"
    if "arbeitszeit" in p:
        return "azbzeit"
    if "aggregation" in p:
        return "azbaggr"
    if "adav" in p or "arbeiterverein" in p:
        return "adav"
    if "deutschland" in p:
        return "deutschland"
    if "wums" in p or "wumms" in p or "w.u.m.s" in p:
        return "wumms"
    if "graue" in p:
        return "graue"

    return "parteilos"


def find_new_question_columns(header):
    """
    Findet die Spaltenindizes der 2 neuen Fragen am Ende der CSV.
    Returns dict: qid -> column_index (der Antwort-Spalte)
    """
    result = {}
    for col_idx, col_name in enumerate(header):
        for hint_prefix, qid in NEW_QUESTIONS_HINT_TO_QID.items():
            if hint_prefix.lower() in col_name.lower():
                # Prüfe ob es NICHT eine der 24 alten Fragen ist
                # Die neuen Fragen kommen nach dem Feedback-Block
                if col_idx >= 84:  # nach Feedback-Block (Spalte 83 = Link zum Wahlartikel)
                    result[qid] = col_idx
                    break
    return result


def process_csv():
    if not os.path.exists(CSV_FILE):
        print(f"Fehler: {CSV_FILE} nicht gefunden.")
        return

    candidates = []

    # Nur Einträge ab diesem Datum importieren (neue Wahlrunde)
    CUTOFF_DATE = "03.05.2026"

    with open(CSV_FILE, mode='r', encoding='utf-8') as f:
        reader = csv.reader(f)
        header = next(reader)

        # Finde die Spalten der neuen Fragen
        new_q_cols = find_new_question_columns(header)
        print(f"Neue Fragen-Spalten gefunden: {new_q_cols}")

        for i, row in enumerate(reader):
            if not row or len(row) < 5:
                continue

            username = row[1].strip()
            if not username:
                continue

            # Zeitstempel-Filter: nur neue Runde (ab Mai 2026)
            timestamp = row[0].strip()
            try:
                day, month, year_rest = timestamp.split(".")
                year = year_rest.split(" ")[0]
                row_date = f"{day}.{month}.{year}"
                cut_day, cut_month, cut_year = CUTOFF_DATE.split(".")
                if (int(year), int(month), int(day)) < (int(cut_year), int(cut_month), int(cut_day)):
                    continue
            except (ValueError, IndexError):
                continue

            intro = row[2].strip()
            raw_party = row[3].strip()
            in_congress = "Ja" in row[4]

            party_id = map_party(raw_party, username)

            candidate = {
                "id": f"k-{len(candidates)}",
                "name": username,
                "party": party_id,
                "inCongress": in_congress,
                "intro": intro,
                "importantQuestions": [],
                "answers": {},
                "statements": {},
            }

            # ── 24 alte Fragen verarbeiten (je 3 Spalten ab Index 5) ──
            for q_csv_idx in range(24):
                start_col = 5 + (q_csv_idx * 3)
                if start_col >= len(row):
                    break

                # Nur verarbeiten wenn diese CSV-Frage einer data.js-Frage zugeordnet ist
                if q_csv_idx not in CSV_Q_INDEX_TO_QID:
                    continue

                qid = CSV_Q_INDEX_TO_QID[q_csv_idx]

                # Antwort
                try:
                    ans = int(row[start_col])
                except (ValueError, IndexError):
                    ans = 3
                candidate["answers"][qid] = ans

                # Begründung
                if start_col + 1 < len(row):
                    stmt = row[start_col + 1].strip()
                    if stmt:
                        candidate["statements"][qid] = stmt

                # Fokusthema
                if start_col + 2 < len(row):
                    if "Ja" in row[start_col + 2]:
                        candidate["importantQuestions"].append(qid)

            # ── 2 neue Fragen am Ende verarbeiten ──
            for qid, col_idx in new_q_cols.items():
                if col_idx >= len(row):
                    continue

                # Antwort
                try:
                    ans = int(row[col_idx])
                except (ValueError, IndexError):
                    ans = 3
                candidate["answers"][qid] = ans

                # Begründung (col_idx + 1)
                if col_idx + 1 < len(row):
                    stmt = row[col_idx + 1].strip()
                    if stmt:
                        candidate["statements"][qid] = stmt

                # Fokusthema (col_idx + 2)
                if col_idx + 2 < len(row):
                    if "Ja" in row[col_idx + 2]:
                        candidate["importantQuestions"].append(qid)

            # Sicherstellen, dass alle 10 Fragen eine Antwort haben
            for qid_num in range(1, 11):
                qid = f"q{qid_num:02d}"
                if qid not in candidate["answers"]:
                    candidate["answers"][qid] = 3  # neutral als Default

            candidates.append(candidate)

    # ── Korrekturen anwenden ──
    if os.path.exists(CORRECTIONS_FILE):
        print(f"Wende Korrekturen aus {CORRECTIONS_FILE} an...")
        with open(CORRECTIONS_FILE, 'r', encoding='utf-8') as f:
            corrections = json.load(f)

        for corr in corrections:
            target_name = corr.get("name", "").lower().strip()
            for cand in candidates:
                if cand["name"].lower().strip() == target_name:
                    # Partei überschreiben
                    if "party" in corr:
                        cand["party"] = corr["party"]
                    # Name überschreiben (z.B. Tippfehler)
                    if "displayName" in corr:
                        cand["name"] = corr["displayName"]
                    # Intro überschreiben
                    if "intro" in corr:
                        cand["intro"] = corr["intro"]
                    # Antworten überschreiben
                    if "answers" in corr:
                        for qid, val in corr["answers"].items():
                            cand["answers"][qid] = val
                    # Statements überschreiben
                    if "statements" in corr:
                        for qid, val in corr["statements"].items():
                            cand["statements"][qid] = val
                    print(f"  Korrektur angewendet für: {cand['name']}")
                    break

    # ── Ergebnis schreiben ──
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(candidates, f, ensure_ascii=False, indent=2)

    print(f"\nErfolgreich {len(candidates)} Kandidaten verarbeitet.")
    print(f"Daten geschrieben nach {OUTPUT_FILE}")

    # Statistiken
    parties_count = {}
    for c in candidates:
        p = c["party"]
        parties_count[p] = parties_count.get(p, 0) + 1
    print(f"\nParteien-Verteilung:")
    for pid, count in sorted(parties_count.items(), key=lambda x: -x[1]):
        print(f"  {pid}: {count}")

    # Prüfe fehlende Antworten für neue Fragen
    missing_q03 = sum(1 for c in candidates if c["answers"].get("q03") == 3)
    missing_q04 = sum(1 for c in candidates if c["answers"].get("q04") == 3)
    print(f"\nNeue Fragen - Default-Antwort (3/neutral):")
    print(f"  q03 (Proxys): {missing_q03} von {len(candidates)}")
    print(f"  q04 (Finanzen): {missing_q04} von {len(candidates)}")


if __name__ == "__main__":
    process_csv()
