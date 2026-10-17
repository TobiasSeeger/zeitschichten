/**
 * Zentrale Einstellungen für Betrieb und Zitierweise. Jeder Wert hat einen
 * Standard, der zur Referenzinstanz unter experiments.erleben.app passt,
 * und lässt sich beim Build per Umgebungsvariable überschreiben (Vorlage:
 * .env.example). Next.js setzt NEXT_PUBLIC_*-Werte zur Build-Zeit fest ein,
 * Bun liest sie für die Skripte aus .env bzw. .env.local.
 *
 * Inhaltliche Einstellungen (Startausschnitt, Ebenen, Altkarten) stehen
 * nicht hier, sondern in src/lib/regions.js, src/lib/layers.js und
 * src/data/*.json.
 */

const pick = (value, fallback) => (value ? value : fallback)

/** Unterpfad der App, z. B. "/roemer". Leer, wenn sie im Wurzelpfad liegt. */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

// Prüfsummen der Dateien unter public/ (next.config.js)
let hashes = {}
try {
	hashes = JSON.parse(process.env.NEXT_PUBLIC_ASSET_HASHES ?? "{}")
} catch {
	// Skripte und Tests laufen ohne
}

/**
 * URL einer Datei unter public/ mit Inhalts-Prüfsumme (?v=). Solche URLs
 * cachen Server (deploy/nginx.conf) und Service Worker (public/sw.js)
 * unbegrenzt, eine geänderte Datei bekommt eine neue URL.
 */
export function assetUrl(file) {
	const v = hashes[file]
	return `${BASE_PATH}/${file}${v ? `?v=${v}` : ""}`
}

/** Version einer Datei, z. B. für Kachel-URLs eines Verzeichnisses. */
export const assetVersion = (file) => hashes[file] ?? ""

/** Kacheldienste. Alle drei müssen CORS für die eigene Domain erlauben. */
export const TILES = {
	// Höhenmodell im Terrarium-Format (Mapzen) für das farbige Relief
	dem: pick(
		process.env.NEXT_PUBLIC_DEM_TILES,
		"https://tiles.erleben.app/dem/{z}/{x}/{y}",
	),
	// Vektorkacheln im OpenMapTiles-Schema (Gewässer, Wald, Orte, Wege).
	// Öffentliche Alternative: https://tiles.openfreemap.org/planet
	vector: pick(
		process.env.NEXT_PUBLIC_VECTOR_TILES,
		"https://tiles.erleben.app/germany/{z}/{x}/{y}",
	),
	// Schriften für Kartenbeschriftungen (MapLibre-Glyphen)
	glyphs: pick(
		process.env.NEXT_PUBLIC_GLYPHS,
		"https://tiles.erleben.app/font/{fontstack}/{range}",
	),
}

/**
 * Zitiervorschlag für Karte und Quellen-Reiter. Bei Änderungen auch
 * CITATION.cff und die Version in package.json anpassen. Ein Fork mit eigener Instanz setzt
 * NEXT_PUBLIC_SITE_URL und trägt sich hier als Autor ein.
 */
export const CITATION = {
	author: "Tobias Seeger",
	authorInverted: "Seeger, Tobias",
	family: "Seeger",
	given: "Tobias",
	year: 2026,
	version: "0.1.0",
	// Kurzname für Seitenleiste, Startkarte und Browser-Tab
	name: "Heimatschichten",
	// Startkarte: Zeile unter dem Namen und kurze Einführung
	subtitle: "Historische Karten für den Kreis Minden-Lübbecke",
	title: "Heimatschichten. Historische Karten für den Kreis Minden-Lübbecke",
	intro:
		"Wie sah der Kreis Minden-Lübbecke früher aus? Die Karte legt historische Karten von 1650 bis 1945 über das heutige Luftbild. Beim Start zeigt sie die Preußische Uraufnahme um 1840, dazu Gewässer, Moore, Wald und Wege aus dieser Zeit.",
	url: pick(
		process.env.NEXT_PUBLIC_SITE_URL,
		"https://experiments.erleben.app/heimatschichten/",
	),
	repository: "https://github.com/TobiasSeeger/zeitschichten",
}
