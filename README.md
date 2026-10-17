# Heimatschichten

[![CI](https://github.com/TobiasSeeger/zeitschichten/actions/workflows/ci.yml/badge.svg)](https://github.com/TobiasSeeger/zeitschichten/actions/workflows/ci.yml)
[![Code: MIT](https://img.shields.io/badge/Code-MIT-blue.svg)](LICENSE)
[![Daten: CC BY 4.0](https://img.shields.io/badge/Daten-CC%20BY%204.0-lightgrey.svg)](docs/daten.md)

Web-Karte mit historischen Karten für den Kreis Minden-Lübbecke: entzerrte
Altkarten von 1650 bis 1904, Preußische Uraufnahme, TK25 1936–1945, alte
Flussläufe sowie Gewässer, Moore, Wald und Wege um 1840, jeweils über dem
heutigen Luftbild.

Live: https://experiments.erleben.app/heimatschichten/

Dies ist ein Fork von Tim Krämers
[Römerlager Westfalen](https://github.com/TimKraemer/roemerlager-westfalen),
dessen Fassung unter https://experiments.erleben.app/roemer/ läuft. Die
Römer-Teile (Fundstellen, Potenzialmodell, antike Texte, Römerstraßen,
3D-Modell) sind hier entfernt. Karten, Ebenen, Suche und Zitieren stammen aus
Tims Projekt.

> In English: An interactive map of historical maps of the district of
> Minden-Lübbecke (Germany), from 1650 to 1945, overlaid on today's aerial
> imagery. Forked from Tim Krämer's map of Roman camps in Westphalia.
> Everything runs in the browser as a static site. The code and most texts
> were written with AI (Claude by Anthropic) under human direction, see
> [Entstehung mit KI](#entstehung-mit-ki). The interface and documentation
> are in German.

## Inhalt

- 16 entzerrte Altkarten von Minden und Lübbecke (1650–1904) mit Passpunkten und Bestandsnachweisen, im Ebenen-Panel als Zeitstrahl
- amtliche historische Karten als WMS: Preußische Uraufnahme, Tranchot/v. Müffling, Preußische Neuaufnahme, TK25 1936–1945, Luftbilder der 1950er
- alte Flussläufe von Rhein, Lippe, Ems und Weser, im Kreis nach den Kreiskarten 1843/44
- Gewässer, Moore, Wald und Hauptwege um 1840
- Luftbild, Laserscan-Schummerung, Bodenkarten, Moore, Geologie und Bodendenkmäler
- Suche über Ebenen, Flüsse und heutige Orte, eigene Karten per WMS, GeoJSON, KML oder Bild mit World-File
- Zitiervorschlag und Quellen je Ebene

## Entstehung mit KI

Dieses Projekt ist weitgehend mit künstlicher Intelligenz entstanden. Tim
Krämer hat das Original angeleitet, Tobias Seeger diesen Fork. Beide haben
Fragestellung und Richtung vorgegeben, Zwischenstände in der App geprüft und
entschieden, was bleibt. Programmcode, Skripte, Erklärtexte und diese
Dokumentation hat das Sprachmodell Claude (Anthropic) über
[Claude Code](https://claude.com/claude-code) geschrieben. Commits mit
KI-Anteil tragen die Zeile `Co-Authored-By: Claude …`. Die Dateien
`AGENTS.md` und `CLAUDE.md` sind Arbeitsanweisungen für KI-Agenten.

Was das für die Nutzung heißt:

- Literaturangaben wurden per DOI, Crossref, DataCite oder Bibliothekskatalog nachgeschlagen, wo das ging. Sprachmodelle erfinden Quellen. Bitte jede Angabe vor dem Zitieren am Original prüfen.
- Fehler bitte als [Issue](https://github.com/TobiasSeeger/zeitschichten/issues) melden, möglichst mit Beleg.

## Schnellstart

Voraussetzung ist [Bun](https://bun.sh) ab Version 1.3.

```bash
git clone https://github.com/TobiasSeeger/zeitschichten.git
cd zeitschichten
bun install
bun run dev
```

Danach http://localhost:3000/ öffnen. Die Startansicht zeigt den Kreis
Minden-Lübbecke.

Mit Docker statt Bun:

```bash
docker build -t heimatschichten .
docker run --rm -p 8080:80 heimatschichten
```

Danach http://localhost:8080/ öffnen.

## Konfiguration

Alle Einstellungen haben Standardwerte und sind optional. Lokal kommen sie
in `.env.local` (Vorlage [.env.example](.env.example)), beim Deploy in
`deploy/deploy.env`, bei Docker als `--build-arg`.

| Variable | Standard | Bedeutung |
|----------|----------|-----------|
| `BASE_PATH` | leer | Unterpfad der App, z. B. `/heimatschichten` |
| `NEXT_PUBLIC_SITE_URL` | `https://experiments.erleben.app/heimatschichten/` | Adresse im Zitiervorschlag |
| `NEXT_PUBLIC_DEM_TILES` | `https://tiles.erleben.app/dem/{z}/{x}/{y}` | Höhenkacheln im Terrarium-Format für das farbige Relief |
| `NEXT_PUBLIC_VECTOR_TILES` | `https://tiles.erleben.app/germany/{z}/{x}/{y}` | Vektorkacheln im OpenMapTiles-Schema, z. B. von [OpenFreeMap](https://openfreemap.org) |
| `NEXT_PUBLIC_GLYPHS` | `https://tiles.erleben.app/font/{fontstack}/{range}` | Schriften für Beschriftungen |

Die Standard-Kacheldienste auf tiles.erleben.app beantworten Browser-Anfragen
nur von den Domains von erleben.app und von localhost. Wer die App unter einer
eigenen Domain betreibt, muss eigene Dienste für Vektorkacheln und Schriften
eintragen. Inhaltliche Einstellungen (Startausschnitt, Ebenen, Altkarten)
stehen im Code, siehe [CONTRIBUTING.md](CONTRIBUTING.md#erweitern).

## Auf einem eigenen Server betreiben

Die App ist ein statischer Export. Der Server liefert nur Dateien aus dem
Ordner `out/` aus. Jeder Webserver genügt, der `.mjs` als JavaScript
ausliefert ([deploy/nginx.conf](deploy/nginx.conf) zeigt eine passende
nginx-Konfiguration).

Damit wiederholte Besuche schnell laden, hängt der Build an Daten unter
`public/` eine Prüfsumme (`?v=…`). Solche Dateien darf der Browser
unbegrenzt cachen, die nginx-Konfiguration erlaubt das für `precomputed/`,
`altkarten/` und `csl/`. `bun run build` legt außerdem stark gepackte
`.gz`-Fassungen an, die nginx per `gzip_static` ausliefert. Im Browser hält
ein Service Worker ([public/sw.js](public/sw.js)) Kacheln fremder Dienste
14 Tage vor, weil viele amtliche WMS keine Cache-Header senden.

```bash
BASE_PATH=/heimatschichten bun run build   # Ergebnis in out/
```

Für wiederholte Deploys per rsync:

```bash
cp deploy/deploy.env.example deploy/deploy.env   # Ziel und Unterpfad eintragen
bun run deploy                                    # Tests, Build, rsync
```

Tims Referenzinstanz auf experiments.erleben.app dient als vollständiges
Beispiel. Ihre Dateien (Compose-Dienst, nginx-Konfiguration,
Einrichtungsskript, Einstellungen) liegen in [deploy/erleben/](deploy/erleben/).

Die Kacheln der Altkarten sind nicht im Repository, weil sie aus Scans
gerechnet werden (rund 290 MB). Ohne sie blendet die App diese Karten unter
„Historische Karten“ aus. Wie man sie erzeugt, steht in [docs/daten.md](docs/daten.md#altkarten).

## Aufbau

Next.js 16 (App Router, statischer Export), React 19, MUI 9, MapLibre GL 6,
zustand, Bun und Biome. JavaScript ohne TypeScript.

| Pfad | Inhalt |
|------|--------|
| `src/config.js` | Unterpfad, Kacheldienste, Name und Zitierangaben |
| `src/data/` | Quellen, Literatur (CSL-JSON), alte Flussläufe, Altkarten, Kreisgrenze |
| `src/lib/literature.js`, `cite.js`, `layer-sources.js` | Literaturverweise auflösen, Zitierstile und Exporte, Quellen je Kartenebene |
| `src/lib/layers.js` | Grundkarten und zuschaltbare Ebenen, Startebenen (`visible`) |
| `src/lib/regions.js` | Startausschnitt und Grenzen der Karte |
| `src/components/` | Karte, Seitenleiste, Suche, Zitierdialog |
| `scripts/` | Bau der Datensätze (Orte, Gebiete, Flüsse, Altkarten) |
| `public/precomputed/` | Ortsverzeichnis und Ebenen um 1840 |
| `public/csl/` | Zitierstile (Citation Style Language) |
| `deploy/` | Deploy-Skript, nginx-Konfiguration, Beispielserver |
| `docs/` | Daten, Herkunft und Lizenzen ([daten.md](docs/daten.md)) |

## Zitieren

Der Reiter „Quellen“ zeigt den Zitiervorschlag in den Stilen des Deutschen
Archäologischen Instituts (DAI), DIN 1505-2, APA 7, Chicago und Harvard und
liefert ihn als BibTeX, BibLaTeX, RIS und CSL-JSON. Jede Kartenebene hat
unter „Quellen und zitieren“ eigene Angaben. Ebenen, die die Anwendung
selbst erzeugt (alte Flussläufe, entzerrte Altkarten usw.), werden als Teil
dieses Werks zitiert, fremde Kartendienste nennen ihren Anbieter.

APA 7:

> Seeger, T. (2026). Heimatschichten. Historische Karten für den Kreis
> Minden-Lübbecke (Version 0.1.0) [Software].
> https://experiments.erleben.app/heimatschichten/

BibLaTeX (mit biber):

```bibtex
@software{seeger2026heimatschichten,
	author = {Seeger, Tobias},
	date = {2026},
	title = {Heimatschichten. {Historische} {Karten} für den {Kreis} {Minden}-{L}übbecke},
	version = {0.1.0},
	url = {https://experiments.erleben.app/heimatschichten/},
	urldate = {2026-10-17},
}
```

Quelltext: https://github.com/TobiasSeeger/zeitschichten.
Maschinenlesbar in [CITATION.cff](CITATION.cff), GitHub zeigt dazu rechts
„Cite this repository“.

## Lizenz

- Code: [MIT](LICENSE), Urheber des Originals ist Tim Krämer
- eigene Daten und Texte (Quellen, Erklärungen, vorberechnete Ergebnisse): [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.de)
- Daten aus OpenStreetMap (Ortsverzeichnis, Gebiete, Flussläufe, Kreisgrenze): [ODbL 1.0](https://opendatacommons.org/licenses/odbl/), © OpenStreetMap-Mitwirkende
- Altkarten-Scans: je nach Archiv Public Domain Mark oder CC BY-SA 4.0. Die Messtischblätter 1898 (Ausgabe 1938) führt die SLUB als urheberrechtlich geschützt
- Zitierstile in `public/csl/` aus dem CSL-Projekt: [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/deed.de), DAI-Stil angepasst

Die Aufstellung je Datei steht in [docs/daten.md](docs/daten.md).

## Mitwirken

Hinweise, Korrekturen und Pull Requests sind willkommen. Wie man Ebenen
oder Quellen ergänzt, steht in [CONTRIBUTING.md](CONTRIBUTING.md).
Verbesserungen an Funktionen und Bedienung gehen gern auch als Pull Request
an das [Original](https://github.com/TimKraemer/roemerlager-westfalen).
