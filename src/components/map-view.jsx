"use client"

import "maplibre-gl/dist/maplibre-gl.css"
import { Box, CircularProgress } from "@mui/material"
import * as maplibregl from "maplibre-gl"
import { useEffect, useRef, useState } from "react"
import { assetUrl, BASE_PATH } from "@/config"
import { SHORT_CREDIT } from "@/lib/citation"
import {
	BASE_LAYERS,
	FONT,
	GLYPHS,
	MOOR_1844_FILE,
	MOOR_FILE,
	MOOR_LAYER,
	OVERLAYS,
	partsOf,
	styleFor,
	styleLayersOf,
	TIME_WATER_FILE,
	TIME_WATER_LAYER,
	WALD_FILE,
	WALD_LAYER,
	WEGE_FILE,
	WEGE_LAYER,
} from "@/lib/layers"
import maplibreVersion from "@/lib/maplibre-version.json"
import { setPrefetchMap } from "@/lib/prefetch"
import { DEFAULT_REGION, MAP_BOUNDS } from "@/lib/regions"
import { isMobile, mapInsets } from "@/lib/sheet"
import { useMapStore } from "@/store/use-map-store"

// Startansicht aus dem URL-Hash (#zoom/lat/lon), sonst der Kreis
function initialView() {
	const [zoom, lat, lon] = window.location.hash.slice(1).split("/").map(Number)
	if ([zoom, lat, lon].every(Number.isFinite)) {
		return { center: [lon, lat], zoom }
	}
	return {
		bounds: DEFAULT_REGION.view.bounds,
		// Links Platz für die Startkarte lassen, auf dem Handy oben für die
		// Suchleiste und unten für das eingeklappte Sheet
		fitBoundsOptions: {
			padding: isMobile()
				? { ...mapInsets(), left: 16, right: 16 }
				: { top: 40, bottom: 40, left: 380, right: 40 },
		},
	}
}
const EMPTY = { type: "FeatureCollection", features: [] }
const HALO = {
	"text-halo-color": "rgba(255,255,255,0.92)",
	"text-halo-width": 1.6,
}

function buildStyle() {
	const style = { version: 8, glyphs: GLYPHS, sources: {}, layers: [] }
	for (const layer of [...BASE_LAYERS, ...OVERLAYS]) {
		const part = styleFor(layer)
		Object.assign(style.sources, part.sources)
		style.layers.push(...part.layers)
	}
	return style
}

// Leere Ebene, unter der eigene Karten liegen: über den Ebenen aus dem
// Style, unter Kreisgrenze und Suchtreffer
const CUSTOM_ANCHOR = "eigene-karten-anker"

/** Kreisgrenze als Orientierung und Anker für eigene Karten. */
function addRegionLayers(map) {
	map.addLayer({
		id: CUSTOM_ANCHOR,
		type: "background",
		layout: { visibility: "none" },
	})
	map.addSource("region", { type: "geojson", data: DEFAULT_REGION.outline })
	map.addLayer({
		id: "region-casing",
		type: "line",
		source: "region",
		paint: { "line-color": "#fff", "line-width": 4, "line-opacity": 0.7 },
	})
	map.addLayer({
		id: "region",
		type: "line",
		source: "region",
		paint: {
			"line-color": "#4a148c",
			"line-width": 1.6,
			"line-dasharray": [4, 2],
		},
	})
}

