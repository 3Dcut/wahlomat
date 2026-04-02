// ====================================================================
// WAHL-ERA KONFIGURATION
// ====================================================================
// Dieses File bearbeiten, um Fragen, Parteien und Kandidat:innen
// anzupassen. Keine Programmierkenntnisse nötig.
//
// FRAGEN: Jede Frage hat zwei Pole (poleA und poleB).
//   poleA = linke/konservative/ablehnende Position (entspricht Wert 1)
//   poleB = rechte/progressive/befürwortende Position (entspricht Wert 5)
//   hint  = optionale Erläuterung für Nutzer:innen
//
// PARTEIEN: id, name, color (Hex). Kandidat:innen verweisen per
//   party-Feld auf die Partei-id. party: null = parteilos.
//
// KANDIDAT:INNEN: answers enthält pro Fragen-id einen Wert 1–5.
//   1 = klar Pol A · 3 = neutral · 5 = klar Pol B
//   statements = optionale Begründungen pro Frage (aufklappbar)
// ====================================================================

window.WAHLERA_DATA = {

  meta: {
    title: "Wahl-Era",
    election: "Muster-Wahl 2025",
    description: "Beantworte 20 Fragen und finde heraus, welche Kandidat:innen und Parteien am besten zu dir passen."
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
      category: "Wirtschaft",
      poleA: "Der Mindestlohn soll auf dem aktuellen Niveau eingefroren werden.",
      poleB: "Der Mindestlohn soll auf mindestens 15 Euro pro Stunde angehoben werden.",
      hint: "Der aktuelle Mindestlohn liegt bei 12,41 Euro. Eine Anhebung entlastet Niedriglohnbeschäftigte, könnte aber laut Kritikern Arbeitsplätze kosten."
    },
    {
      id: "q02",
      category: "Wirtschaft",
      poleA: "Unternehmenssteuern sollen gesenkt werden, um Wachstum zu fördern.",
      poleB: "Unternehmen sollen stärker besteuert werden, um öffentliche Güter zu finanzieren.",
      hint: "Deutschland hat im internationalen Vergleich hohe Unternehmenssteuern. Senkungen könnten Investitionen anziehen, Erhöhungen könnten Staatseinnahmen steigern."
    },
    {
      id: "q03",
      category: "Wirtschaft",
      poleA: "Die Schuldenbremse soll unverändert bleiben – keine neuen Staatsschulden.",
      poleB: "Der Staat soll mehr in Infrastruktur investieren, auch wenn dafür neue Schulden nötig sind.",
      hint: "Die Schuldenbremse begrenzt die Neuverschuldung auf 0,35 % des BIP. Befürworter sehen sie als Haushaltsdisziplin, Kritiker als Investitionsbremse."
    },
    {
      id: "q04",
      category: "Klimaschutz",
      poleA: "Der Kohleausstieg soll wie geplant erst 2038 erfolgen.",
      poleB: "Der Kohleausstieg soll auf 2030 vorgezogen werden.",
      hint: "Ein früherer Kohleausstieg würde den CO₂-Ausstoß schneller senken, belastet aber Energieversorgung und Beschäftigung in Kohleregionen."
    },
    {
      id: "q05",
      category: "Klimaschutz",
      poleA: "Ein hoher CO₂-Preis schadet der Wirtschaft und soll abgelehnt werden.",
      poleB: "Ein CO₂-Preis von mindestens 100 Euro pro Tonne soll eingeführt werden.",
      hint: "Ein höherer CO₂-Preis verteuert fossile Energie und schafft Anreize für klimafreundliches Verhalten, belastet aber einkommensschwache Haushalte stärker."
    },
    {
      id: "q06",
      category: "Klimaschutz",
      poleA: "Das Verbrennerverbot für Neuwagen soll verhindert oder aufgehoben werden.",
      poleB: "Neuzulassungen von Autos mit Verbrennungsmotor sollen ab 2030 verboten werden.",
      hint: "Die EU plant ein De-facto-Verbot ab 2035. Ein früheres Verbot würde die Transformation der Automobilindustrie beschleunigen."
    },
    {
      id: "q07",
      category: "Soziales",
      poleA: "Das Renteneintrittsalter soll bei 67 Jahren bleiben.",
      poleB: "Das Renteneintrittsalter soll auf 70 Jahre angehoben werden.",
      hint: "Angesichts des demografischen Wandels sehen Befürworter einer Anhebung dies als notwendig für die Finanzierbarkeit. Kritiker verweisen auf körperlich belastende Berufe."
    },
    {
      id: "q08",
      category: "Soziales",
      poleA: "Ein bedingungsloses Grundeinkommen ist nicht finanzierbar und abzulehnen.",
      poleB: "Ein bedingungsloses Grundeinkommen soll eingeführt werden.",
      hint: "Ein Grundeinkommen garantiert jedem Bürger einen festen Betrag, unabhängig von Arbeit. Die Finanzierbarkeit und Auswirkungen auf den Arbeitsmarkt sind umstritten."
    },
    {
      id: "q09",
      category: "Soziales",
      poleA: "Eine Vermögenssteuer schadet dem Wirtschaftsstandort und soll abgelehnt werden.",
      poleB: "Große Vermögen sollen durch eine Vermögenssteuer stärker besteuert werden.",
      hint: "Deutschland hatte bis 1997 eine Vermögenssteuer. Befürworter sehen sie als Beitrag zur Umverteilung, Kritiker warnen vor Kapitalflucht."
    },
    {
      id: "q10",
      category: "Migration",
      poleA: "Zuwanderung aus Nicht-EU-Ländern soll stärker begrenzt werden.",
      poleB: "Die Zuwanderung von Fachkräften aus Nicht-EU-Ländern soll erleichtert werden.",
      hint: "Deutschland hat einen wachsenden Fachkräftemangel. Vereinfachte Einwanderungsregeln könnten diesen mildern, erfordern aber Integrationsmaßnahmen."
    },
    {
      id: "q11",
      category: "Migration",
      poleA: "Abgelehnte Asylbewerber sollen konsequenter und schneller abgeschoben werden.",
      poleB: "Abschiebungen sollen auf ein Minimum reduziert werden, humanitäre Gründe haben Vorrang.",
      hint: "Aktuell wird nur ein Bruchteil der ausreisepflichtigen Personen tatsächlich abgeschoben. Das Thema ist juristisch und humanitär komplex."
    },
    {
      id: "q12",
      category: "Migration",
      poleA: "Geflüchtete sollen erst nach abgeschlossenem Asylverfahren arbeiten dürfen.",
      poleB: "Geflüchtete sollen sofort nach Ankunft eine Arbeitserlaubnis erhalten.",
      hint: "Frühere Arbeitserlaubnisse fördern Integration und entlasten den Arbeitsmarkt, werfen aber auch Fragen zur Priorisierung von Asylverfahren auf."
    },
    {
      id: "q13",
      category: "Bildung",
      poleA: "Studiengebühren sollen von den Ländern selbst entschieden werden dürfen.",
      poleB: "Studiengebühren sollen bundesweit per Gesetz verboten werden.",
      hint: "In Deutschland sind Studiengebühren weitgehend abgeschafft. Ein bundesweites Verbot würde Länder daran hindern, sie wieder einzuführen."
    },
    {
      id: "q14",
      category: "Bildung",
      poleA: "Schulen sollen weiterhin überwiegend als Halbtagsschulen geführt werden.",
      poleB: "Ganztagsschulen sollen flächendeckend ausgebaut und verpflichtend eingeführt werden.",
      hint: "Ganztagsschulen verbessern laut Studien Bildungschancen und entlasten Familien, erfordern aber erhebliche Investitionen in Personal und Infrastruktur."
    },
    {
      id: "q15",
      category: "Digitalisierung",
      poleA: "Der Glasfaserausbau soll dem Markt überlassen bleiben – ohne staatliche Subventionen.",
      poleB: "Der Staat soll den flächendeckenden Glasfaserausbau aktiv finanzieren.",
      hint: "Deutschland hinkt beim Glasfaserausbau hinter anderen Ländern her. Staatliche Förderung könnte dies beschleunigen, ist aber teuer."
    },
    {
      id: "q16",
      category: "Digitalisierung",
      poleA: "KI in der Verwaltung soll möglichst frei einsetzbar sein – weniger Regulierung.",
      poleB: "Künstliche Intelligenz in öffentlichen Verwaltungen soll streng reguliert werden.",
      hint: "KI kann Verwaltungsprozesse effizienter machen, birgt aber Risiken für Datenschutz und diskriminierungsfreie Entscheidungen."
    },
    {
      id: "q17",
      category: "Sicherheit",
      poleA: "Videoüberwachung im öffentlichen Raum schränkt Freiheiten ein und soll begrenzt werden.",
      poleB: "Videoüberwachung im öffentlichen Raum soll deutlich ausgebaut werden.",
      hint: "Mehr Kameras können Sicherheitsgefühl erhöhen und Strafverfolgung erleichtern, schränken aber Privatsphäre und Anonymität ein."
    },
    {
      id: "q18",
      category: "Sicherheit",
      poleA: "Der Verteidigungshaushalt soll reduziert und das Geld in Soziales investiert werden.",
      poleB: "Der Verteidigungshaushalt soll dauerhaft auf mindestens 2 % des BIP angehoben werden.",
      hint: "Das NATO-Ziel von 2 % BIP für Verteidigung ist politisch umstritten. Befürworter sehen es als notwendig für kollektive Sicherheit."
    },
    {
      id: "q19",
      category: "Gesundheit",
      poleA: "Das duale System aus gesetzlicher und privater Krankenversicherung soll erhalten bleiben.",
      poleB: "Gesetzliche und private Krankenversicherung sollen zu einer Bürgerversicherung zusammengelegt werden.",
      hint: "Eine Bürgerversicherung würde alle Einkommensarten einbeziehen. Privatversicherungen und Ärzte befürchten Einnahmeeinbußen."
    },
    {
      id: "q20",
      category: "Europa",
      poleA: "Nationale Souveränität hat Vorrang – die EU soll weniger Kompetenzen erhalten.",
      poleB: "Die EU soll mehr Kompetenzen bekommen, auch wenn das nationale Souveränität kostet.",
      hint: "Mehr europäische Integration kann grenzüberschreitende Probleme effektiver lösen, schwächt aber die Entscheidungshoheit der Mitgliedstaaten."
    }
  ],

  // ── Kandidat:innen ────────────────────────────────────────────────
  candidates: [
    // ── Sozialdemokraten (2 Kandidat:innen)
    {
      id: "k-anna",
      name: "Anna Bauer",
      party: "sozial",
      color: "#E3000F",
      answers: {
        "q01": 5, "q02": 4, "q03": 5, "q04": 4, "q05": 4,
        "q06": 4, "q07": 2, "q08": 3, "q09": 5, "q10": 4,
        "q11": 2, "q12": 4, "q13": 5, "q14": 4, "q15": 4,
        "q16": 4, "q17": 2, "q18": 3, "q19": 5, "q20": 4
      },
      statements: {
        "q01": "Wir setzen uns für einen fairen Lohn ein, von dem man tatsächlich leben kann.",
        "q09": "Große Vermögen müssen stärker zur Finanzierung des Gemeinwesens beitragen."
      }
    },
    {
      id: "k-markus",
      name: "Markus Weber",
      party: "sozial",
      color: "#E3000F",
      answers: {
        "q01": 4, "q02": 3, "q03": 5, "q04": 4, "q05": 3,
        "q06": 3, "q07": 2, "q08": 4, "q09": 4, "q10": 5,
        "q11": 2, "q12": 5, "q13": 5, "q14": 5, "q15": 4,
        "q16": 3, "q17": 3, "q18": 3, "q19": 5, "q20": 4
      },
      statements: {
        "q08": "Ein Grundeinkommen kann soziale Absicherung modernisieren – wir prüfen Modelle.",
        "q10": "Fachkräfteeinwanderung ist eine Chance für unsere Wirtschaft."
      }
    },

    // ── Konservative (2 Kandidat:innen)
    {
      id: "k-petra",
      name: "Petra Hoffmann",
      party: "konserv",
      color: "#1a1a2e",
      answers: {
        "q01": 2, "q02": 5, "q03": 2, "q04": 2, "q05": 1,
        "q06": 1, "q07": 4, "q08": 1, "q09": 1, "q10": 3,
        "q11": 5, "q12": 2, "q13": 3, "q14": 3, "q15": 2,
        "q16": 2, "q17": 5, "q18": 5, "q19": 1, "q20": 2
      },
      statements: {
        "q02": "Niedrigere Steuern stärken den Wirtschaftsstandort Deutschland.",
        "q11": "Wer kein Bleiberecht hat, muss konsequent das Land verlassen."
      }
    },
    {
      id: "k-thomas",
      name: "Thomas Richter",
      party: "konserv",
      color: "#1a1a2e",
      answers: {
        "q01": 2, "q02": 4, "q03": 1, "q04": 1, "q05": 2,
        "q06": 2, "q07": 5, "q08": 1, "q09": 1, "q10": 4,
        "q11": 5, "q12": 2, "q13": 2, "q14": 2, "q15": 3,
        "q16": 2, "q17": 4, "q18": 5, "q19": 2, "q20": 2
      },
      statements: {
        "q03": "Die Schuldenbremse schützt zukünftige Generationen vor Schuldenlast.",
        "q18": "Sicherheit kostet Geld – Verteidigungsausgaben sind eine Investition in Frieden."
      }
    },

    // ── Grüne (2 Kandidat:innen)
    {
      id: "k-lena",
      name: "Lena Grün",
      party: "gruen",
      color: "#1AA037",
      answers: {
        "q01": 4, "q02": 2, "q03": 4, "q04": 5, "q05": 5,
        "q06": 5, "q07": 1, "q08": 4, "q09": 4, "q10": 5,
        "q11": 2, "q12": 5, "q13": 5, "q14": 5, "q15": 5,
        "q16": 5, "q17": 1, "q18": 2, "q19": 4, "q20": 5
      },
      statements: {
        "q04": "Der Kohleausstieg 2030 ist für das Klima unbedingt notwendig.",
        "q06": "Elektromobilität ist die Zukunft – wir müssen jetzt handeln."
      }
    },
    {
      id: "k-jonas",
      name: "Jonas Grün",
      party: "gruen",
      color: "#1AA037",
      answers: {
        "q01": 5, "q02": 1, "q03": 5, "q04": 5, "q05": 5,
        "q06": 5, "q07": 1, "q08": 5, "q09": 5, "q10": 5,
        "q11": 1, "q12": 5, "q13": 5, "q14": 5, "q15": 5,
        "q16": 5, "q17": 1, "q18": 1, "q19": 5, "q20": 5
      },
      statements: {
        "q08": "Ein Grundeinkommen gibt Menschen echte Freiheit – wir wollen es erproben.",
        "q18": "Sicherheit schafft man durch Diplomatie, nicht durch Aufrüstung."
      }
    },

    // ── Liberale (2 Kandidat:innen)
    {
      id: "k-felix",
      name: "Felix Frei",
      party: "liberal",
      color: "#c8a200",
      answers: {
        "q01": 3, "q02": 5, "q03": 2, "q04": 3, "q05": 3,
        "q06": 3, "q07": 3, "q08": 2, "q09": 2, "q10": 5,
        "q11": 3, "q12": 4, "q13": 2, "q14": 3, "q15": 3,
        "q16": 1, "q17": 3, "q18": 4, "q19": 2, "q20": 4
      },
      statements: {
        "q10": "Fachkräfteeinwanderung ist der Schlüssel für unsere Wirtschaft.",
        "q16": "Bürokratische Regulierung von KI bremst Innovation und Fortschritt."
      }
    },
    {
      id: "k-sara",
      name: "Sara Liberal",
      party: "liberal",
      color: "#c8a200",
      answers: {
        "q01": 2, "q02": 5, "q03": 2, "q04": 2, "q05": 2,
        "q06": 2, "q07": 4, "q08": 1, "q09": 1, "q10": 5,
        "q11": 4, "q12": 4, "q13": 1, "q14": 2, "q15": 4,
        "q16": 1, "q17": 3, "q18": 4, "q19": 1, "q20": 5
      },
      statements: {
        "q02": "Markt statt Staat – Steuersenkungen schaffen Wachstum für alle.",
        "q20": "Ein starkes Europa ist unser wichtigster geopolitischer Wettbewerbsvorteil."
      }
    }
  ]
};
