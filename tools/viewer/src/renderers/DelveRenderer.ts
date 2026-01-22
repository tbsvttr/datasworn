/**
 * Delve-specific rendering functions for sites, themes, and domains
 */

import type { Datasworn } from '@datasworn/core'
import { escapeHtml, generateId } from '../utils/html'
import { formatRank } from '../utils/formatting'
import { formatRollRange } from '../utils/dice'
import { renderMarkdown } from '../utils/markdown'
import { ROLL_DATA_ATTR, encodeRollInfo } from './OracleRenderer'

/** Render a Delve Site */
export function renderDelveSite(site: Datasworn.DelveSite): string {
	let html = '<div class="delve-site-card">'

	// Region badge
	if (site.region) {
		html += `<div class="delve-region">${escapeHtml(site.region)}</div>`
	}

	// Rank
	if (site.rank !== undefined) {
		html += `<div class="delve-rank"><strong>Rank:</strong> ${formatRank(site.rank)}</div>`
	}

	// Theme and Domain references
	html += '<div class="delve-refs">'
	if (site.theme) {
		html += `<div class="delve-ref"><strong>Theme:</strong> <a href="datasworn:${site.theme}">${formatRef(site.theme)}</a></div>`
	}
	if (site.domain) {
		html += `<div class="delve-ref"><strong>Domain:</strong> <a href="datasworn:${site.domain}">${formatRef(site.domain)}</a></div>`
	}
	html += '</div>'

	// Description
	if (site.description) {
		html += `<div class="delve-description">${renderMarkdown(site.description)}</div>`
	}

	html += '</div>'

	// Denizens table
	if (site.denizens && site.denizens.length > 0) {
		html += '<div class="detail-section">'
		html += '<div class="detail-section-title">Denizens</div>'
		html += renderDenizensTable(site.denizens)
		html += '</div>'
	}

	return html
}

/** Render a Delve Site Theme */
export function renderDelveSiteTheme(theme: Datasworn.DelveSiteTheme): string {
	let html = '<div class="delve-theme-card">'

	// Summary
	if (theme.summary) {
		html += `<div class="delve-summary">${renderMarkdown(theme.summary)}</div>`
	}

	html += '</div>'

	// Features table
	if (theme.features && theme.features.length > 0) {
		html += '<div class="detail-section">'
		html += '<div class="detail-section-title">Features</div>'
		html += renderFeaturesTable(theme.features)
		html += '</div>'
	}

	// Dangers table
	if (theme.dangers && theme.dangers.length > 0) {
		html += '<div class="detail-section">'
		html += '<div class="detail-section-title">Dangers</div>'
		html += renderDangersTable(theme.dangers)
		html += '</div>'
	}

	return html
}

/** Render a Delve Site Domain */
export function renderDelveSiteDomain(domain: Datasworn.DelveSiteDomain): string {
	let html = '<div class="delve-domain-card">'

	// Summary
	if (domain.summary) {
		html += `<div class="delve-summary">${renderMarkdown(domain.summary)}</div>`
	}

	html += '</div>'

	// Features table
	if (domain.features && domain.features.length > 0) {
		html += '<div class="detail-section">'
		html += '<div class="detail-section-title">Features</div>'
		html += renderFeaturesTable(domain.features)
		html += '</div>'
	}

	// Dangers table
	if (domain.dangers && domain.dangers.length > 0) {
		html += '<div class="detail-section">'
		html += '<div class="detail-section-title">Dangers</div>'
		html += renderDangersTable(domain.dangers)
		html += '</div>'
	}

	return html
}

/** Render a denizens table */
function renderDenizensTable(denizens: Datasworn.DelveSiteDenizen[]): string {
	const tableId = generateId('denizens')
	const rollInfo = { type: 'oracle' as const, tableId, dice: '1d100' }

	let html = '<div class="delve-table oracle-table">'
	html += `<button class="roll-button" ${ROLL_DATA_ATTR}="${encodeRollInfo(rollInfo)}">Roll 1d100</button>`
	html += `<div class="roll-result" id="${tableId}-result"></div>`
	html += `<table id="${tableId}">`
	html += '<thead><tr><th class="roll-col">Roll</th><th>Denizen</th><th>Frequency</th></tr></thead>'
	html += '<tbody>'

	for (const denizen of denizens) {
		const rollStr = denizen.roll ? formatRollRange(denizen.roll) : ''
		const minRoll = denizen.roll?.min ?? 0
		const maxRoll = denizen.roll?.max ?? 0
		const frequency = formatFrequency(denizen.frequency)

		html += `<tr data-min="${minRoll}" data-max="${maxRoll}">`
		html += `<td class="roll-cell">${rollStr}</td>`
		if (denizen.npc) {
			const npcName = formatRef(denizen.npc)
			html += `<td><a href="datasworn:${denizen.npc}">${escapeHtml(npcName)}</a></td>`
		} else {
			// Some denizens may have name instead of npc reference
			const denizenAny = denizen as unknown as Record<string, unknown>
			const name = denizenAny.name as string | undefined
			html += `<td>${escapeHtml(name || 'Unknown')}</td>`
		}
		html += `<td class="frequency-cell frequency-${denizen.frequency}">${frequency}</td>`
		html += '</tr>'
	}

	html += '</tbody></table></div>'
	return html
}

