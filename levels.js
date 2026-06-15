/**
 * Levels configuration for the gamified Kletterpark learning environment
 */

const KLETTERPARK_LEVELS = [
    {
        id: 1,
        title: "Level 1: Koordinaten im Raum einmessen",
        theme: "Punkte & Ortsvektoren",
        email: {
            sender: "Vermessungsbüro Höhen & Weiten GmbH <info@hoehen-weiten.de>",
            subject: "Vermessungsdaten Kletterwald - Parzelle A-C",
            date: "15. Juni 2026",
            body: `Sehr geehrtes Planungsteam,
<br><br>
wir haben die Vermessung der drei Trägerbäume für den neuen Parcoursabschnitt abgeschlossen. Die Standorte wurden bezüglich des lokalen Koordinatenursprungs (Eingangshäuschen bei $O(0|0|0)$) erfasst.
<br><br>
Bitte berechnen Sie die genauen Positionen der Plattformen $A$, $B$ und $C$ anhand der folgenden relationalen Vorgaben unseres Statikers:
<br><br>
1. **Plattform $A$**: Steht am Trägerbaum A bei $x_A = 2\\text{ m}$ und $y_A = 3\\text{ m}$. Die Montagehöhe beträgt $z_A = 2\\text{ m}$.
<br>
2. **Plattform $B$**: Befindet sich an Baum B bei $x_B = 8\\text{ m}$. Die $y$-Koordinate von $B$ liegt genau $1\\text{ m}$ näher an der Hauptachse ($y=0$) als die von Plattform $A$. Die Höhe $z_B$ soll **genau doppelt so hoch** montiert werden wie Plattform $A$.
<br>
3. **Plattform $C$**: Steht an Baum C. Die $x$-Koordinate von $C$ liegt genau in der Mitte zwischen $x_A$ und $x_B$. Die Breite $y_C$ ist um $4\\text{ m}$ größer als die Breite $y_A$. Die Höhe $z_C$ ist **genau $1\\text{ m}$ niedriger** als die Höhe $z_B$.
<br><br>
Bitte ermitteln Sie die Koordinaten der drei Plattformen und tragen Sie diese in Ihr Modellierungssystem ein, um das 3D-Gerüst zu generieren.
<br><br>
Mit freundlichen Grüßen,<br>
i.A. Jens Wagner, Vermessungsingenieur`
        },
        taskDescription: "Berechne die Koordinaten der Plattformen $A(x_A|y_A|z_A)$, $B(x_B|y_B|z_B)$ und $C(x_C|y_C|z_C)$ anhand der E-Mail-Vorgaben und trage sie ein.",
        setup: {
            platformsToShow: [] // Start empty, show geister points (semi-transparent spheres) where they should place them
        },
        target: {
            platforms: [
                { name: 'A', x: 2, y: 3, z: 2 },
                { name: 'B', x: 8, y: 2, z: 4 },
                { name: 'C', x: 5, y: 7, z: 3 }
            ]
        },
        inputs: [
            { id: 'a_x', label: '$x_A$', type: 'number', expected: 2 },
            { id: 'a_y', label: '$y_A$', type: 'number', expected: 3 },
            { id: 'a_z', label: '$z_A$', type: 'number', expected: 2 },
            { id: 'b_x', label: '$x_B$', type: 'number', expected: 8 },
            { id: 'b_y', label: '$y_B$', type: 'number', expected: 2 },
            { id: 'b_z', label: '$z_B$', type: 'number', expected: 4 },
            { id: 'c_x', label: '$x_C$', type: 'number', expected: 5 },
            { id: 'c_y', label: '$y_C$', type: 'number', expected: 7 },
            { id: 'c_z', label: '$z_C$', type: 'number', expected: 3 }
        ],
        helpCards: [
            {
                title: "3D-Koordinaten im Raum",
                content: "Ein Punkt im Raum wird durch ein geordnetes Tripel $P(x|y|z)$ beschrieben.<br>• $x$-Achse: Tiefe (nach vorne/hinten)<br>• $y$-Achse: Breite (nach links/rechts)<br>• $z$-Achse: Höhe (nach oben/unten)"
            }
        ]
    },
    {
        id: 2,
        title: "Level 2: Materialbestellung für Seil AB",
        theme: "Verbindungsvektoren & Längen",
        email: {
            sender: "Einkauf & Materialbeschaffung KletterFun GmbH <einkauf@kletterfun.de>",
            subject: "Materialbestellung Tragseil für Parcours-Abschnitt A-B",
            date: "16. Juni 2026",
            body: `Hallo Planungsteam,

für die Materialbestellung des ersten Kletterelements zwischen Plattform A und Plattform B benötigen wir dringend die genaue Zuschnittlänge des Stahlseils in Metern. 

Zudem benötigt die Werkstatt die dreidimensionale Ausrichtung (den Richtungsverlauf von A nach B als Differenzvektor), um die Seilklemmen vorzumontieren. 

Bitte berechnet uns diese Werte kurzfristig, damit wir die Bestellung abschicken können.

Viele Grüße,
Sabine Meier, Materialbeschaffung`
        },
        taskDescription: "Berechne den Verbindungsvektor $\\vec{v} = \\overrightarrow{AB}$ sowie die exakte Seillänge $|\\vec{v}|$.",
        setup: {
            platforms: [
                { name: 'A', x: 2, y: 3, z: 2 },
                { name: 'B', x: 8, y: 2, z: 4 },
                { name: 'C', x: 5, y: 7, z: 3 }
            ],
            ropes: []
        },
        target: {
            vector: [6, -1, 2],
            length: 6.40
        },
        inputs: [
            { id: 'v_x', label: 'v_x', type: 'number', expected: 6 },
            { id: 'v_y', label: 'v_y', type: 'number', expected: -1 },
            { id: 'v_z', label: 'v_z', type: 'number', expected: 2 },
            { id: 'v_len', label: 'Seillänge (in m, 2 Nachkommastellen)', type: 'number', expected: 6.40, tolerance: 0.05 }
        ],
        helpCards: [
            {
                title: "Verbindungsvektor berechnen",
                content: "Der Verbindungsvektor zwischen zwei Punkten $A(a_1|a_2|a_3)$ und $B(b_1|b_2|b_3)$ berechnet sich durch 'Spitze minus Anfang':\n$$\\overrightarrow{AB} = \\begin{pmatrix} b_1 - a_1 \\\\ b_2 - a_2 \\\\ b_3 - a_3 \\end{pmatrix}$$"
            },
            {
                title: "Vektorlänge (Betrag)",
                content: "Die Länge (der Betrag) eines Vektors $\\vec{v} = \\begin{pmatrix} v_x \\\\ v_y \\\\ v_z \\end{pmatrix}$ entspricht dem Abstand der Punkte und wird berechnet durch:\n$$|\\vec{v}| = \\sqrt{v_x^2 + v_y^2 + v_z^2}$$"
            }
        ]
    },
    {
        id: 3,
        title: "Level 3: Behördliche Flugsicherheitsprüfung",
        theme: "Geradengleichungen in Parameterform",
        email: {
            sender: "Bauaufsichtsamt der Stadt <bauaufsicht@stadt.de>",
            subject: "Rettungswege- und Flugsicherheitsnachweis für Seillinie A-C",
            date: "17. Juni 2026",
            body: `Sehr geehrte Planerinnen und Planer,

für die baurechtliche Freigabe des Seils zwischen Plattform A und Plattform C benötigen wir die mathematische Trägergerade im Raum. 

Bei eventuellen Rettungseinsätzen mit Hubschraubern müssen wir prüfen, ob die unendliche Flugbahn dieser Verbindung freizuhalten ist. Bitte übermitteln Sie uns die Geradengleichung in der Standard-Parameterform:
$$\\vec{x} = \\vec{a} + r \\cdot \\vec{u}$$
Nutzen Sie Plattform A als Aufpunkt (Stützvektor) und den Verbindungsvektor $\\overrightarrow{AC}$ als Richtungsvektor.

Mit freundlichen Grüßen,
Dr. Hubertus Kron, Bauaufsichtsamt`
        },
        taskDescription: "Bestimme den Stützvektor $\\vec{a}$ und den Richtungsvektor $\\vec{u}$ für die Gerade des Seils AC.",
        setup: {
            platforms: [
                { name: 'A', x: 2, y: 3, z: 2 },
                { name: 'B', x: 8, y: 2, z: 4 },
                { name: 'C', x: 5, y: 7, z: 3 }
            ],
            ropes: [
                { name: 'AB', start: 'A', end: 'B' }
            ]
        },
        target: {
            support: [2, 3, 2],
            direction: [3, 4, 1]
        },
        inputs: [
            { id: 's_x', label: 'Stützvektor a_x', type: 'number', expected: 2 },
            { id: 's_y', label: 'Stützvektor a_y', type: 'number', expected: 3 },
            { id: 's_z', label: 'Stützvektor a_z', type: 'number', expected: 2 },
            { id: 'd_x', label: 'Richtungsvektor u_x', type: 'number', expected: 3 },
            { id: 'd_y', label: 'Richtungsvektor u_y', type: 'number', expected: 4 },
            { id: 'd_z', label: 'Richtungsvektor u_z', type: 'number', expected: 1 }
        ],
        helpCards: [
            {
                title: "Geradengleichung aufstellen",
                content: "Eine Gerade $g$ im Raum wird durch einen Stützvektor $\\vec{a}$ (Ortsvektor eines Punktes auf der Geraden, z.B. $A$) und einen Richtungsvektor $\\vec{u}$ (Verbindungsvektor zwischen zwei Punkten, z.B. $\\overrightarrow{AC}$) beschrieben:\n$$g: \\vec{x} = \\vec{a} + r \\cdot \\vec{u}$$"
            }
        ]
    },
    {
        id: 4,
        title: "Level 4: Naturschutzauflage – Ast-Kollision",
        theme: "Punktprobe im Raum",
        email: {
            sender: "Forstamt & Untere Naturschutzbehörde <forstamt@kreis.de>",
            subject: "Naturschutzauflage: Eichenast im Bereich der Seillinie A-C",
            date: "18. Juni 2026",
            body: `Sehr geehrte Planungsleitung,

bei der waldökologischen Begutachtung der Parzelle AC wurde festgestellt, dass ein Ast einer geschützten Eiche sehr nah an der geplanten Seillinie liegt. 

Der Ast befindet sich an der Koordinate $P(5 \\mid 7 \\mid 3)$. Bitte prüfen Sie rechnerisch anhand Ihrer Geradengleichung des Seils AC ($g: \\vec{x} = \\vec{a} + r \\cdot \\vec{u}$), ob das Seil exakt durch diesen Ast verläuft (Kollision) oder ob es daran vorbeiführt. 

Sollte das Seil den Ast treffen, teilen Sie uns mit, bei welchem Parameterwert $r$ dies der Fall ist, damit wir ggf. eine Ausnahmegenehmigung prüfen können.

Mit freundlichen Grüßen,
Revierförster Peter Forst`
        },
        taskDescription: "Führe eine Punktprobe für den Punkt $P(5|7|3)$ auf der Geraden $g: \\vec{x} = \\begin{pmatrix} 2 \\\\ 3 \\\\ 2 \\end{pmatrix} + r \\cdot \\begin{pmatrix} 3 \\\\ 4 \\\\ 1 \\end{pmatrix}$ durch.",
        setup: {
            platforms: [
                { name: 'A', x: 2, y: 3, z: 2 },
                { name: 'B', x: 8, y: 2, z: 4 },
                { name: 'C', x: 5, y: 7, z: 3 }
            ],
            ropes: [
                { name: 'AB', start: 'A', end: 'B' },
                { name: 'AC', start: 'A', end: 'C' }
            ],
            obstacle: { name: 'Ast P', x: 5, y: 7, z: 3 } // Hits exactly at r = 1
        },
        target: {
            hits: true,
            r: 1
        },
        inputs: [
            { id: 'collision', label: 'Trifft das Seil den Ast?', type: 'select', options: [
                { value: '', label: '-- Bitte wählen --' },
                { value: 'yes', label: 'Ja, es gibt eine Kollision' },
                { value: 'no', label: 'Nein, das Seil läuft sicher vorbei' }
            ], expected: 'yes' },
            { id: 'param_r', label: 'Parameterwert r (wenn ja)', type: 'number', expected: 1 }
        ],
        helpCards: [
            {
                title: "Die Punktprobe",
                content: "Um zu prüfen, ob ein Punkt $P(p_1|p_2|p_3)$ auf einer Geraden $g: \\vec{x} = \\vec{a} + r \\cdot \\vec{u}$ liegt, setzt man den Ortsvektor $\\vec{p}$ für $\\vec{x}$ ein:\n$$\\begin{pmatrix} p_1 \\\\ p_2 \\\\ p_3 \\end{pmatrix} = \\begin{pmatrix} a_1 \\\\ a_2 \\\\ a_3 \\end{pmatrix} + r \\cdot \\begin{pmatrix} u_1 \\\\ u_2 \\\\ u_3 \\end{pmatrix}$$\n\nDaraus entstehen drei Gleichungen. Löse eine Gleichung nach $r$ auf und prüfe, ob dieser Wert auch die anderen beiden Gleichungen erfüllt. Wenn ja, liegt der Punkt auf der Geraden."
            }
        ]
    },
    {
        id: 5,
        title: "Level 5: Parallelparcours einrichten",
        theme: "Lagebeziehungen & Kollinearität",
        email: {
            sender: "Betreibergesellschaft KletterFun GmbH <geschaeftsfuehrung@kletterfun.de>",
            subject: "Planung des parallelen Übungsparcours D-F",
            date: "19. Juni 2026",
            body: `Hallo!

Aus Sicherheits- und Trainingsgründen soll direkt neben dem ersten Hauptseil AB ein absolut paralleles Übungsseil DF gespannt werden. 

Plattform D wurde bereits am Baum D bei $D(2 \\mid 6 \\mid 2)$ errichtet. Die Plattform F wurde auf Baum F bei $x = 5\\text{ m}$ und Höhe $z = 3\\text{ m}$ montiert. Leider fehlt uns in den Unterlagen die Angabe der y-Koordinate für Plattform F.

Berechnen Sie die fehlende Koordinate $y_F$ so, dass die Verbindung DF exakt parallel zur Verbindung AB verläuft. Ermitteln Sie zudem den Skalierungsfaktor $k$ der beiden Richtungsvektoren (wobei $\\overrightarrow{DF} = k \\cdot \\overrightarrow{AB}$).

Sportliche Grüße,
Ralf Kletter, Geschäftsführer`
        },
        taskDescription: "Berechne die Koordinate $y_F$ für Plattform F und den Streckfaktor $k$, so dass $\\overrightarrow{DF} = k \\cdot \\overrightarrow{AB}$ gilt.",
        setup: {
            platforms: [
                { name: 'A', x: 2, y: 3, z: 2 },
                { name: 'B', x: 8, y: 2, z: 4 },
                { name: 'C', x: 5, y: 7, z: 3 },
                { name: 'D', x: 2, y: 6, z: 2 }
            ],
            ropes: [
                { name: 'AB', start: 'A', end: 'B' },
                { name: 'AC', start: 'A', end: 'C' }
            ],
            platformsToShow: [
                { name: 'F', x: 5, y: 5.5, z: 3, ghost: true } // Visual ghost point to assist visual thinking
            ]
        },
        target: {
            y_f: 5.5,
            k: 0.5
        },
        inputs: [
            { id: 'y_f', label: 'y-Koordinate von Plattform F', type: 'number', expected: 5.5 },
            { id: 'factor_k', label: 'Skalierungsfaktor k (Zahl)', type: 'number', expected: 0.5 }
        ],
        helpCards: [
            {
                title: "Parallelität & Kollinearität",
                content: "Zwei Geraden sind parallel, wenn ihre Richtungsvektoren $\\vec{u}$ und $\\vec{w}$ kollinear sind. Das bedeutet, der eine Vektor ist ein Vielfaches des anderen:\n$$\\vec{w} = k \\cdot \\vec{u}$$\n\nSetze dies koordinatenweise an und berechne den Faktor $k$ für eine bekannte Koordinate. Nutze dieses $k$, um die fehlenden Koordinaten zu bestimmen."
            }
        ]
    }
];

// Export
window.KLETTERPARK_LEVELS = KLETTERPARK_LEVELS;
