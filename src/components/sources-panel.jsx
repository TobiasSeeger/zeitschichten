"use client"

import FormatQuoteIcon from "@mui/icons-material/FormatQuote"
import { Box, Button, IconButton, Link, Typography } from "@mui/material"
import { CITATION } from "@/config"
import sources from "@/data/quellen.json"
import { ALL_REFS, resolveSource } from "@/lib/literature"
import CitationBox from "./citation-box"
import { openCite } from "./cite-dialog"
import { SectionTitle } from "./layer-panel"

export default function SourcesPanel() {
	return (
		<Box>
			<SectionTitle>Zitiervorschlag</SectionTitle>
			<Typography variant="body2" color="text.secondary">
				Karte und Zusammenstellung der Quellen von {CITATION.author},{" "}
				{CITATION.year}.
			</Typography>
			<CitationBox />
			<SectionTitle>Literatur und Daten</SectionTitle>
			<Typography variant="body2" color="text.secondary">
				Alle {ALL_REFS.length} Titel und Datenquellen mit geprüften Angaben
				(DOI, Bibliothekskatalog), zum Übernehmen in Zotero, Citavi oder LaTeX.
			</Typography>
			<Button
				size="small"
				startIcon={<FormatQuoteIcon fontSize="small" />}
				onClick={() =>
					openCite({
						title: "Literatur und Daten",
						intro:
							"Alle Titel und Datenquellen der Karte. Für LaTeX als .bib, für Zotero, Citavi und EndNote als .ris herunterladen.",
						items: ALL_REFS,
						base: "heimatschichten-literatur",
					})
				}
				sx={{ px: 0, textTransform: "none" }}
			>
				Literaturverzeichnis exportieren
			</Button>
			{sources.map((group, gi) => (
				<Box key={group.title}>
					<SectionTitle>{group.title}</SectionTitle>
					{group.intro && (
						<Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
							{group.intro}
						</Typography>
					)}
					{group.items.map(resolveSource).map((item, ii) => (
						<Box
							key={`${item.ref ?? item.label}-${ii}`}
							id={`quelle-${gi}-${ii}`}
							sx={{ mb: 1.25, display: "flex", alignItems: "flex-start" }}
						>
							<Box sx={{ flex: 1, minWidth: 0 }}>
								{item.url ? (
									<Link
										href={item.url}
										target="_blank"
										rel="noreferrer"
										variant="body2"
									>
										{item.label}
									</Link>
								) : (
									<Typography variant="body2">{item.label}</Typography>
								)}
								{item.note && (
									<Typography
										variant="caption"
										color="text.secondary"
										component="div"
									>
										{item.note}
									</Typography>
								)}
							</Box>
							{item.csl && <CiteButton title={item.label} items={[item.csl]} />}
						</Box>
					))}
				</Box>
			))}
		</Box>
	)
}

/** Kleiner Knopf, der den Zitierdialog für einen oder mehrere Titel öffnet. */
export function CiteButton({ title, items, base }) {
	return (
		<IconButton
			size="small"
			aria-label="Zitieren"
			title="Zitieren (DAI, APA, BibTeX, RIS …)"
			onClick={() =>
				openCite({
					title: "Zitieren",
					intro: title,
					items,
					base: base ?? items[0].id,
				})
			}
			sx={{ mt: -0.5, ml: 0.5 }}
		>
			<FormatQuoteIcon fontSize="small" />
		</IconButton>
	)
}
