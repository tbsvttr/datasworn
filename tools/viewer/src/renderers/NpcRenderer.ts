/**
 * NPC rendering functions
 */

import type { Datasworn } from '@datasworn/core'
import { escapeHtml } from '../utils/html'
import { formatRank } from '../utils/formatting'
import { renderMarkdown } from '../utils/markdown'

/** Render an NPC */
export function renderNpc(npc: Datasworn.Npc): string {
	let html = '<div class="npc-card">'

	// Nature
	if (npc.nature) {
		html += `<div class="npc-nature">${escapeHtml(npc.nature)}</div>`
	}

	// Summary
	if (npc.summary) {
		html += `<div class="npc-summary">${renderMarkdown(npc.summary)}</div>`
	}

	// Description
	if (npc.description) {
		html += `<div class="npc-description">${renderMarkdown(npc.description)}</div>`
	}

	// Features, Drives, Tactics
	html += renderNpcList('Features', npc.features)
	html += renderNpcList('Drives', npc.drives)
	html += renderNpcList('Tactics', npc.tactics)

	// Rank
	if (npc.rank !== undefined) {
		html += `<div class="npc-rank"><strong>Rank:</strong> ${formatRank(npc.rank)}</div>`
	}

	html += '</div>'
	return html
}

/** Render an NPC list section (features, drives, tactics) */
function renderNpcList(title: string, items?: string[]): string {
	if (!items || items.length === 0) return ''

	let html = `<div class="npc-section">`
	html += `<div class="npc-section-title">${title}</div>`
	html += `<ul class="npc-list">`
	for (const item of items) {
		html += `<li>${renderMarkdown(item)}</li>`
	}
	html += `</ul></div>`

	return html
}
