"use client"

import ExpandLessIcon from "@mui/icons-material/ExpandLess"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import TuneIcon from "@mui/icons-material/Tune"
import {
	Box,
	Button,
	FormControlLabel,
	IconButton,
	Paper,
	Stack,
	Switch,
	Typography,
} from "@mui/material"
import { useState } from "react"
import { CITATION, SHORT_CREDIT } from "@/lib/citation"
import { OVERLAYS } from "@/lib/layers"
import { DEFAULT_REGION } from "@/lib/regions"
import { anyLayerVisible, useMapStore } from "@/store/use-map-store"

function SectionTitle({ children }) {
	return (
		<Typography
			variant="overline"
			color="text.secondary"
			component="div"
			sx={{ mt: 2, mb: 0.5, lineHeight: 1.6 }}
		>
			{children}
		</Typography>
	)
}

function Title() {
	return (
		<Box>
			<Typography variant="h6" component="h2" sx={{ lineHeight: 1.25 }}>
				{CITATION.title}
			</Typography>
			<Typography variant="caption" color="text.secondary">
				{CITATION.subtitle}
			</Typography>
		</Box>
	)
}

/** Eingeschaltete Ebenen mit Schalter, damit man sie gleich hier abwählt. */
function ShownLayers() {
	const overlays = useMapStore((s) => s.overlays)
	const setOverlay = useMapStore((s) => s.setOverlay)
	const showRegion = useMapStore((s) => s.showRegion)
	const anyVisible = useMapStore(anyLayerVisible)

	if (!anyVisible)
		return (
			<Typography variant="caption" color="text.secondary">
				Alle Ebenen sind ausgeblendet, die Karte zeigt nur die Grundkarte.
			</Typography>
		)
	return (
		<Stack>
			{OVERLAYS.filter((o) => overlays[o.id].visible).map((o) => (
				<FormControlLabel
					key={o.id}
					control={
						<Switch
							size="small"
							checked
							onChange={() => setOverlay(o.id, { visible: false })}
						/>
					}
					label={<Typography variant="body2">{o.label}</Typography>}
				/>
			))}
			{showRegion && (
				<Stack
					direction="row"
					spacing={1}
					sx={{ alignItems: "center", mt: 0.5 }}
				>
					<Box sx={{ width: 20, borderTop: "2px dashed #4a148c" }} />
					<Typography variant="caption">
						Grenze {DEFAULT_REGION.label}
					</Typography>
				</Stack>
			)}
		</Stack>
	)
}

/** Kurze Einführung und die eingeschalteten Ebenen. */
export function EasyContent({ heading = false }) {
	return (
		<>
			{heading && (
				<Box sx={{ pt: 1.5 }}>
					<Title />
				</Box>
			)}
			<Typography variant="body2" sx={{ mt: 1.25 }}>
				{CITATION.intro}
			</Typography>

			<SectionTitle>Auf der Karte</SectionTitle>
			<ShownLayers />

			<Typography
				variant="caption"
				color="text.secondary"
				component="p"
				sx={{ mt: 2 }}
			>
				{SHORT_CREDIT}
			</Typography>
		</>
	)
}

/** Schwebende Startkarte am Desktop. */
export default function EasyPanel() {
	const setPanelOpen = useMapStore((s) => s.setPanelOpen)
	const [collapsed, setCollapsed] = useState(false)

	return (
		<Paper
			elevation={4}
			sx={{
				position: "absolute",
				left: 16,
				// Unter der Suchleiste (16 px Rand + 52 px hoch), mit Luft dazwischen
				top: 84,
				width: 340,
				maxWidth: "calc(100vw - 32px)",
				maxHeight: "calc(100dvh - 188px)",
				display: "flex",
				flexDirection: "column",
				overflow: "hidden",
				zIndex: 2,
			}}
		>
			<Stack
				direction="row"
				sx={{ alignItems: "flex-start", px: 2, pt: 2, pb: collapsed ? 0 : 0.5 }}
			>
				<Box sx={{ flex: 1 }}>
					<Title />
				</Box>
				<IconButton
					size="small"
					onClick={() => setCollapsed(!collapsed)}
					aria-label={collapsed ? "Ausklappen" : "Einklappen"}
					sx={{ mr: -0.5 }}
				>
					{collapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
				</IconButton>
			</Stack>

			{!collapsed && (
				<Box sx={{ flex: 1, minHeight: 0, overflow: "auto", px: 2, pb: 1 }}>
					<EasyContent />
				</Box>
			)}

			<Box
				sx={{
					p: 2,
					pt: 1.5,
					borderTop: collapsed ? 0 : 1,
					borderColor: "divider",
				}}
			>
				<Button
					fullWidth
					variant="outlined"
					startIcon={<TuneIcon />}
					onClick={() => {
						// Die Startkarte selbst steht schon hier, also gleich die Ebenen
						const s = useMapStore.getState()
						if (s.panelTab === "start") s.setPanelTab("layers")
						setPanelOpen(true)
					}}
				>
					Ebenen, Einstellungen und Quellen
				</Button>
			</Box>
		</Paper>
	)
}