/** Render a features table */
function renderFeaturesTable(features: Datasworn.DelveSiteDomainFeature[] | Datasworn.DelveSiteThemeFeature[]): string {
	const tableId = generateId('features')
	const dice = getDiceFromRows(features)
	const rollInfo = { type: 'oracle' as const, tableId, dice }

	let html = '<div class="delve-table oracle-table">'
	html += `<button class="roll-button" ${ROLL_DATA_ATTR}="${encodeRollInfo(rollInfo)}">Roll ${dice}</button>`
	html += `<div class="roll-result" id="${tableId}-result"></div>`
	html += `<table id="${tableId}">`
	html += '<thead><tr><th class="roll-col">Roll</th><th>Feature</th></tr></thead>'
	html += '<tbody>'

	for (const feature of features) {
		const rollStr = feature.roll ? formatRollRange(feature.roll) : ''
		const minRoll = feature.roll?.min ?? 0
		const maxRoll = feature.roll?.max ?? 0
		const text = feature.text ? renderMarkdown(feature.text) : ''

		html += `<tr data-min="${minRoll}" data-max="${maxRoll}">`
		html += `<td class="roll-cell">${rollStr}</td>`
		html += `<td>${text}</td>`
		html += '</tr>'
	}

	html += '</tbody></table></div>'
	return html
}

/** Render a dangers table */
function renderDangersTable(dangers: Datasworn.DelveSiteDomainDanger[] | Datasworn.DelveSiteThemeDanger[]): string {
	const tableId = generateId('dangers')
	const dice = getDiceFromRows(dangers)
	const rollInfo = { type: 'oracle' as const, tableId, dice }

	let html = '<div class="delve-table oracle-table">'
	html += `<button class="roll-button" ${ROLL_DATA_ATTR}="${encodeRollInfo(rollInfo)}">Roll ${dice}</button>`
	html += `<div class="roll-result" id="${tableId}-result"></div>`
	html += `<table id="${tableId}">`
	html += '<thead><tr><th class="roll-col">Roll</th><th>Danger</th></tr></thead>'
	html += '<tbody>'

	for (const danger of dangers) {
		const rollStr = danger.roll ? formatRollRange(danger.roll) : ''
		const minRoll = danger.roll?.min ?? 0
		const maxRoll = danger.roll?.max ?? 0
		let text = danger.text ? renderMarkdown(danger.text) : ''

		// Add suggestions as links
		const suggestions = (danger as { suggestions?: string[] }).suggestions
		if (suggestions && suggestions.length > 0) {
			const links = suggestions
				.map((s) => `<a href="datasworn:${s}">${formatRef(s)}</a>`)
				.join(', ')
			text += `<div class="delve-suggestions">Roll: ${links}</div>`
		}

		html += `<tr data-min="${minRoll}" data-max="${maxRoll}">`
		html += `<td class="roll-cell">${rollStr}</td>`
		html += `<td>${text}</td>`
		html += '</tr>'
	}

	html += '</tbody></table></div>'
	return html
}

/** Format a datasworn reference ID to a display name */
function formatRef(ref: string): string {
	// Extract the last part of the ID: "npc:classic/ironlanders/raider" -> "Raider"
	const parts = ref.split('/')
	const lastPart = parts[parts.length - 1]
	return lastPart
		.replace(/_/g, ' ')
		.replace(/\b\w/g, (c) => c.toUpperCase())
}

/** Format denizen frequency */
function formatFrequency(frequency: string): string {
	return frequency
		.replace(/_/g, ' ')
		.replace(/\b\w/g, (c) => c.toUpperCase())
}

/** Determine dice notation from table rows */
function getDiceFromRows(rows: { roll?: { min: number; max: number } | null }[]): string {
	if (rows.length === 0) return '1d100'

	// Find the max value in the table
	let maxValue = 0
	for (const row of rows) {
		if (row.roll && row.roll.max > maxValue) {
			maxValue = row.roll.max
		}
	}

	// Determine dice based on max value
	if (maxValue <= 6) return '1d6'
	if (maxValue <= 10) return '1d10'
	if (maxValue <= 12) return '1d12'
	if (maxValue <= 20) return '1d20'
	return '1d100'
}