/** Markierung für den gewählten Suchtreffer, über allem anderen. */
function addSearchLayers(map) {
	map.addSource("search-hit", { type: "geojson", data: EMPTY })
	const lines = ["!=", ["geometry-type"], "Point"]
	const points = ["==", ["geometry-type"], "Point"]
	map.addLayer({
		id: "search-hit-glow",
		type: "line",
		source: "search-hit",
		filter: lines,
		layout: { "line-cap": "round", "line-join": "round" },
		paint: {
			"line-color": "#ffd600",
			"line-opacity": 0.55,
			"line-width": ["interpolate", ["linear"], ["zoom"], 6, 8, 14, 16],
		},
	})
	map.addLayer({
		id: "search-hit-line",
		type: "line",
		source: "search-hit",
		filter: lines,
		layout: { "line-cap": "round", "line-join": "round" },
		paint: { "line-color": "#e65100", "line-width": 2.5 },
	})
	map.addLayer({
		id: "search-hit-point",
		type: "circle",
		source: "search-hit",
		filter: points,
		paint: {
			"circle-radius": 11,
			"circle-color": "rgba(255,214,0,0.35)",
			"circle-stroke-color": "#e65100",
			"circle-stroke-width": 3,
		},
	})
	map.addLayer({
		id: "search-hit-label",
		type: "symbol",
		source: "search-hit",
		filter: points,
		layout: {
			"text-field": ["get", "label"],
			"text-font": FONT,
			"text-size": 13,
			"text-offset": [0, 1.4],
			"text-anchor": "top",
		},
		paint: { "text-color": "#bf360c", ...HALO },
	})
}

/** Eigene Karte als Quelle und Layer, unter Kreisgrenze und Suchtreffer. */
function addCustomLayer(map, id, l) {
	if (l.kind === "raster") {
		map.addSource(id, {
			type: "raster",
			tiles: l.tiles,
			tileSize: l.tileSize ?? 256,
			maxzoom: l.maxzoom ?? 19,
			attribution: l.attribution ?? l.name,
		})
		map.addLayer({ id, type: "raster", source: id }, CUSTOM_ANCHOR)
	} else if (l.kind === "image") {
		map.addSource(id, { type: "image", url: l.url, coordinates: l.corners })
		map.addLayer(
			{ id, type: "raster", source: id, paint: { "raster-fade-duration": 0 } },
			CUSTOM_ANCHOR,
		)
	} else if (l.kind === "vector") {
		map.addSource(id, { type: "geojson", data: l.data })
		const color = l.color ?? "#00e5ff"
		map.addLayer({
			id: `${id}-fill`,
			type: "fill",
			source: id,
			filter: ["==", ["geometry-type"], "Polygon"],
			paint: { "fill-color": color, "fill-opacity": 0.3 },
		})
		map.addLayer({
			id: `${id}-line`,
			type: "line",
			source: id,
			filter: ["in", ["geometry-type"], ["literal", ["LineString", "Polygon"]]],
			paint: { "line-color": color, "line-width": 2.5 },
		})
		map.addLayer({
			id: `${id}-point`,
			type: "circle",
			source: id,
			filter: ["==", ["geometry-type"], "Point"],
			paint: {
				"circle-color": color,
				"circle-radius": 6,
				"circle-stroke-color": "#000",
				"circle-stroke-width": 1,
			},
		})
	}
}

// React StrictMode entfernt die erste Karte, bevor der State nachzieht
const alive = (map) => map && !map._removed

// Quellen und kleinste Zoomstufe je Ebene, für die Ladeanzeige
const OVERLAY_SOURCES = Object.fromEntries(
	OVERLAYS.map((l) => [l.id, Object.keys(styleFor(l).sources)]),
)
const OVERLAY_MINZOOM = Object.fromEntries(
	OVERLAYS.map((l) => [
		l.id,
		Math.min(...partsOf(l).map((p) => p.minzoom ?? 0)),
	]),
)

/** "loading", "zoom", "outside" oder nichts, je eingeschalteter Ebene. */
function overlayStatus(map, overlays) {
	const zoom = map.getZoom()
	const view = map.getBounds()
	const status = {}
	for (const layer of OVERLAYS) {
		if (!overlays[layer.id]?.visible) continue
		const sources = OVERLAY_SOURCES[layer.id]
		if (!sources.length) continue
		const b = layer.bounds
		if (zoom < OVERLAY_MINZOOM[layer.id]) status[layer.id] = "zoom"
		else if (
			b &&
			(b[0] > view.getEast() ||
				b[2] < view.getWest() ||
				b[1] > view.getNorth() ||
				b[3] < view.getSouth())
		)
			status[layer.id] = "outside"
		else if (sources.some((id) => map.getSource(id) && !map.isSourceLoaded(id)))
			status[layer.id] = "loading"
	}
	return status
}

