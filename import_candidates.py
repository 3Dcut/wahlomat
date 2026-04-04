import csv
import json
import os

# Configuration
CSV_FILE = 'Wahl-O-Mat_ Kandidatenpositionierung (Antworten) - Formularantworten 1.csv'
OUTPUT_FILE = 'candidates_data.json'

PARTY_MAPPING = {
    "azbarbeit": ["azb", "azb - arbeit. zukunft. beständigkeit.", "azb - arbeit. zukunft. beständigkeit. "],
    "azbzeit": ["azb-arbeitszeit ist meine zeit", "azb - arbeitszeit ist meine zeit"],
    "azbaggr": ["azb - aggregation zerstreuter buendnisse - fck nzs", "azb - aggregation zerstreuter buendnisse fck nzs", "aggregation zerstreuter bündnisse", "https://app.warera.io/party/69bae2bc1348cf457e21469d"],
    "adav": ["adav", "adav - allgemeiner deutscher arbeiterverein", "allgemeiner deutscher arbeiterverein", "adav "],
    "deutschland": ["deutschland-partei", "deutschland partei"],
    "wumms": ["wums", "w.u.m.s.", "wumms", "w.u.m.s", "w.u.m.s ", "wumms"],
    "graue": ["die grauen", "diegrauen"],
    "fdpd": ["fdpd"],
    "diepartei": ["die partei"],
    "ueberfluss": ["partei zur überflusskontrolle", "partei zur ueberflusskontrolle"],
    "parteilos": ["parteilos", "keine", "keine partei", "parteilos ", "einheitspartei"]
}

def map_party(raw_party, username):
    u = username.lower().strip()
    p = str(raw_party).lower().strip()
    
    # Specific Overrides
    if "kretschmann" in u: return "deutschland"
    if u in ["oil-bert", "marcell_davis"]: return "azbarbeit"
    if u in ["fishi", "legendarylama"]: return "parteilos"
    
    for pid, variants in PARTY_MAPPING.items():
        if p in variants:
            return pid
            
    # Fuzzy fallback
    if "arbeit. zukunft" in p or p == "azb": return "azbarbeit"
    if "arbeitszeit" in p: return "azbzeit"
    if "aggregation" in p or "69bae2bc" in p: return "azbaggr"
    if "adav" in p or "arbeiterverein" in p: return "adav"
    if "deutschland" in p: return "deutschland"
    if "wums" in p or "wumms" in p: return "wumms"
    if "graue" in p: return "graue"
    
    return "parteilos"

def process_csv():
    if not os.path.exists(CSV_FILE):
        print(f"Error: {CSV_FILE} not found.")
        return

    candidates = []
    with open(CSV_FILE, mode='r', encoding='utf-8') as f:
        reader = csv.reader(f)
        header = next(reader)
        
        for i, row in enumerate(reader):
            if not row or len(row) < 5: continue
            
            username = row[1].strip()
            if not username: continue
            
            intro = row[2].strip()
            raw_party = row[3].strip()
            in_congress = "Ja" in row[4]
            
            party_id = map_party(raw_party, username)
            
            candidate = {
                "id": f"k-{i}",
                "name": username,
                "party": party_id,
                "inCongress": in_congress,
                "intro": intro,
                "importantQuestions": [],
                "answers": {},
                "statements": {}
            }
            
            # Map 24 questions (each has 3 columns: Value, Statement, Focus)
            # Starting at column index 5
            for q_idx in range(24):
                qid = f"q{q_idx+1:02d}"
                start_col = 5 + (q_idx * 3)
                
                if start_col >= len(row): break
                
                # Answer
                try:
                    ans = int(row[start_col])
                except ValueError:
                    ans = 3
                candidate["answers"][qid] = ans
                
                # Statement
                if start_col + 1 < len(row):
                    stmt = row[start_col + 1].strip()
                    if stmt:
                        candidate["statements"][qid] = stmt
                
                # Important Focus
                if start_col + 2 < len(row):
                    if "Ja" in row[start_col + 2]:
                        candidate["importantQuestions"].append(qid)
            
            candidates.append(candidate)
            
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(candidates, f, ensure_ascii=False, indent=2)
    
    print(f"Successfully processed {len(candidates)} candidates.")
    print(f"Data written to {OUTPUT_FILE}")

if __name__ == "__main__":
    process_csv()
