Kindertagespflege Eveline Muller — Website
============================================

Statische Website für die Kleinkinder-Tagespflege von Eveline Muller in
Stuttgart-Büsnau. Reines HTML/CSS/JavaScript, kein Build-Schritt nötig —
kann direkt per GitHub Pages (siehe .github/workflows/static.yml) oder
jedem beliebigen statischen Webhost bereitgestellt werden.

Struktur
--------
index.html         Startseite: Hero, Über mich, Konzept, Räumlichkeiten,
                    Plätze/Warteliste, Öffnungszeiten, Kontaktformular
impressum.html      Impressum (§ 5 TMG)
datenschutz.html     Datenschutzerklärung
css/style.css       Gesamtes Stylesheet (kinderfreundliche Farben, responsiv)
js/script.js        Navigation, Scroll-Reveal, Formular-Validierung
img/favicon.svg     Favicon

Kontaktformular
----------------
Da es sich um eine rein statische Seite ohne Backend handelt, öffnet das
Formular nach Validierung das E-Mail-Programm des Nutzers mit einer
vorausgefüllten Nachricht an eveline.muller@gmx.de (mailto:-Link). Für einen
serverseitigen Versand (z. B. über Formspree, Netlify Forms o. Ä.) muss das
Formular in js/script.js entsprechend angebunden werden.

Lokal ansehen
--------------
Einfach index.html im Browser öffnen, oder z. B.:
	python3 -m http.server
