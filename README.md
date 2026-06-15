# Interaktive 3D-Lernumgebung: Kletterpark-Modellierung mit Vektoren

Diese interaktive Web-Anwendung wurde speziell für den Mathematikunterricht der Einführungsphase (EF) am Gymnasium entwickelt. Sie dient Schülerinnen und Schülern (SuS) als visuelle und mathematische Begleitung, um einen Kletterpark im dreidimensionalen Raum zu modellieren und ihre Ergebnisse anschließend in GeoGebra 3D auf dem iPad zu übertragen.

---

## 📅 Unterrichtlicher Kontext (Bezug zur Reihe)

Die Lernumgebung unterstützt insbesondere die folgenden Phasen Ihrer Unterrichtsreihe:
* **7./8. DS (Einstieg Kletterpark)**: Modellierung von Plattformen als Punkte und Seilen als Geraden/Strecken.
* **11./12. DS (Parallele Seile)**: Vergleich von Richtungsvektoren zur Überprüfung auf Parallelität.
* **13. DS (UB-Thema: Schneidende und windschiefe Seile)**: Systematische Untersuchung von Lagebeziehungen durch das Gleichsetzen von Geraden und das Lösen von Linearen Gleichungssystemen (LGS).

---

## 🚀 Kernfunktionen der Anwendung

### 1. Interaktiver 3D-Editor (GeoGebra-konform)
* **3D-Darstellung**: Die Plattformen werden als Holzscheiben, Seile als Leuchtlinien und Stützbäume als Stämme im Raum visualisiert.
* **Orientierungshilfe**: Die $x$-, $y$- und $z$-Achsen sind in den klassischen GeoGebra-Farben dargestellt (**Rot = $x$**, **Grün = $y$**, **Blau = $z$-Höhenachse**). Das erleichtert den kognitiven Transfer auf das iPad.
* **Touch-Steuerung**: Voll optimiert für iPads. Mit Wischgesten kann die Kamera gedreht, verschoben und gezoomt werden.
* **3D-Raycasting**: Klick auf eine Plattform oder ein Seil im 3D-Raum wählt das Objekt sofort in den Seitenleisten aus.

### 2. Schritt-für-Schritt-LGS-Solver (Didaktischer Kern)
Wenn zwei Seile ausgewählt werden, berechnet die App die Lagebeziehung und zeigt den **vollständigen mathematischen Rechenweg** (Schritt für Schritt) an:
1. **Aufstellen der Geradengleichungen** in Parameterform.
2. **Kollinearitätsprüfung** der Richtungsvektoren.
3. **Aufstellen des LGS** (Gleichsetzen der Geraden).
4. **Schrittweise Berechnung** der Parameter $r$ und $s$ aus zwei Gleichungen.
5. **Punktprobe / Überprüfung** in der verbleibenden Gleichung.
6. **Interpretation im Sachkontext**:
   * *Kollision*: Die Seile kreuzen sich tatsächlich physisch ($r, s \in [0,1]$).
   * *Schnittpunkt außerhalb*: Die Geraden schneiden sich mathematisch, aber die physischen Seile hängen aneinander vorbei.
   * *Windschief (Sicher)*: Die Seile verlaufen windschief mit ausreichendem Abstand ($d \ge 1{,}5\text{ m}$).
   * *Windschief (Gefährlich)*: Die Seile kreuzen sich mathematisch nicht, sind aber zu nah beieinander ($d < 1{,}5\text{ m}$).
   * *Parallel / Identisch*: Die Richtungsvektoren zeigen in die gleiche Richtung.

### 3. Vordefinierte Lernszenarien (HUD unten links)
* **💥 Kollision**: Startet mit einem kreuzenden Seilpaar. Perfekt zum Einstieg in das LGS-Thema.
* **✅ Windschief (Sicher)**: Zeigt eine sichere Seilführung.
* **⚠️ Windschief (Zu nah)**: Zeigt ein Szenario, bei dem die Geraden windschief sind, die Seile jedoch gefährlich nah aneinander vorbeilaufen. Perfekt zur didaktischen Reflexion ("Reicht es aus, wenn sich die Geraden rechnerisch nicht schneiden?").
* **📏 Parallel**: Zeigt zwei exakt parallel verlaufende Seile.

### 4. GeoGebra iPad-Export (Tab "GeoGebra iPad")
* Generiert in Echtzeit die exakten Befehlszeilen (z. B. `A = (2, 3, 1.5)`, `v_AB = Vektor(A, B)`, `g_AB = Gerade(A, v_AB)`).
* Die Befehle können kopiert und in die GeoGebra 3D Rechner App auf dem iPad eingefügt werden.

---

## 🛠 Start der Anwendung (Offline & Online nutzbar)

Die Anwendung ist als reine Client-Side-Web-App implementiert. Sie benötigt keine Installation und läuft vollständig im Browser.

### Option A: Einfaches Öffnen (Offline)
1. Laden Sie den Projektordner herunter.
2. Machen Sie einen Doppelklick auf die Datei `index.html`. Sie öffnet sich direkt im Standardbrowser (Safari, Chrome, Firefox).

### Option B: Lokaler Webserver (Empfohlen)
Falls Sie die App auf Ihren iPads über ein schulinternes Netzwerk oder einen lokalen Server bereitstellen möchten:
1. Öffnen Sie ein Terminal im Projektordner.
2. Starten Sie einen einfachen Python-Server:
   ```bash
   python -m http.server 8000
   ```
3. Rufen Sie die Adresse `http://localhost:8000` im Browser auf.

---

## 📱 Technische Highlights (Für das iPad)
* **Keine CORS-Probleme**: Da alle Skripte und Bibliotheken entweder per Standard-CDN geladen werden oder lokal ohne ES6-Module (sondern als klassische Skripte) verknüpft sind, läuft die Seite problemlos über das `file://`-Protokoll (wenn man die HTML direkt öffnet).
* **Große Klickflächen**: Alle Knöpfe und Formularfelder haben eine Mindesthöhe von $44\text{px}$ für eine bequeme Touch-Bedienung auf dem iPad-Bildschirm.

---

## 🧪 Entwickler- & Testversion (index-test.html)

Für Lehrkräfte gibt es eine spezielle Test-Datei namens `index-test.html`.
* **Zweck**: Schnelles Durchspielen aller 6 Levels zur Vorbereitung der Unterrichtsstunde oder zur Demonstration vor der Klasse, ohne die mathematischen Antworten selbst eingeben zu müssen.
* **Schnell-Lösen**: In dieser Version befindet sich unter den Antwortfeldern ein gelber Button **"Schnell-Lösen (Lehrer-Test)"**. Beim Klicken werden alle Felder des aktuellen Levels automatisch mit den mathematisch korrekten Werten befüllt und das Level wird direkt freigegeben.
* **Onboarding überspringen**: Im Gegensatz zur Schülerversion (`index.html`) kann die Einleitungs-Anleitung in der Testversion sofort über das Schließen-Kreuz `[X]` oben rechts übersprungen werden.
