// ====================================================================
// WAHL-ERA KONFIGURATION
// ====================================================================
// Dieses File bearbeitet, um Fragen, Parteien und Kandidat:innen
// anzupassen. Keine Programmierkenntnisse nötig.
//
// FRAGEN: Jede Frage hat zwei Pole (poleA und poleB).
//   poleA = Erste Position (entspricht Wert 1)
//   poleB = Zweite Position (entspricht Wert 5)
//   hint  = Erläuterung für Nutzer:innen
//
// PARTEIEN: id, name, color (Hex). Kandidat:innen verweisen per
//   party-Feld auf die Partei-id. party: null = parteilos.
//
// KANDIDAT:INNEN: answers enthält pro Fragen-id einen Wert 1–5.
//   1 = klar Pol A · 3 = neutral · 5 = klar Pol B
//   statements = Begründungen pro Frage (aufklappbar)
// ====================================================================

window.WAHLERA_DATA = {

  meta: {
    title: "Era-O-Mat",
    election: "Kongresswahlen 2026",
    description: "Beantworte 20 Fragen zur Zukunft Deutschlands in Era und finde heraus, welche Kandidat:innen am besten zu dir passen."
  },

  // ── Parteien ──────────────────────────────────────────────────────
  parties: [
    { id: "sozial",  name: "Sozialdemokraten",  color: "#E3000F" },
    { id: "konserv", name: "Konservative",       color: "#1a1a2e" },
    { id: "gruen",   name: "Grüne",              color: "#1AA037" },
    { id: "liberal", name: "Liberale",           color: "#FFCC00" }
  ],

  // ── Fragen ────────────────────────────────────────────────────────
  questions: [
    {
      id: "q01",
      category: "Kultur",
      poleA: "Wechselnde Roleplaycharaktere sind wichtig für die Unterhaltung und Immersion.",
      poleB: "Kongressmitglieder sollten neutrale Namen nutzen und sich einen Ruf erarbeiten.",
      hint: "Hemmt roleplay die Seriösität oder Arbeit in der Politik?"
    },
    {
      id: "q02",
      category: "Kultur",
      poleA: "Reggie darf nur noch deutsch sprechen.",
      poleB: "In Reggies Anwesenheit spricht der Chat englisch.",
      hint: "Beugen wir uns weiter der Diktatur eines Wahnsinnigen??"
    },
    {
      id: "q03",
      category: "Kultur",
      poleA: "Projekte wie ein eigenes Radio sollten aktiv verfolgt werden.",
      poleB: "Die Zeit sollte primär in die politische Arbeit und das Spielgeschehen fließen.",
      hint: "Die Kongressmitgieder haben nur begrenzte zeitliche Ressourcen."
    },
    {
      id: "q04",
      category: "Außenpolitik",
      poleA: "Deutschland sollte ein Bündnis mit Belgien, den Niederlanden und Schweden gemeinsam forcieren.",
      poleB: "Deutschland sollte sich einem bestehenden Block anschließen.",
      hint: "Aktives gestalten von Partnerschaften oder sich einem Bündnis anschließen."
    },
    {
      id: "q05",
      category: "Außenpolitik",
      poleA: "Deutschland sollte am Bündnis mit Schweden festhalten.",
      poleB: "Deutschland sollte sich mit den stärksten Mächten verbünden.",
      hint: "Loyalität zu langjährigen Partnern oder rein machtpolitische Orientierung."
    },
    {
      id: "q06",
      category: "Außenpolitik",
      poleA: "Deutschland sollte ein neues Bündnis mit Venezuela anstreben.",
      poleB: "Deutschland muss sich weiterhin von Venezuela distanzieren.",
      hint: "Venezuela strebt weiter eine Kooperation an, lehnt aber ab Fehler gemacht zu haben."
    },
    {
      id: "q07",
      category: "Außenpolitik",
      poleA: "Deutschland sollte langfristig als Söldnernation agieren.",
      poleB: "Kriege sollten nur aus politischen Gründen geführt werden.",
      hint: "Internationale Macht, politische Arbeit oder Profit."
    },
    {
      id: "q08",
      category: "Nationale Einstellung",
      poleA: "Deutschland sollte wirtschaftliches Wachstum priorisieren und die Kerngebiete halten.",
      poleB: "Deutschland sollte aggressiv expandieren und neue Gebiete erobern.",
      hint: "Bleibt deutschland dauerhaft eco oder zum großen Teil war?"
    },
    {
      id: "q09",
      category: "Nationale Einstellung",
      poleA: "Einbürgerungsanträge sollten im Regelfall angenommen werden.",
      poleB: "Bewerber:innen sollten streng geprüft werden.",
      hint: "Liberale vs. restriktive Einwanderungspolitik für neue Spieler:innen."
    },
    {
      id: "q10",
      category: "Nationale Einstellung",
      poleA: "Alle dürfen ihre Fabriken frei platzieren, auch im Feindesland.",
      poleB: "Fabriken dürfen nur im eigenen Land platziert werden.",
      hint: "Embargos verhängen, nationale Produktion einfordern oder freie Marktwirtschaft?"
    },
    {
      id: "q11",
      category: "Nationale Einstellung",
      poleA: "Bündnisse sollten vor allem auf einer gemeinsamen Kultur basieren.",
      poleB: "Bündnisse sollten vor allem strategische Ziele verfolgen.",
      hint: "Venezuela oder Niederlande?"
    },
    {
      id: "q12",
      category: "Nationale Einstellung",
      poleA: "Deutschland soll forciert eigene Proxys aufbauen und unterhalten.",
      poleB: "Deutschland soll sich auf das eigene Land konzentrieren.",
      hint: "Projektion von Macht nach außen durch Marionettenstaaten vs. Innenfokus."
    },
    {
      id: "q13",
      category: "Innenpolitik",
      poleA: "Die Regierung sollte an feste Regeln gebunden sein und ihre Vorhaben transparent teilen.",
      poleB: "Um effektiv zu sein, benötigt die Regierung maximale Geheimhaltung und Spielraum.",
      hint: "Volksbeteiligung und Information vs. operative Freiheit der Exekutive."
    },
    {
      id: "q14",
      category: "Innenpolitik",
      poleA: "Minister sollten vom Volk gewählt werden.",
      poleB: "Minister werden vom Präsidenten ernannt.",
      hint: "Stärkung der direkten Demokratie vs. Effizienz durch Ernennung von Fachpersonal."
    },
    {
      id: "q15",
      category: "Innenpolitik",
      poleA: "Influencer sind eine gute Strategie, um neue Spieler:innen zu gewinnen.",
      poleB: "Influencer sind eine Gefahr für die Stabilität des Spiels.",
      hint: "Bewertung von externem Marketing und dessen Impact auf die Community-Balance."
    },
    {
      id: "q16",
      category: "Innenpolitik",
      poleA: "Entscheidungen sollten möglichst breit und demokratisch getroffen werden.",
      poleB: "Ein Diktator führt das Land ohne Regierung oder Kongress.",
      hint: "Demokratischer Konsens vs. autokratische Effizienz."
    },
    {
      id: "q17",
      category: "Sonstiges",
      poleA: "Hunde",
      poleB: "Katzen",
      hint: "Diese Frage wurde mehrfach vorgeschlagen."
    },
    {
      id: "q18",
      category: "Sonstiges",
      poleA: "Es wird eine nationale Farbe festgelegt und durchgesetzt.",
      poleB: "Es gibt freie Farbwahlen ohne negative Konsequenzen.",
      hint: "Werden Farbdiskussionen vermieden oder als Teil des Spiels akzeptiert?"
    },
    {
      id: "q19",
      category: "Sonstiges",
      poleA: "Alle Kommunikation mit dem Volk sollte im Spiel angestrebt werden.",
      poleB: "Es wird von der Mehrheit erwartet, auf Discord präsent zu sein.",
      hint: "Fokus auf die Spielmechaniken vs. Nutzung externer Tools als Standard."
    },
    {
      id: "q20",
      category: "Sonstiges",
      poleA: "Deutschland hat ein Recht darauf, eigene Moderator:innen zu stellen.",
      poleB: "Die Moderator:innen sollten unabhängig vom Spielgeschehen agieren.",
      hint: "Wie sollte sich deutschland im Umgang mit den Entwicklern positionieren?"
    }
  ],

  // ── Kandidat:innen ────────────────────────────────────────────────
  // ACHTUNG: Die Antworten (answers) wurden auf 3 (neutral) zurückgesetzt, 
  // da sich die Fragen geändert haben. Bitte neu einpflegen.
  candidates: [
    {
      id: "k-anna",
      name: "Anna Bauer",
      party: "sozial",
      answers: {
        "q01": 3, "q02": 3, "q03": 3, "q04": 3, "q05": 3,
        "q06": 3, "q07": 3, "q08": 3, "q09": 3, "q10": 3,
        "q11": 3, "q12": 3, "q13": 3, "q14": 3, "q15": 3,
        "q16": 3, "q17": 3, "q18": 3, "q19": 3, "q20": 3
      },
      statements: {
        "q01": "Anna Bauer: Roleplay ist das Herzstück unserer Community.",
        "q09": "Liberale Einbürgerung fördert die Vielfalt in unserem Land."
      }
    },
    {
      id: "k-markus",
      name: "Markus Weber",
      party: "sozial",
      answers: {
        "q01": 3, "q02": 3, "q03": 3, "q04": 3, "q05": 3,
        "q06": 3, "q07": 3, "q08": 3, "q09": 3, "q10": 3,
        "q11": 3, "q12": 3, "q13": 3, "q14": 3, "q15": 3,
        "q16": 3, "q17": 3, "q18": 3, "q19": 3, "q20": 3
      },
      statements: {
        "q02": "Markus Weber: Sprache sollte kein Hindernis für den Spielspaß sein.",
        "q15": "Influencer bringen frischen Wind, müssen aber behutsam integriert werden."
      }
    },
    {
      id: "k-petra",
      name: "Petra Hoffmann",
      party: "konserv",
      answers: {
        "q01": 3, "q02": 3, "q03": 3, "q04": 3, "q05": 3,
        "q06": 3, "q07": 3, "q08": 3, "q09": 3, "q10": 3,
        "q11": 3, "q12": 3, "q13": 3, "q14": 3, "q15": 3,
        "q16": 3, "q17": 3, "q18": 3, "q19": 3, "q20": 3
      },
      statements: {
        "q03": "Petra Hoffmann: Politische Stabilität erfordert Fokus auf die Kernaufgaben.",
        "q10": "Wirtschaftliche Sicherheit geht vor Experimente im Feindesland."
      }
    },
    {
      id: "k-thomas",
      name: "Thomas Richter",
      party: "konserv",
      answers: {
        "q01": 3, "q02": 3, "q03": 3, "q04": 3, "q05": 3,
        "q06": 3, "q07": 3, "q08": 3, "q09": 3, "q10": 3,
        "q11": 3, "q12": 3, "q13": 3, "q14": 3, "q15": 3,
        "q16": 3, "q17": 3, "q18": 3, "q19": 3, "q20": 3
      },
      statements: {
        "q04": "Thomas Richter: Strategische Bündnisse sind die Basis unserer Verteidigung.",
        "q11": "Nutzen geht vor Kultur, wenn es um das Überleben der Nation geht."
      }
    },
    {
      id: "k-lena",
      name: "Lena Grün",
      party: "gruen",
      answers: {
        "q01": 3, "q02": 3, "q03": 3, "q04": 3, "q05": 3,
        "q06": 3, "q07": 3, "q08": 3, "q09": 3, "q10": 3,
        "q11": 3, "q12": 3, "q13": 3, "q14": 3, "q15": 3,
        "q16": 3, "q17": 3, "q18": 3, "q19": 3, "q20": 3
      },
      statements: {
        "q05": "Lena Grün: Loyalität zu unseren Partnern ist unantastbar.",
        "q18": "Individuelle Freiheit bei der Farbwahl stärkt die Kreativität."
      }
    },
    {
      id: "k-jonas",
      name: "Jonas Grün",
      party: "gruen",
      answers: {
        "q01": 3, "q02": 3, "q03": 3, "q04": 3, "q05": 3,
        "q06": 3, "q07": 3, "q08": 3, "q09": 3, "q10": 3,
        "q11": 3, "q12": 3, "q13": 3, "q14": 3, "q15": 3,
        "q16": 3, "q17": 3, "q18": 3, "q19": 3, "q20": 3
      },
      statements: {
        "q06": "Jonas Grün: Wir sollten Gräben zuschütten und den Dialog suchen.",
        "q13": "Transparenz ist die Grundlage für das Vertrauen der Bürger."
      }
    },
    {
      id: "k-felix",
      name: "Felix Frei",
      party: "liberal",
      answers: {
        "q01": 3, "q02": 3, "q03": 3, "q04": 3, "q05": 3,
        "q06": 3, "q07": 3, "q08": 3, "q09": 3, "q10": 3,
        "q11": 3, "q12": 3, "q13": 3, "q14": 3, "q15": 3,
        "q16": 3, "q17": 3, "q18": 3, "q19": 3, "q20": 3
      },
      statements: {
        "q07": "Felix Frei: Wir müssen unsere Stärken auf dem Weltmarkt ausspielen.",
        "q20": "Unabhängige Moderation schützt vor politischer Einflussnahme."
      }
    },
    {
      id: "k-sara",
      name: "Sara Liberal",
      party: "liberal",
      answers: {
        "q01": 3, "q02": 3, "q03": 3, "q04": 3, "q05": 3,
        "q06": 3, "q07": 3, "q08": 3, "q09": 3, "q10": 3,
        "q11": 3, "q12": 3, "q13": 3, "q14": 3, "q15": 3,
        "q16": 3, "q17": 3, "q18": 3, "q19": 3, "q20": 3
      },
      statements: {
        "q01": "Sara Liberal: Wettbewerb der Ideen belebt das gesamte Projekt.",
        "q08": "Wirtschaftlicher Erfolg ist die Basis für alles andere."
      }
    }
  ]
};
