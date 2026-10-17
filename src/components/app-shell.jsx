"use client"

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import ExploreIcon from "@mui/icons-material/Explore"
import LayersIcon from "@mui/icons-material/Layers"
import MenuBookIcon from "@mui/icons-material/MenuBook"
import {
	Box,
	CircularProgress,
	Drawer,
	IconButton,
	Tab,
	Tabs,
	Typography,
	useMediaQuery,
} from "@mui/material"
import dynamic from "next/dynamic"
import { useCallback, useRef } from "react"
import { prefetchView } from "@/lib/prefetch"
import { centerOffset, DESKTOP_QUERY } from "@/lib/sheet"
import { useMapStore } from "@/store/use-map-store"
import BottomSheet from "./bottom-sheet"
import EasyPanel, { EasyContent } from "./easy-panel"
import SearchBox from "./search-box"

const MapView = dynamic(() => import("./map-view"), { ssr: false })

// Reiter und Zitierdialog sind beim Start nicht zu sehen. Sie
// kommen in eigenen Chunks und werden geladen, sobald die Karte steht und
// der Browser Luft hat (preloadPanels), spätestens beim ersten Öffnen.
const PANEL_MODULES = {
	layers: () => import("./layer-panel"),
	sources: () => import("./sources-panel"),
	cite: () => import("./cite-dialog"),
}
const loading = () => (
	<Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
		<CircularProgress size={24} />
	</Box>
)
const LayerPanel = dynamic(PANEL_MODULES.layers, { ssr: false, loading })
const SourcesPanel = dynamic(PANEL_MODULES.sources, { ssr: false, loading })
const CiteDialog = dynamic(PANEL_MODULES.cite, { ssr: false })

function preloadPanels() {
	const run = () => {
		for (const load of Object.values(PANEL_MODULES)) load()
	}
	if ("requestIdleCallback" in window)
		requestIdleCallback(run, { timeout: 4000 })
	else setTimeout(run, 1500)
}

const WIDTH = 360

const TABS = [
	{ id: "start", label: "Start", icon: <ExploreIcon fontSize="small" /> },
	{ id: "layers", label: "Ebenen", icon: <LayersIcon fontSize="small" /> },
	{ id: "sources", label: "Quellen", icon: <MenuBookIcon fontSize="small" /> },
]

function PanelTabs({ tabs, value, onSelect }) {
	return (
		<Tabs
			value={tabs.some((t) => t.id === value) ? value : false}
			variant="fullWidth"
			sx={{ borderBottom: 1, borderColor: "divider", minHeight: 56 }}
		>
			{tabs.map((t) => (
				<Tab
					key={t.id}
					value={t.id}
					icon={t.icon}
					label={t.label}
					// onClick statt onChange, damit auch der aktive Reiter reagiert
					onClick={() => onSelect(t.id)}
					sx={{
						minHeight: 56,
						minWidth: 0,
						px: 0.5,
						fontSize: 11,
						textTransform: "none",
						py: 0.5,
					}}
				/>
			))}
		</Tabs>
	)
}

export default function AppShell() {
	const mapRef = useRef(null)
	const tab = useMapStore((s) => s.panelTab)
	const setTab = useMapStore((s) => s.setPanelTab)
	const desktop = useMediaQuery(DESKTOP_QUERY, { noSsr: true })
	const open = useMapStore((s) => s.panelOpen)
	const setOpen = useMapStore((s) => s.setPanelOpen)
	const sheetFrac = useMapStore((s) => s.sheetFrac)
	const setSheetFrac = useMapStore((s) => s.setSheetFrac)

	const onMapReady = useCallback((map) => {
		mapRef.current = map
		// Erst wenn die ersten Kacheln da sind, die übrigen Chunks holen
		map.once("idle", preloadPanels)
	}, [])
	const getMap = useCallback(() => mapRef.current, [])

	const flyTo = useCallback(
		(lon, lat, zoom = 14) => {
			// Auf dem Handy das Sheet so weit senken, dass das Ziel zu sehen ist
			if (!desktop) {
				const s = useMapStore.getState()
				if (s.sheetFrac > 0.45) s.setSheetFrac(0.45)
			}
			// Zielkacheln laden, während die Kamera noch fliegt
			prefetchView([lon, lat], zoom)
			mapRef.current?.flyTo({
				center: [lon, lat],
				zoom,
				offset: centerOffset(),
			})
		},
		[desktop],
	)

	const content = (id) => (
		<>
			{id === "start" && <EasyContent heading />}
			{id === "layers" && <LayerPanel onFlyTo={flyTo} />}
			{id === "sources" && <SourcesPanel />}
		</>
	)

	const select = (id) => {
		setTab(id)
		setOpen(true)
	}

	// Karte bleibt beim Wechsel zwischen Handy- und Desktopansicht dasselbe
	// Element, sonst würde sie neu aufgebaut
	return (
		<Box sx={{ display: "flex", height: "100dvh" }}>
			{desktop && (
				<Drawer
					variant="persistent"
					open={open}
					sx={{
						width: open ? WIDTH : 0,
						flexShrink: 0,
						transition: "width 200ms ease-out",
						"& .MuiDrawer-paper": { width: WIDTH },
					}}
				>
					<Box
						sx={{
							// nicht WIDTH, die Leiste hat 1 px Rand und scrollte sonst seitlich
							width: "100%",
							display: "flex",
							flexDirection: "column",
							height: "100%",
						}}
					>
						<Box
							sx={{
								px: 2,
								pt: 2,
								pb: 1,
								display: "flex",
								alignItems: "flex-start",
							}}
						>
							<Box sx={{ flex: 1 }}>
								<Typography variant="h6" sx={{ lineHeight: 1.2 }}>
									Römerlager in Westfalen
								</Typography>
								<Typography variant="caption" color="text.secondary">
									Karten und Quellen
								</Typography>
							</Box>
							<IconButton
								size="small"
								onClick={() => setOpen(false)}
								aria-label="Seitenleiste einklappen"
							>
								<ChevronLeftIcon />
							</IconButton>
						</Box>
						<PanelTabs tabs={TABS} value={tab} onSelect={setTab} />
						<Box
							sx={{
								flex: 1,
								overflowY: "auto",
								overflowX: "hidden",
								px: 2,
								pb: 3,
							}}
						>
							{content(tab)}
						</Box>
					</Box>
				</Drawer>
			)}
			<Box
				component="main"
				sx={{ position: "relative", flex: 1, minWidth: 0, overflow: "hidden" }}
			>
				<MapView onMapReady={onMapReady} />
				<SearchBox getMap={getMap} desktop={desktop} />
				{desktop && !open && <EasyPanel />}
				{!desktop && (
					<BottomSheet
						open={open}
						frac={sheetFrac}
						onChange={(next) => {
							setSheetFrac(next.frac)
							setOpen(next.open)
						}}
						header={<PanelTabs tabs={TABS} value={tab} onSelect={select} />}
					>
						<Box sx={{ px: 2, pb: 3 }}>{content(tab)}</Box>
					</BottomSheet>
				)}
			</Box>
			<CiteDialog />
		</Box>
	)
}
