# Daten, Herkunft und Lizenzen

Alle Daten liegen als JSON im Repository. Von Hand gepflegt werden nur die
Dateien in der ersten Tabelle, alles andere erzeugen Skripte unter
`scripts/`.

## Von Hand gepflegt

Lizenz: CC BY 4.0, Namensnennung „Tobias Seeger, Heimatschichten, nach Tim Krämer, Römerlager Westfalen“.

| Datei | Inhalt |
|-------|--------|
| `src/data/literatur.json` | Literatur, Presse und Datendienste als CSL-JSON, Schema unten |
| `src/data/quellen.json` | Gruppen und Reihenfolge der Quellen im Reiter „Quellen“, verweist per `ref` auf die Literatur |
| `src/lib/regions.js` | Startausschnitt und Grenzen der Karte |

### Literatur

`src/data/literatur.json` ist eine Liste im Format
[CSL-JSON](https://citeproc-js.readthedocs.io/en/latest/csl-json/markup.html),
das Zotero, Pandoc und citeproc verstehen. Aus ihr entstehen die Kurzangaben
in den Listen (`src/lib/literature.js`), die Zitierstile und die Exporte nach
BibTeX, BibLaTeX und RIS (`src/lib/cite.js`).

```json
{
	"id": "tremmel2011a",
	"type": "article-journal",
	"author": [{ "family": "Tremmel", "given": "Bettina" }],
	"issued": { "date-parts": [[2011]] },
	"title": "Augusteische Marschlager in Porta Westfalica-Barkhausen „Auf der Lake“",
	"container-title": "Archäologie in Westfalen-Lippe",
	"volume": "2010",
	"page": "79-81",
	"DOI": "10.11588/aiw.0.0.25926"
}
```

| Feld | Bedeutung |
|------|-----------|
| `id` | Kleinbuchstaben, Ziffern und Bindestriche, Muster Name und Jahr. Wird zum BibTeX-Schlüssel, Bindestriche dort als Unterstrich |
| `type` | CSL-Typ, hier `article-journal`, `book`, `chapter`, `report`, `dataset`, `map`, `webpage`, `article-newspaper`, `post-weblog` |
| `author`, `editor` | Personen mit `family` und `given`, Namenszusätze in `non-dropping-particle` („von“), Institutionen als `literal` |
| `volume`, `issued` | Bei Jahrbüchern ist `volume` das Berichtsjahr und `issued` das Erscheinungsjahr („2010 (2011)“) |
| `DOI`, `URL` | DOI ohne `https://doi.org/`. Ohne DOI der Katalogeintrag (DNB, K10plus, NWBib, Zenon) oder die Seite |
| `accessed` | Abrufdatum bei Webseiten und Diensten |

Die Angaben stammen aus DOI-Metadaten (Crossref, DataCite) und den Katalogen
der DNB, des K10plus, der NWBib (lobid) und von Zenon (DAI), abgerufen am
06.10.2026. Wo ein Katalog keinen Vornamen nennt, fehlt er auch hier.
Pressemitteilungen und Zeitungsartikel tragen den Titel der Seite.

### Zitierstile

Die Stildateien in `public/csl/` stammen aus dem
[CSL-Stilrepository](https://github.com/citation-style-language/styles) und
stehen unter [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/).
Der DAI-Stil ist an zwei Stellen geändert, vermerkt im Kopf der Datei. URLs
bleiben in der ursprünglichen Schreibung (der Stil schrieb sie klein und
machte damit Links mit `urlID=` ungültig), und die Auflage steht wie in den
Zitierrichtlinien des DAI hochgestellt vor dem Jahr. APA 7 bringt
citation-js selbst mit.

## Von Skripten erzeugt

| Datei | Skript | Herkunft | Lizenz |
|-------|--------|----------|--------|
| `src/data/fluesse.json` | `scripts/build-rivers.mjs`, Weser im Kreis Minden-Lübbecke aus `scripts/altkarten/nachzeichnen.sh weser` | Preußische Uraufnahme (Geobasis NRW), OpenStreetMap, Literatur für römerzeitliche Abschnitte, Kreiskarte Minden 1843 (Weser) | ODbL 1.0 |
| `src/data/kreis-minden-luebbecke.json` | einmalig über Nominatim | OpenStreetMap | ODbL 1.0 |
| `src/data/altkarten.json` | `scripts/altkarten/alt.sh index` | Verzeichnis der entzerrten Altkarten | CC BY 4.0 |
| `src/data/altkarten-quellen.json` | von Hand | Bestandsnachweise der Scans (SLUB, Landesarchiv NRW) | CC BY 4.0 |
| `scripts/altkarten/gcp/*.json` | von Hand, `alt.sh fit` und `feinpass.sh` | Passpunkte je Altkarte | CC BY 4.0 |
| `scripts/altkarten/fluesse/**/*.json` | `nachzeichnen.sh vorschlag`, von Hand korrigiert | Stützpunkte der nachgezeichneten Gewässer in Pixeln der Scans, Kreisgebiet je Karte | CC BY 4.0 |
| `public/precomputed/fluesse-kreiskarten.geojson` | `scripts/altkarten/nachzeichnen.sh geojson` | Kreiskarten Minden 1843 (Landesarchiv NRW, KSA 11782) und Lübbecke 1844 (W 051 Nr. 11781), OpenStreetMap als Leitlinien | ODbL 1.0, Ableitung aus den Kreiskarten |
| `public/precomputed/moor-1844.geojson` | `scripts/altkarten/moor1844.py` aus den Umrissen in `scripts/altkarten/moor/1844-kreis-luebbecke.json` | Kreiskarte Lübbecke 1844 (Landesarchiv NRW, W 051 Nr. 11781) | CC BY-SA 4.0 |
| `public/precomputed/moor-zeit.geojson` | `scripts/altkarten/moor.sh` | BK50 NRW (GD NRW, dl-de/by-2-0), GUM50 (LBEG Niedersachsen), Überschwemmungsgebiete nach der preußischen Aufnahme (Land NRW, Dienst uesg) | Lizenzen der Landesämter |
| `public/precomputed/wald-zeit.geojson` | `scripts/altkarten/wald.sh` | Waldflächen in NRW während der Preußischen Uraufnahme (LANUK NRW, Open Data), auf den Kreis zugeschnitten | Lizenz des LANUK, noch zu prüfen |
| `public/precomputed/wege-zeit.geojson` | `scripts/altkarten/wege.sh` | Preußische Uraufnahme (Geobasis NRW), OpenStreetMap als Leitlinien | ODbL 1.0 |
| `public/precomputed/orte.json` | `scripts/build-places.mjs` | OpenStreetMap (OpenMapTiles) | ODbL 1.0 |
| `public/precomputed/gebiete.json` | `scripts/build-areas.mjs` | OpenStreetMap über Overpass | ODbL 1.0 |

OpenStreetMap-Daten: © OpenStreetMap-Mitwirkende, verfügbar unter der Open
Database License 1.0 (https://www.openstreetmap.org/copyright).

## Skripte

Alle Skripte laufen mit Bun aus dem Projektordner und laden Kacheln aus dem
Netz (Kacheldienste in `src/config.js`).

| Befehl | Dauer | Ergebnis |
|--------|-------|----------|
| `bun scripts/build-rivers.mjs [Fluss …] [--roemisch]` | beim ersten Mal etwa 1 h | Alte Flussläufe |
| `scripts/altkarten/nachzeichnen.sh geojson` | wenige Minuten | Flüsse und Bäche der Kreiskarten 1843/44 |
| `bun scripts/build-places.mjs` | einige Minuten | Ortsverzeichnis der Suche |
| `bun scripts/build-areas.mjs` | je nach Overpass-Last | Höhenzüge und Verwaltungsgebiete der Suche |

### Alte Flussläufe

`scripts/build-rivers.mjs` baut die Läufe von Lippe, Ems, Weser, Rhein,
Elbe, Stever, Seseke und Alme. Leitlinie ist der heutige Lauf aus
OpenStreetMap. In NRW sucht das Skript je 6-km-Abschnitt den günstigsten
Weg über blau kolorierte Wasserflächen der Preußischen Uraufnahme. Findet
sich auf einem Blatt kein Blau oder folgt der Weg nur dünnen Linien wie
Festungsgräben, gilt dort der heutige Lauf. Bei Haltern und Xanten setzt es
den römerzeitlichen Lauf nach der Literatur ein. Jedes Teilstück trägt
seine Herkunft (`uraufnahme`, `osm` oder `roemisch`). Die Kacheln der
Uraufnahme landen in `node_modules/.cache/uraufnahme`.

### Altkarten

Die Altkarten (Minden und Lübbecke, 1650–1904) sind entzerrte Scans
historischer Karten. Weder die Scans noch die daraus gerechneten Kacheln
liegen im Repository, nur die Passpunkte (`scripts/altkarten/gcp/`) und das
Verzeichnis (`src/data/altkarten.json`). Ohne Kacheln blendet die App diese
Karten in der Gruppe „Historische Karten“ aus.

Bestandsnachweis und Rechteangabe je Scan stehen in
`src/data/altkarten-quellen.json` und erscheinen in der Attribution der
Karte. Sieben Blätter stammen aus der Deutschen Fotothek der SLUB Dresden
(Public Domain Mark 1.0), sieben aus dem Landesarchiv NRW, Abteilung
Westfalen, Bestand W 051 (CC BY-SA 4.0, Scans über das LWL-Portal
„Westfälische Geschichte“). Die Kreiskarte Minden 1843 (KSA 11782,
Altsignatur B 61,7) kommt aus demselben Bestand über dasselbe Portal
(kar570). Ihre Lizenz ist noch nicht geprüft, die Attribution nennt
deshalb keine. Die beiden Messtischblätter 3616 und 3617 in der Ausgabe
von 1938 führt die SLUB als urheberrechtlich geschützt. Die Angaben wurden
über die API der Deutschen Digitalen Bibliothek ermittelt, die
Rechtehinweise auf den Seiten der Archive selbst sind noch von Hand zu
prüfen. Die gerechneten Kacheln übernehmen die Lizenz des jeweiligen Scans.

Kacheln rechnen (Python über [uv](https://docs.astral.sh/uv/) mit numpy,
scipy, Pillow und pyproj):

```bash
export ALTKARTEN_DIR="$HOME/Downloads/Historische Landkarten"   # Ordner mit den Scans
bun scripts/altkarten/orte.mjs                  # Ortsverzeichnis für Passpunkte, einmalig
scripts/altkarten/alt.sh fit 1844-kreis-luebbecke
scripts/altkarten/feinpass.sh 1844-kreis-luebbecke --runden 3 --nur-auto
scripts/altkarten/nachzeichnen.sh maske 1844-kreis-luebbecke   # freistellen
scripts/altkarten/alt.sh tiles 1844-kreis-luebbecke
scripts/altkarten/alt.sh index                  # schreibt src/data/altkarten.json
```

Die Kreiskarten sind nach den Katasterkarten gezeichnet. Über Ortsmitten
allein lagen sie nur auf etwa 210 m genau, weil Ortsmitten auf der Karte
und im heutigen Ortsverzeichnis selten dieselbe Stelle meinen.
`feinpass.sh` schiebt die vorläufig entzerrte Karte deshalb in Fenstern von
gut einem Kilometer gegen die Uraufnahme, bis Wege, Bäche und Waldränder
übereinanderliegen, und nimmt jedes eindeutige Fenster als Passpunkt. Mit
`--nur-auto` zählen danach nur noch diese Punkte. Lübbecke liegt so im
Median auf 20 m, Minden auf 28 m (Leave-one-out). Die Ortsmitten bleiben
abgeschaltet als Kontrolle in der Datei.

`nachzeichnen.sh maske` stellt die Karten frei: Gezeichnetes innerhalb des
Kreisgebiets (`scripts/altkarten/fluesse/kreisgebiet.json`) bleibt, Titel,
Legende und das leere Nachbarland werden durchsichtig. Die Spezifikation
schaltet das mit `"freistellen": true` ein.

### Gewässer, Moore, Wald und Wege aus den Karten

Die Karte zeigt Gewässer, Moore, Wald und Hauptwege im Stand um 1840.

Flüsse und Bäche im Kreis Minden-Lübbecke sind von den Kreiskarten Minden
1843 und Lübbecke 1844 nachgezeichnet (`scripts/altkarten/nachzeichnen.sh`,
Ebene „Flüsse und Bäche der Kreiskarten 1843/44“). Sie ersetzen dort die
früher aus der Uraufnahme gelesenen Bäche (`gewaesser.sh`) und, für die
Weser, den Lauf in `src/data/fluesse.json`. So gilt im Kreis eine einzige
Fassung, in der Karte. Die Uraufnahme taugte dafür schlecht:
Ihre Bäche sind dünne blaugraue Linien, die sich nicht von Feldgrenzen und
Wegen trennen lassen, und die Suche legte Bäche teils auf Straßen.

Auf den Kreiskarten sind Bäche laut Zeichenerklärung fein geschlängelte
schwarze Linien, Flüsse Doppellinien, Wege glatte Linien. Für jeden
heutigen benannten Bach (OSM, ohne Kanäle, Entlaster und Gräben) setzt das
Skript alle 70 Kartenpixel einen Stützpunkt auf die nächste schwarze Linie.
Zwischen den Stützpunkten rastet der Lauf in einem Band von etwa 75 m auf
die Linie ein. Die Prüfbilder (`kacheln`, `bogen`) wurden durchgesehen und
falsche Punkte von Hand gesetzt, etwa die heute abgeschnittene
Werreschleife bei Werste. Weser und Werre laufen als Mittellinie zwischen
den gezeichneten Ufern. Bei Bächen, die nicht einzeln durchgesehen sind
(ohne `"geprueft": true`), fallen Abschnitte weg, die glatt wie ein Weg
verlaufen. Dort gilt lieber der heutige Lauf, als dass der Bach auf einem
Weg liegt.

Aus den nachgezeichneten Stücken wird ein Gewässernetz für die ganze
Region der Analyse (`fluesse-kreiskarten.geojson`). Gerüst ist der heutige
Lauf aus OSM: im Kreis jedes benannte Gewässer, ganz bis zu seiner
Mündung, außerhalb die Läufe, die OSM überwiegend als Fluss führt. Lücken
eines Flusses bis 300 m (Durchlässe, Namenswechsel) werden überbrückt, und
ein Bach außerhalb des Kreises kommt dazu, wenn er zwei Läufe verbindet.
Die Stücke der Kreiskarten ersetzen den heutigen Lauf dort, wo es sie gibt.
Wo die Karte nichts Sicheres hergibt, bleibt der heutige Lauf, in der Karte
hellblau statt dunkelblau. Freie Enden münden in den nächsten Lauf, und es
bleiben nur Läufe, die mit dem großen Netz verbunden sind (einem Lauf am
Rand der Region oder einem Fluss ab 15 km). Bäche ohne heutigen Lauf
findet das Verfahren nicht.

Die Karten des 17. und 18. Jahrhunderts liegen örtlich 0,3–1 km neben der
heutigen Lage, aus ihnen werden keine Linien gelesen.

Moore und nasse Flächen (`scripts/altkarten/moor.sh`) stammen nur aus
amtlichen Daten. In der Karte des Deutschen Reiches ist die Moorsignatur
ein blasser Blauschleier, die Uraufnahme ist Blatt für Blatt anders
koloriert, beides ließ sich nicht verlässlich auslesen. Immer gezeigt
werden die Moorböden nach BK50 (NRW, Hoch- und Niedermoor samt Deck- und
Fehnkultur) und außerhalb NRW nach GUM50; im Torfkörper steckt die
Ausdehnung vor der Kultivierung, abgetorfte Flächen fehlen teils. In der
GUM50 fehlt ein Kartenblatt am Dümmer. Um 1840 kommen die
Überschwemmungsgebiete nach der preußischen Aufnahme dazu (der Dienst
zeichnet sie schraffiert, das Skript füllt die Umrisse).

Wald um 1840 kommt aus dem Datensatz „Waldflächen in Nordrhein-Westfalen
während der Preußischen Uraufnahme“ des Landesamts für Natur, Umwelt und
Klima (`scripts/altkarten/wald.sh` lädt das GeoPackage und schneidet es
zu). Orte um 1840 gibt es nicht als amtliche Daten, und
die Uraufnahme färbt Häuser je Blatt anders (teils rot, teils schwarz), eine
automatische Erkennung war nicht verlässlich.

Hauptwege um 1840 (`scripts/altkarten/wege.sh`) liest das Skript wie die
Bäche: Leitlinien sind die heutigen Bundes-, Landes- und Kreisstraßen aus
OSM (trunk bis tertiary). In einem Korridor von 120 m sucht es den
günstigsten Weg über Linien, die wärmer (Rot über Blau) und dunkler sind
als ihre Umgebung, so wie die Uraufnahme Wege braun bis rot zieht, und
übernimmt nur Abschnitte, auf denen die Karte deutlich einen Weg zeigt.
Das Ergebnis zeigt, welche heutigen Hauptstraßen es schon als Weg gab und
wo der alte Weg anders lief. Verschwundene Wege fehlen, Feldgrenzen und
Gräben entlang einer Straße können als Weg durchgehen. Zwischenstände und
Prüfbilder (`--debug --bbox w s e n`) liegen in `scripts/altkarten/.cache`.

## Externe Dienste zur Laufzeit

Die App lädt Karten direkt bei den Anbietern. Die Lizenz steht jeweils in
der Attribution der Karte.

| Dienst | Lizenz |
|--------|--------|
| OpenStreetMap (Vektorkacheln, Grundkarte) | ODbL 1.0 |
| Geobasis NRW (Luftbilder, DGM1-Schummerung, Uraufnahme, Denkmäler) | dl-de/zero-2-0 |
| LGLN Niedersachsen (Luftbilder) | CC BY 4.0 |
| BKG TopPlusOpen | CC BY 4.0 |
| Sentinel-2 cloudless von EOX | CC BY-NC-SA 4.0 |
| Mapzen Terrain Tiles auf AWS (SRTM, EU-DEM u. a.) | siehe https://github.com/tilezen/joerd/blob/master/docs/attribution.md |
| GD NRW BK50, LBEG GUM50 und weitere LBEG-Karten (Böden, Moore) | Nutzungsbedingungen des jeweiligen Landesamts |
