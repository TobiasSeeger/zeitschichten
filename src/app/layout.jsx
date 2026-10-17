import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter"
import { Source_Sans_3 } from "next/font/google"
import { preconnect } from "react-dom"
import { CITATION, TILES } from "@/config"
import Providers from "./providers"
import "./globals.css"

// Serifenlose für die Oberfläche. system-ui löst nicht überall
// auf eine Proportionalschrift auf (in manchen Linux-Browsern Monospace).
const sans = Source_Sans_3({
	subsets: ["latin"],
	variable: "--font-sans",
})

export const metadata = {
	title: CITATION.name,
	description: CITATION.subtitle,
	authors: [{ name: CITATION.author }],
	creator: CITATION.author,
}

// viewportFit: Inhalt bis unter Notch und Home-Leiste, die Abstände
// kommen aus env(safe-area-inset-*)
export const viewport = {
	width: "device-width",
	initialScale: 1,
	viewportFit: "cover",
	themeColor: "#8d2a1e",
}

// Dienste, von denen die Startansicht Kacheln holt (Höhenmodell und
// Schriften, Sentinel-2, Luftbilder NRW und Niedersachsen, Schummerung NRW).
// Verbindungen schon beim Lesen des HTML aufbauen spart je Dienst DNS und
// TLS, bevor MapLibre überhaupt startet.
const TILE_ORIGINS = [
	...new Set(
		[
			TILES.dem,
			TILES.glyphs,
			"https://tiles.maps.eox.at",
			"https://www.wmts.nrw.de",
			"https://www.wms.nrw.de",
			"https://opendata.lgln.niedersachsen.de",
		].map((u) => new URL(u.replace(/[{}]/g, "")).origin),
	),
]

export default function RootLayout({ children }) {
	for (const origin of TILE_ORIGINS)
		preconnect(origin, { crossOrigin: "anonymous" })
	return (
		<html lang="de" className={sans.variable}>
			<body>
				<AppRouterCacheProvider>
					<Providers>{children}</Providers>
				</AppRouterCacheProvider>
			</body>
		</html>
	)
}
