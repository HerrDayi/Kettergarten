/**
 * Math Solver for 3D Vector Geometry (Kletterpark Model)
 * Tailored for German high school level (EF / Einführungsphase).
 */

class MathSolver {
    /**
     * Cross product of two 3D vectors
     */
    static crossProduct(u, w) {
        return [
            u[1] * w[2] - u[2] * w[1],
            u[2] * w[0] - u[0] * w[2],
            u[0] * w[1] - u[1] * w[0]
        ];
    }

    /**
     * Dot product of two 3D vectors
     */
    static dotProduct(u, w) {
        return u[0] * w[0] + u[1] * w[1] + u[2] * w[2];
    }

    /**
     * Vector length (magnitude)
     */
    static magnitude(v) {
        return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    }

    /**
     * Check if two vectors are collinear (u = k * w)
     */
    static checkCollinearity(u, w, tolerance = 1e-4) {
        const cross = this.crossProduct(u, w);
        const lenCross = this.magnitude(cross);
        const lenU = this.magnitude(u);
        const lenW = this.magnitude(w);
        
        if (lenU < tolerance || lenW < tolerance) return { collinear: true, k: 0 };
        
        // If cross product magnitude is close to 0, they are collinear
        const collinear = lenCross / (lenU * lenW) < tolerance;
        
        // Find scale factor k
        let k = null;
        for (let i = 0; i < 3; i++) {
            if (Math.abs(w[i]) > tolerance) {
                k = u[i] / w[i];
                break;
            }
        }
        
        return { collinear, k };
    }

    /**
     * Format a vector as a LaTeX-like HTML string or plain text
     */
    static formatVector(v, decimals = 2) {
        const f = val => Number(val.toFixed(decimals)).toString().replace('.', ',');
        return `\\begin{pmatrix} ${f(v[0])} \\\\ ${f(v[1])} \\\\ ${f(v[2])} \\end{pmatrix}`;
    }

