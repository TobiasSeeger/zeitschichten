import { create } from "zustand"

// Eigene Kartendienste bleiben im Browser gespeichert (nicht die Dateien)
const STORAGE_KEY = "roemerlager:eigene-dienste"
function loadServices() {
	try {
		return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]")
	} catch {
		return []
	}
}
function saveServices(layers) {
	try {
		const services = layers.filter((l) => l.kind === "raster" && !l.session)
		localStorage.setItem(STORAGE_KEY, JSON.stringify(services))
	} catch {
		// privates Fenster o. ä.
	}
}

import { BASE_LAYERS, OVERLAYS } from "@/lib/layers"

// Schalter für alles über der Grundkarte, die nicht in overlays stehen
const SWITCHES = ["showRegion"]

/** Sichtbarkeit aller Ebenen außer der Grundkarte. */
function visibility(s) {
	return {
		overlays: Object.fromEntries(
			Object.entries(s.overlays).map(([id, o]) => [id, o.visible]),
		),
		custom: Object.fromEntries(s.customLayers.map((l) => [l.id, l.visible])),
		...Object.fromEntries(SWITCHES.map((k) => [k, s[k]])),
	}
}

/** Zustandsänderung, die die Sichtbarkeit v herstellt. */
function applyVisibility(s, v) {
	const customLayers = s.customLayers.map((l) => ({
		...l,
		visible: v.custom[l.id] ?? true,
	}))
	saveServices(customLayers)
	return {
		overlays: Object.fromEntries(
			Object.entries(s.overlays).map(([id, o]) => [
				id,
				{ ...o, visible: v.overlays[id] ?? o.visible },
			]),
		),
		customLayers,
		...Object.fromEntries(SWITCHES.map((k) => [k, v[k]])),
	}
}

/** Ist außer der Grundkarte noch etwas eingeschaltet? */
export function anyLayerVisible(s) {
	const v = visibility(s)
	return [
		...Object.values(v.overlays),
		...Object.values(v.custom),
		...SWITCHES.map((k) => v[k]),
	].some(Boolean)
}

export const useMapStore = create((set) => ({
	baseLayer: BASE_LAYERS[0].id,
	overlays: Object.fromEntries(
		OVERLAYS.map((o) => [
			o.id,
			{ visible: o.visible ?? false, opacity: o.opacity ?? 0.8 },
		]),
	),
	// Umriss des Kreises Minden-Lübbecke als Orientierung
	showRegion: true,
	// Sichtbarkeit vor „Alle Ebenen aus“, zum Wiederherstellen
	hiddenLayers: null,
	// Seitenleiste mit Einstellungen und Quellen, anfangs eingeklappt.
	// Auf dem Handy ist es das Sheet am unteren Rand.
	panelOpen: false,
	// Offener Reiter, auf dem Handy zuerst die Übersicht
	panelTab:
		typeof window !== "undefined" && window.innerWidth < 900
			? "start"
			: "layers",
	// Aufgeklappte Abschnitte der Seitenleiste: weitere Ebenen, eigene Karten
	folds: { more: false, custom: false },
	// Höhe des aufgeklappten Sheets als Anteil der Fensterhöhe (Handy)
	sheetFrac: 0.5,
	// Eigene Karten: Dienste, GeoTIFF, Bild mit World-File, GeoJSON/KML/GPX
	customLayers: typeof window === "undefined" ? [] : loadServices(),
	// Hervorgehobener Suchtreffer (GeoJSON-Feature) auf der Karte
	searchHit: null,

	setBaseLayer: (baseLayer) => set({ baseLayer }),
	// Zustand eingeschalteter Ebenen aus der Karte: "loading", "zoom"
	// (unter der Mindestzoomstufe) oder "outside" (außerhalb der Fläche)
	overlayStatus: {},
	setOverlayStatus: (overlayStatus) => set({ overlayStatus }),
	setOverlay: (id, patch) =>
		set((s) => ({
			overlays: { ...s.overlays, [id]: { ...s.overlays[id], ...patch } },
		})),
	// Hauptschalter: alles aus und merken, beim Einschalten zurück
	setAllLayers: (on) =>
		set((s) => {
			if (on) {
				const initial = useMapStore.getInitialState()
				return {
					...applyVisibility(s, s.hiddenLayers ?? visibility(initial)),
					hiddenLayers: null,
				}
			}
			const v = visibility(s)
			const off = (o) =>
				Object.fromEntries(Object.keys(o).map((k) => [k, false]))
			return {
				hiddenLayers: v,
				...applyVisibility(s, {
					overlays: off(v.overlays),
					custom: off(v.custom),
					...off(Object.fromEntries(SWITCHES.map((k) => [k, true]))),
				}),
			}
		}),
	setPanelOpen: (panelOpen) => set({ panelOpen }),
	setPanelTab: (panelTab) => set({ panelTab }),
	setFold: (id, open) => set((s) => ({ folds: { ...s.folds, [id]: open } })),
	setSheetFrac: (sheetFrac) => set({ sheetFrac }),
	addCustomLayer: (layer) =>
		set((s) => {
			const customLayers = [
				...s.customLayers,
				{ visible: true, opacity: 0.9, ...layer, id: `${Date.now()}` },
			]
			saveServices(customLayers)
			return { customLayers }
		}),
	updateCustomLayer: (id, patch) =>
		set((s) => {
			const customLayers = s.customLayers.map((l) =>
				l.id === id ? { ...l, ...patch } : l,
			)
			saveServices(customLayers)
			return { customLayers }
		}),
	removeCustomLayer: (id) =>
		set((s) => {
			// Eigene Bilder liegen als blob:-URL im Speicher
			const url = s.customLayers.find((l) => l.id === id)?.url
			if (url?.startsWith("blob:")) URL.revokeObjectURL(url)
			const customLayers = s.customLayers.filter((l) => l.id !== id)
			saveServices(customLayers)
			return { customLayers }
		}),
	setSearchHit: (searchHit) => set({ searchHit }),
}))
