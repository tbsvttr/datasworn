/**
 * Atlas entry rendering functions
 */

import type { Datasworn } from '@datasworn/core'
import { renderMarkdown } from '../utils/markdown'

/** Render an atlas entry */
export function renderAtlasEntry(entry: Datasworn.AtlasEntry): string {
	let html = '<div class="atlas-card">'

	if (entry.summary) {
		html += `<div class="atlas-summary">${renderMarkdown(entry.summary)}</div>`
	}

	if (entry.description) {
		html += `<div class="atlas-description">${renderMarkdown(entry.description)}</div>`
	}

	if (entry.features && entry.features.length > 0) {
		html += `<div class="atlas-section">`
		html += `<div class="atlas-section-title">Features</div>`
		html += `<ul class="atlas-list">`
		for (const f of entry.features) {
			html += `<li>${renderMarkdown(f)}</li>`
		}
		html += `</ul></div>`
	}

	html += '</div>'
	return html
}