    /**
     * Solves the relation between two ropes/lines in 3D:
     * Line 1: g(r) = P1 + r * U
     * Line 2: h(s) = P2 + s * W
     * 
     * Ropes are segments from r in [0, 1] and s in [0, 1].
     */
    static analyzeLagebeziehung(rope1, rope2, tolerance = 1e-4) {
        const P1 = rope1.start;
        const U = rope1.vector;
        const P2 = rope2.start;
        const W = rope2.vector;

        const explanationSteps = [];
        explanationSteps.push(`<h3>Untersuchung von Seil ${rope1.name} und Seil ${rope2.name}</h3>`);
        
        // Setup line equations
        explanationSteps.push(`
            <p><strong>1. Geradengleichungen aufstellen:</strong></p>
            <p>Seil ${rope1.name} ($g$): $\\vec{x} = \\begin{pmatrix} ${P1[0].toFixed(1).replace('.', ',')} \\\\ ${P1[1].toFixed(1).replace('.', ',')} \\\\ ${P1[2].toFixed(1).replace('.', ',')} \\end{pmatrix} + r \\cdot \\begin{pmatrix} ${U[0].toFixed(1).replace('.', ',')} \\\\ ${U[1].toFixed(1).replace('.', ',')} \\\\ ${U[2].toFixed(1).replace('.', ',')} \\end{pmatrix}$ mit $r \\in [0, 1]$</p>
            <p>Seil ${rope2.name} ($h$): $\\vec{x} = \\begin{pmatrix} ${P2[0].toFixed(1).replace('.', ',')} \\\\ ${P2[1].toFixed(1).replace('.', ',')} \\\\ ${P2[2].toFixed(1).replace('.', ',')} \\end{pmatrix} + s \\cdot \\begin{pmatrix} ${W[0].toFixed(1).replace('.', ',')} \\\\ ${W[1].toFixed(1).replace('.', ',')} \\\\ ${W[2].toFixed(1).replace('.', ',')} \\end{pmatrix}$ mit $s \\in [0, 1]$</p>
        `);

        // Step 1: Check Collinearity of direction vectors
        explanationSteps.push(`<p><strong>2. Richtungsvektoren auf Kollinearität prüfen:</strong></p>`);
        explanationSteps.push(`<p>Untersuche, ob $\\vec{u} = k \\cdot \\vec{w}$ gilt:</p>`);
        explanationSteps.push(`<p>$\\begin{pmatrix} ${U[0].toFixed(1).replace('.', ',')} \\\\ ${U[1].toFixed(1).replace('.', ',')} \\\\ ${U[2].toFixed(1).replace('.', ',')} \\end{pmatrix} = k \\cdot \\begin{pmatrix} ${W[0].toFixed(1).replace('.', ',')} \\\\ ${W[1].toFixed(1).replace('.', ',')} \\\\ ${W[2].toFixed(1).replace('.', ',')} \\end{pmatrix}$</p>`);

        const collResult = this.checkCollinearity(U, W, tolerance);
        
        if (collResult.collinear) {
            const kStr = Number(collResult.k.toFixed(2)).toString().replace('.', ',');
            explanationSteps.push(`
                <p class="math-success">Die Richtungsvektoren sind kollinear (vielfache voneinander) mit Faktor $k \\approx ${kStr}$.</p>
                <p><strong>3. Punktprobe durchführen (liegt Startpunkt von Seil ${rope2.name} auf der Geraden von Seil ${rope1.name}?):</strong></p>
                <p>Setze $P_2 = (${P2[0].toFixed(1).replace('.', ',')}|${P2[1].toFixed(1).replace('.', ',')}|${P2[2].toFixed(1).replace('.', ',')})$ in die Gleichung von $g$ ein:</p>
                <p>$\\begin{pmatrix} ${P2[0].toFixed(1).replace('.', ',')} \\\\ ${P2[1].toFixed(1).replace('.', ',')} \\\\ ${P2[2].toFixed(1).replace('.', ',')} \\end{pmatrix} = \\begin{pmatrix} ${P1[0].toFixed(1).replace('.', ',')} \\\\ ${P1[1].toFixed(1).replace('.', ',')} \\\\ ${P1[2].toFixed(1).replace('.', ',')} \\end{pmatrix} + r \\cdot \\begin{pmatrix} ${U[0].toFixed(1).replace('.', ',')} \\\\ ${U[1].toFixed(1).replace('.', ',')} \\\\ ${U[2].toFixed(1).replace('.', ',')} \\end{pmatrix}$</p>
            `);

            // Solve for r coordinate-wise
            let rValues = [];
            let possible = true;
            let explanationPP = '<ul>';
            
            for (let i = 0; i < 3; i++) {
                const diff = P2[i] - P1[i];
                if (Math.abs(U[i]) < tolerance) {
                    if (Math.abs(diff) > tolerance) {
                        explanationPP += `<li>Koordinate ${i+1} ($x, y, z$[${i}]): $${P2[i].toFixed(1).replace('.', ',')} = ${P1[i].toFixed(1).replace('.', ',')} + r \\cdot 0 \\implies$ Widerspruch ($${P2[i].toFixed(1).replace('.', ',')} \\neq ${P1[i].toFixed(1).replace('.', ',')}$)</li>`;
                        possible = false;
                    } else {
                        explanationPP += `<li>Koordinate ${i+1}: $${P2[i].toFixed(1).replace('.', ',')} = ${P1[i].toFixed(1).replace('.', ',')} + r \\cdot 0 \\implies$ wahr für jedes $r$</li>`;
                    }
                } else {
                    const r = diff / U[i];
                    rValues.push(r);
                    const rStr = Number(r.toFixed(2)).toString().replace('.', ',');
                    explanationPP += `<li>Koordinate ${i+1}: $${P2[i].toFixed(1).replace('.', ',')} = ${P1[i].toFixed(1).replace('.', ',')} + r \\cdot ${U[i].toFixed(1).replace('.', ',')} \\implies r = ${rStr}$</li>`;
                }
            }
            explanationPP += '</ul>';
            explanationSteps.push(explanationPP);

            // Check if r values are all identical
            let pointOnLine = possible;
            if (possible && rValues.length > 0) {
                const firstR = rValues[0];
                for (let i = 1; i < rValues.length; i++) {
                    if (Math.abs(rValues[i] - firstR) > tolerance) {
                        pointOnLine = false;
                        break;
                    }
                }
            }

            if (pointOnLine) {
                explanationSteps.push(`
                    <p class="math-success">Die Punktprobe ist erfolgreich. Der Punkt liegt auf der Geraden.</p>
                    <div class="result-box danger">
                        <h4>Ergebnis: Die Seillinien sind IDENTISCH.</h4>
                        <p>Im Kletterpark bedeutet dies, dass die Seile genau übereinander liegen bzw. dasselbe Seil beschreiben. Das ist eine Fehlplanung!</p>
                    </div>
                `);
                return {
                    relation: 'identisch',
                    explanation: explanationSteps.join(''),
                    distance: 0,
                    intersection: null,
                    segmentCollision: true
                };
            } else {
                // Calculate distance between parallel lines
                // dist = |(P2 - P1) x U| / |U|
                const diffP = [P2[0] - P1[0], P2[1] - P1[1], P2[2] - P1[2]];
                const crossP = this.crossProduct(diffP, U);
                const dist = this.magnitude(crossP) / this.magnitude(U);
                const distStr = Number(dist.toFixed(2)).toString().replace('.', ',');

                explanationSteps.push(`
                    <p class="math-warning">Die Punktprobe liefert einen Widerspruch. Der Punkt liegt nicht auf der Geraden.</p>
                    <div class="result-box warning">
                        <h4>Ergebnis: Die Seillinien sind ECHT PARALLEL.</h4>
                        <p>Abstand der Geraden: <strong>${distStr} m</strong></p>
                        <p>Im Kletterpark verlaufen die Seile in gleichbleibendem Abstand nebeneinander her.</p>
                    </div>
                `);
                return {
                    relation: 'parallel',
                    explanation: explanationSteps.join(''),
                    distance: dist,
                    intersection: null,
                    segmentCollision: false
                };
            }
        } else {
            explanationSteps.push(`<p class="math-neutral">Die Richtungsvektoren sind nicht kollinear (nicht parallel). Somit schneiden sich die Geraden oder sie sind windschief.</p>`);
            explanationSteps.push(`
                <p><strong>3. Lineares Gleichungssystem (LGS) aufstellen (Gleichsetzen $g(r) = h(s)$):</strong></p>
                <p>$\\begin{pmatrix} ${P1[0].toFixed(1).replace('.', ',')} \\\\ ${P1[1].toFixed(1).replace('.', ',')} \\\\ ${P1[2].toFixed(1).replace('.', ',')} \\end{pmatrix} + r \\cdot \\begin{pmatrix} ${U[0].toFixed(1).replace('.', ',')} \\\\ ${U[1].toFixed(1).replace('.', ',')} \\\\ ${U[2].toFixed(1).replace('.', ',')} \\end{pmatrix} = \\begin{pmatrix} ${P2[0].toFixed(1).replace('.', ',')} \\\\ ${P2[1].toFixed(1).replace('.', ',')} \\\\ ${P2[2].toFixed(1).replace('.', ',')} \\end{pmatrix} + s \\cdot \\begin{pmatrix} ${W[0].toFixed(1).replace('.', ',')} \\\\ ${W[1].toFixed(1).replace('.', ',')} \\\\ ${W[2].toFixed(1).replace('.', ',')} \\end{pmatrix}$</p>
                <p>Daraus ergeben sich drei Koordinatengleichungen:</p>
                <div class="equations-block">
                    (I)  $${P1[0].toFixed(1).replace('.', ',')} + ${U[0] >= 0 ? '+' : ''}${U[0].toFixed(1).replace('.', ',')}r = ${P2[0].toFixed(1).replace('.', ',')} + ${W[0] >= 0 ? '+' : ''}${W[0].toFixed(1).replace('.', ',')}s \\implies ${U[0].toFixed(1).replace('.', ',')}r ${-W[0] >= 0 ? '+' : ''}${(-W[0]).toFixed(1).replace('.', ',')}s = ${(P2[0] - P1[0]).toFixed(1).replace('.', ',')}$<br>
                    (II) $${P1[1].toFixed(1).replace('.', ',')} + ${U[1] >= 0 ? '+' : ''}${U[1].toFixed(1).replace('.', ',')}r = ${P2[1].toFixed(1).replace('.', ',')} + ${W[1] >= 0 ? '+' : ''}${W[1].toFixed(1).replace('.', ',')}s \\implies ${U[1].toFixed(1).replace('.', ',')}r ${-W[1] >= 0 ? '+' : ''}${(-W[1]).toFixed(1).replace('.', ',')}s = ${(P2[1] - P1[1]).toFixed(1).replace('.', ',')}$<br>
                    (III)$${P1[2].toFixed(1).replace('.', ',')} + ${U[2] >= 0 ? '+' : ''}${U[2].toFixed(1).replace('.', ',')}r = ${P2[2].toFixed(1).replace('.', ',')} + ${W[2] >= 0 ? '+' : ''}${W[2].toFixed(1).replace('.', ',')}s \\implies ${U[2].toFixed(1).replace('.', ',')}r ${-W[2] >= 0 ? '+' : ''}${(-W[2]).toFixed(1).replace('.', ',')}s = ${(P2[2] - P1[2]).toFixed(1).replace('.', ',')}$
                </div>
            `);

            // Solve 2x2 system of equations using two equations where determinant is non-zero
            const equations = [
                { name: 'I',  u: U[0], w: -W[0], c: P2[0] - P1[0] },
                { name: 'II', u: U[1], w: -W[1], c: P2[1] - P1[1] },
                { name: 'III',u: U[2], w: -W[2], c: P2[2] - P1[2] }
            ];

            let solved = false;
            let rVal = 0, sVal = 0;
            let eqA = null, eqB = null, eqC = null; // eqA and eqB are used for solving, eqC for checking

            const pairs = [
                { idxA: 0, idxB: 1, idxC: 2 },
                { idxA: 0, idxB: 2, idxC: 1 },
                { idxA: 1, idxB: 2, idxC: 0 }
            ];

            for (const pair of pairs) {
                const a = equations[pair.idxA];
                const b = equations[pair.idxB];
                const det = a.u * b.w - b.u * a.w;
                if (Math.abs(det) > tolerance) {
                    rVal = (a.c * b.w - b.c * a.w) / det;
                    sVal = (a.u * b.c - b.u * a.c) / det;
                    eqA = a;
                    eqB = b;
                    eqC = equations[pair.idxC];
                    solved = true;
                    break;
                }
            }

            if (!solved) {
                explanationSteps.push(`<p class="math-warning">LGS konnte nicht gelöst werden (Det = 0 in allen Projektionen).</p>`);
                return { relation: 'unbekannt', explanation: explanationSteps.join('') };
            }

            const rStr = Number(rVal.toFixed(3)).toString().replace('.', ',');
            const sStr = Number(sVal.toFixed(3)).toString().replace('.', ',');

            explanationSteps.push(`
                <p><strong>4. Gleichungssystem lösen:</strong></p>
                <p>Wir nutzen die Gleichungen (${eqA.name}) und (${eqB.name}), um die Parameter $r$ und $s$ zu bestimmen:</p>
                <div class="equations-block">
                    (${eqA.name}) $${eqA.u.toFixed(1).replace('.', ',')}r ${eqA.w >= 0 ? '+' : ''}${eqA.w.toFixed(1).replace('.', ',')}s = ${eqA.c.toFixed(1).replace('.', ',')}$ <br>
                    (${eqB.name}) $${eqB.u.toFixed(1).replace('.', ',')}r ${eqB.w >= 0 ? '+' : ''}${eqB.w.toFixed(1).replace('.', ',')}s = ${eqB.c.toFixed(1).replace('.', ',')}$
                </div>
                <p>Durch Auflösen (z. B. Additionsverfahren oder Einsetzungsverfahren) erhalten wir:</p>
                <p>$r \\approx ${rStr}$</p>
                <p>$s \\approx ${sStr}$</p>
            `);

            // Step 5: Check in the remaining equation
            const testValLeft = eqC.u * rVal + eqC.w * sVal;
            const testValRight = eqC.c;
            const difference = Math.abs(testValLeft - testValRight);
            const isConsistent = difference < tolerance;

            const testLeftStr = Number(testValLeft.toFixed(3)).toString().replace('.', ',');
            const testRightStr = Number(testValRight.toFixed(3)).toString().replace('.', ',');

            explanationSteps.push(`
                <p><strong>5. Überprüfung in Gleichung (${eqC.name}):</strong></p>
                <p>Setze $r \\approx ${rStr}$ und $s \\approx ${sStr}$ in Gleichung (${eqC.name}) ein:</p>
                <p>LHS (Links): $${eqC.u.toFixed(1).replace('.', ',')} \\cdot (${rStr}) ${eqC.w >= 0 ? '+' : ''}${eqC.w.toFixed(1).replace('.', ',')} \\cdot (${sStr}) \\approx ${testLeftStr}$</p>
                <p>RHS (Rechts): $${testRightStr}$</p>
            `);

            if (isConsistent) {
                // Intersect!
                const S = [
                    P1[0] + rVal * U[0],
                    P1[1] + rVal * U[1],
                    P1[2] + rVal * U[2]
                ];
                const sXStr = Number(S[0].toFixed(2)).toString().replace('.', ',');
                const sYStr = Number(S[1].toFixed(2)).toString().replace('.', ',');
                const sZStr = Number(S[2].toFixed(2)).toString().replace('.', ',');

                explanationSteps.push(`
                    <p class="math-success">Das Gleichungssystem ist konsistent ($${testLeftStr} \\approx ${testRightStr}$). Die Geraden schneiden sich.</p>
                    <p>Schnittpunkt $S = (${sXStr} \\mid ${sYStr} \\mid ${sZStr})$</p>
                `);

                // Check if the intersection is on the active segments of BOTH ropes (r in [0,1] and s in [0,1])
                const onRope1 = rVal >= -tolerance && rVal <= 1 + tolerance;
                const onRope2 = sVal >= -tolerance && sVal <= 1 + tolerance;
                const activeCollision = onRope1 && onRope2;

                if (activeCollision) {
                    explanationSteps.push(`
                        <p class="math-warning">Da beide Parameter im Seilbereich liegen ($r = ${rStr} \\in [0, 1]$ und $s = ${sStr} \\in [0, 1]$), berühren sich die Seile physisch!</p>
                        <div class="result-box danger">
                            <h4>Ergebnis: KOLLISION! Die Seile schneiden sich im Kletterpark.</h4>
                            <p>Schnittpunkt: <strong>S (${sXStr} | ${sYStr} | ${sZStr})</strong></p>
                            <p>Dies stellt eine erhebliche Sicherheitsgefahr dar! Zwei Seile dürfen sich niemals kreuzen oder berühren.</p>
                        </div>
                    `);
                } else {
                    explanationSteps.push(`
                        <p class="math-neutral">Da mindestens ein Parameter außerhalb des Seilbereichs liegt ($r \\notin [0,1]$ oder $s \\notin [0,1]$), schneiden sich nur die unendlich verlängerten Geraden, die eigentlichen Seilstücke berühren sich jedoch nicht.</p>
                        <div class="result-box success">
                            <h4>Ergebnis: Keine direkte Berührung (Geradenschnittpunkt liegt außerhalb der Seile).</h4>
                            <p>Die geometrischen Geraden schneiden sich zwar rein mathematisch, die physischen Kletterseile hängen jedoch aneinander vorbei.</p>
                        </div>
                    `);
                }

                return {
                    relation: 'schneidend',
                    explanation: explanationSteps.join(''),
                    distance: 0,
                    intersection: S,
                    segmentCollision: activeCollision,
                    r: rVal,
                    s: sVal
                };
            } else {
                // Windschief!
                const n = this.crossProduct(U, W);
                const lenN = this.magnitude(n);
                const diffP = [P2[0] - P1[0], P2[1] - P1[1], P2[2] - P1[2]];
                const dist = Math.abs(this.dotProduct(diffP, n)) / lenN;
                const distStr = Number(dist.toFixed(2)).toString().replace('.', ',');

                explanationSteps.push(`
                    <p class="math-warning">Widerspruch! Das Gleichungssystem ist nicht lösbar ($${testLeftStr} \\neq ${testRightStr}$). Die Geraden sind windschief.</p>
                    <p><strong>6. Kürzesten Abstand der windschiefen Geraden berechnen:</strong></p>
                    <p>Wir nutzen die Abstandsformel für windschiefe Geraden mit dem Kreuzprodukt der Richtungsvektoren $\\vec{n} = \\vec{u} \\times \\vec{w}$:</p>
                    <p>$\\vec{n} = \\begin{pmatrix} ${U[0].toFixed(1).replace('.', ',')} \\\\ ${U[1].toFixed(1).replace('.', ',')} \\\\ ${U[2].toFixed(1).replace('.', ',')} \\end{pmatrix} \\times \\begin{pmatrix} ${W[0].toFixed(1).replace('.', ',')} \\\\ ${W[1].toFixed(1).replace('.', ',')} \\\\ ${W[2].toFixed(1).replace('.', ',')} \\end{pmatrix} = \\begin{pmatrix} ${n[0].toFixed(1).replace('.', ',')} \\\\ ${n[1].toFixed(1).replace('.', ',')} \\\\ ${n[2].toFixed(1).replace('.', ',')} \\end{pmatrix}$</p>
                    <p>Betrag von $\\vec{n}$: $|\\vec{n}| = \\sqrt{(${n[0].toFixed(1).replace('.', ',')})^2 + (${n[1].toFixed(1).replace('.', ',')})^2 + (${n[2].toFixed(1).replace('.', ',')})^2} \\approx ${lenN.toFixed(2).replace('.', ',')}$</p>
                    <p>Abstand: $d = \\frac{|(\\vec{p}_2 - \\vec{p}_1) \\cdot \\vec{n}|}{|\\vec{n}|} \\approx ${distStr} \\text{ m}$</p>
                `);

                const minDistanceLimit = 1.5;
                const safe = dist >= minDistanceLimit;

                if (safe) {
                    explanationSteps.push(`
                        <div class="result-box success">
                            <h4>Ergebnis: Die Seile sind WINDSCHIEF (Sicherer Abstand).</h4>
                            <p>Kürzester Abstand: <strong>${distStr} m</strong> (Sicherheitsgrenze von ${minDistanceLimit}m eingehalten 👍)</p>
                            <p>Die Seile laufen windschief aneinander vorbei und haben ausreichend Abstand voneinander.</p>
                        </div>
                    `);
                } else {
                    explanationSteps.push(`
                        <div class="result-box warning">
                            <h4>Ergebnis: Die Seile sind WINDSCHIEF (Achtung: Zu geringer Abstand!).</h4>
                            <p>Kürzester Abstand: <strong>${distStr} m</strong> (Unterschreitet die Sicherheitsgrenze von ${minDistanceLimit}m! ⚠️)</p>
                            <p>Obwohl sich die Seile rechnerisch nicht berühren, laufen sie so nah aneinander vorbei, dass Kletterer kollidieren könnten.</p>
                        </div>
                    `);
                }

                return {
                    relation: 'windschief',
                    explanation: explanationSteps.join(''),
                    distance: dist,
                    intersection: null,
                    segmentCollision: false
                };
            }
        }
    }
}

// Export to window object for browser access
window.MathSolver = MathSolver;