export default function MapView({ onMapReady }) {
	const container = useRef(null)
	// Erst nach "load" gesetzt, alle Effekte hängen daran
	const [map, setMap] = useState(null)
	// Einmal beim ersten Rendern lesen: map.remove() löscht den Hash wieder
	const [view] = useState(initialView)

	const baseLayer = useMapStore((s) => s.baseLayer)
	const overlays = useMapStore((s) => s.overlays)
	const showRegion = useMapStore((s) => s.showRegion)
	const searchHit = useMapStore((s) => s.searchHit)

	useEffect(() => {
		maplibregl.setWorkerUrl(
			new URL(
				`${BASE_PATH}/maplibre/maplibre-gl-worker.mjs?v=${maplibreVersion.version}`,
				window.location.origin,
			).href,
		)
		const map = new maplibregl.Map({
			container: container.current,
			style: buildStyle(),
			...view,
			maxZoom: 19,
			maxBounds: MAP_BOUNDS,
			renderWorldCopies: false,
			// Ausschnitt in der URL, damit er sich teilen lässt
			hash: true,
			attributionControl: { compact: true, customAttribution: SHORT_CREDIT },
		})
		map.addControl(new maplibregl.NavigationControl(), "bottom-right")
		map.addControl(
			new maplibregl.ScaleControl({ unit: "metric" }),
			"bottom-left",
		)

		map.on("load", () => {
			// Auf dem Handy die Quellenangabe zugeklappt starten, ausgeklappt
			// verdeckt sie über dem Sheet zu viel Karte. Das (i) öffnet sie.
			if (isMobile()) {
				map
					.getContainer()
					.querySelector(".maplibregl-compact-show")
					?.classList.remove("maplibregl-compact-show")
			}
			addRegionLayers(map)
			addSearchLayers(map)
			setPrefetchMap(map)
			setMap(map)
			onMapReady?.(map)
		})
		return () => {
			setMap(null)
			map.remove()
		}
	}, [onMapReady, view])

	useEffect(() => {
		if (!alive(map)) return
		for (const layer of BASE_LAYERS) {
			for (const { id } of styleLayersOf(layer)) {
				map.setLayoutProperty(
					id,
					"visibility",
					layer.id === baseLayer ? "visible" : "none",
				)
			}
		}
	}, [baseLayer, map])

	useEffect(() => {
		if (!alive(map)) return
		for (const layer of OVERLAYS) {
			const o = overlays[layer.id]
			for (const { id, opacity } of styleLayersOf(layer)) {
				map.setLayoutProperty(id, "visibility", o.visible ? "visible" : "none")
				if (opacity) map.setPaintProperty(id, opacity, o.opacity)
				else
					map.setPaintProperty(
						id,
						"hillshade-exaggeration",
						Math.min(1, o.opacity),
					)
			}
		}
	}, [overlays, map])

	// Gewässer aus den historischen Karten erst beim ersten Einschalten laden
	const timeWaterOn = overlays[TIME_WATER_LAYER]?.visible
	const timeWaterLoaded = useRef(null)
	useEffect(() => {
		if (!alive(map) || !timeWaterOn || timeWaterLoaded.current === map) return
		timeWaterLoaded.current = map
		map.getSource(TIME_WATER_LAYER).setData(assetUrl(TIME_WATER_FILE))
	}, [timeWaterOn, map])

	// Moore und nasse Flächen: Dateien beim ersten Einschalten laden
	const moorOn = overlays[MOOR_LAYER]?.visible
	const moorLoaded = useRef(null)
	useEffect(() => {
		if (!alive(map) || !moorOn || moorLoaded.current === map) return
		moorLoaded.current = map
		map.getSource(MOOR_LAYER).setData(assetUrl(MOOR_FILE))
		map.getSource(`${MOOR_LAYER}-1844`).setData(assetUrl(MOOR_1844_FILE))
	}, [moorOn, map])

	// Wald um 1840: Datei beim ersten Einschalten laden
	const waldOn = overlays[WALD_LAYER]?.visible
	const waldLoaded = useRef(null)
	useEffect(() => {
		if (!alive(map) || !waldOn || waldLoaded.current === map) return
		waldLoaded.current = map
		map.getSource(WALD_LAYER).setData(assetUrl(WALD_FILE))
	}, [waldOn, map])

	// Hauptwege um 1840: Datei beim ersten Einschalten laden
	const wegeOn = overlays[WEGE_LAYER]?.visible
	const wegeLoaded = useRef(null)
	useEffect(() => {
		if (!alive(map) || !wegeOn || wegeLoaded.current === map) return
		wegeLoaded.current = map
		map.getSource(WEGE_LAYER).setData(assetUrl(WEGE_FILE))
	}, [wegeOn, map])

	// Ladezustand der eingeschalteten Ebenen für Panel und Ladeanzeige
	const setOverlayStatus = useMapStore((s) => s.setOverlayStatus)
	useEffect(() => {
		if (!alive(map)) return
		let frame = 0
		let last = ""
		const update = () => {
			frame = 0
			if (!alive(map)) return
			const status = overlayStatus(map, overlays)
			const key = JSON.stringify(status)
			if (key !== last) {
				last = key
				setOverlayStatus(status)
			}
		}
		const schedule = () => {
			frame ||= requestAnimationFrame(update)
		}
		const events = ["dataloading", "sourcedata", "idle", "moveend"]
		for (const e of events) map.on(e, schedule)
		schedule()
		return () => {
			for (const e of events) map.off(e, schedule)
			cancelAnimationFrame(frame)
		}
	}, [overlays, map, setOverlayStatus])
	const loading = useMapStore((s) =>
		Object.values(s.overlayStatus).includes("loading"),
	)

	// Eigene Karten: Quellen und Layer anlegen, entfernen, schalten
	const customLayers = useMapStore((s) => s.customLayers)
	useEffect(() => {
		if (!alive(map)) return
		const wanted = new Set(customLayers.map((l) => `custom-${l.id}`))
		for (const layer of map.getStyle().layers) {
			const base = layer.id.replace(/-(fill|line|point)$/, "")
			if (base.startsWith("custom-") && !wanted.has(base))
				map.removeLayer(layer.id)
		}
		for (const id of Object.keys(map.getStyle().sources)) {
			if (id.startsWith("custom-") && !wanted.has(id)) map.removeSource(id)
		}
		for (const l of customLayers) {
			const id = `custom-${l.id}`
			if (!map.getSource(id)) addCustomLayer(map, id, l)
			const visibility = l.visible ? "visible" : "none"
			for (const suffix of ["", "-fill", "-line", "-point"]) {
				const lid = id + suffix
				if (!map.getLayer(lid)) continue
				map.setLayoutProperty(lid, "visibility", visibility)
				const type = map.getLayer(lid).type
				const prop = {
					raster: "raster-opacity",
					fill: "fill-opacity",
					line: "line-opacity",
					circle: "circle-opacity",
				}[type]
				map.setPaintProperty(
					lid,
					prop,
					type === "fill" ? l.opacity * 0.35 : l.opacity,
				)
			}
		}
	}, [customLayers, map])

	useEffect(() => {
		if (!alive(map)) return
		for (const id of ["region", "region-casing"]) {
			map.setLayoutProperty(id, "visibility", showRegion ? "visible" : "none")
		}
	}, [showRegion, map])

	useEffect(() => {
		if (!alive(map)) return
		const data = searchHit
			? { type: "FeatureCollection", features: [searchHit] }
			: EMPTY
		map.getSource("search-hit").setData(data)
	}, [searchHit, map])

	return (
		<>
			<div ref={container} style={{ position: "absolute", inset: 0 }} />
			{loading && (
				<Box
					role="status"
					sx={{
						position: "absolute",
						left: "50%",
						bottom: 44,
						transform: "translateX(-50%)",
						display: "flex",
						alignItems: "center",
						gap: 1,
						px: 1.5,
						py: 0.5,
						borderRadius: 4,
						bgcolor: "rgba(255,255,255,0.92)",
						boxShadow: 1,
						fontSize: 13,
						pointerEvents: "none",
						zIndex: 2,
					}}
				>
					<CircularProgress size={14} />
					Karte lädt …
				</Box>
			)}
		</>
	)
}
