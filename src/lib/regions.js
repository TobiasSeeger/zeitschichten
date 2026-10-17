import kreis from "@/data/kreis-minden-luebbecke.json"

/** Startausschnitt der Karte mit dem Kreisumriss als Orientierung. */
export const DEFAULT_REGION = {
	id: "minden-luebbecke",
	label: "Kreis Minden-Lübbecke",
	view: { bounds: [8.297, 52.162, 9.138, 52.531] },
	outline: kreis,
}

/**
 * Weiter lässt sich die Karte nicht verschieben oder herauszoomen:
 * Nordwestdeutschland vom Niederrhein (Xanten) bis Hachelbich und von der
 * Nordseeküste bis Oberbrechen an der Lahn, mit Rand rundherum. Breit
 * genug, dass auf Breitbildschirmen das ganze Gebiet auf einmal sichtbar
 * ist, und im Westen extra Platz, weil dort auf dem Desktop die
 * Seitenleiste über der Karte liegt. Die Ortssuche bleibt ebenfalls drinnen.
 */
export const MAP_BOUNDS = [3.0, 49.3, 14.0, 54.6]

export function inMapBounds(lon, lat) {
	const [w, s, e, n] = MAP_BOUNDS
	return lon >= w && lon <= e && lat >= s && lat <= n
}
