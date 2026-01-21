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

	html += renderNpcBasics(npc)

	// Features, Drives, Tactics
	html += renderNpcList('Features', npc.features)
	html += renderNpcList('Drives', npc.drives)
	html += renderNpcList('Tactics', npc.tactics)

	html += renderNpcRank(npc)

	// Quest Starter
	if (npc.quest_starter) {
		html += `<div class="npc-quest">`
		html += `<strong>Quest Starter:</strong> ${renderMarkdown(npc.quest_starter)}`
		html += `</div>`
	}

	html += '</div>'

	// Variants
	if (npc.variants) {
		for (const variant of Object.values(npc.variants)) {
			html += renderNpcVariant(variant)
		}
	}

	return html
}

/** Render an NPC's or NPC Variant's basic information (nature, summary, description) */
function renderNpcBasics(npc: Datasworn.Npc | Datasworn.NpcVariant): string {
	let html = ''

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

/** Render an NPC or NPC Variant rank, if set */
function renderNpcRank(npc: Datasworn.Npc | Datasworn.NpcVariant): string {
	if (npc.rank !== undefined) {
		return `<div class="npc-rank"><strong>Rank:</strong> ${formatRank(npc.rank)}</div>`
	}
	return ''
}

/** Render an NPC Variant */
function renderNpcVariant(variant: Datasworn.NpcVariant): string {
	let html = `<div class="detail-header">`

	html += `<h3>${escapeHtml(variant.name)}</h3>`

	if (variant._id) {
		html += `<code class="detail-id">${variant._id}</code>`
	}

	html += `</div><div class="detail-content">`

	html += '<div class="npc-card">'
	html += renderNpcBasics(variant)
	html += renderNpcRank(variant)
	html += '</div>'

	html += '</div>'

	return html
}
