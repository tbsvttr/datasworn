/**
 * Oracle rendering functions
 */

import type { Datasworn } from '@datasworn/core'
import type { EmbeddedOracle, OracleRow } from '../types'
import { escapeHtml, generateId } from '../utils/html'
import { formatRollRange } from '../utils/dice'
import { renderMarkdown } from '../utils/markdown'

/** Data attributes for roll functionality */
export const ROLL_DATA_ATTR = 'data-roll-info'

interface RollInfo {
	type: 'oracle' | 'odds'
	tableId: string
	dice?: string
	rows?: OracleRow[]
}

/** Encode roll info as a data attribute value */
export function encodeRollInfo(info: RollInfo): string {
	return encodeURIComponent(JSON.stringify(info))
}

/** Render a standalone oracle table */
export function renderOracle(oracle: Datasworn.OracleRollable): string {
	let html = ''

	const summary = (oracle as { summary?: string }).summary
	if (summary) {
		html += `<div class="oracle-summary">${renderMarkdown(summary)}</div>`
	}

	if (oracle.rows && oracle.rows.length > 0) {
		const tableId = generateId('oracle')
		const dice = oracle.dice || '1d100'
		const rollInfo: RollInfo = { type: 'oracle', tableId, dice }

		html += `<div class="oracle-table">`
		html += `<button class="roll-button" ${ROLL_DATA_ATTR}="${encodeRollInfo(rollInfo)}">Roll ${dice}</button>`
		html += `<div class="roll-result" id="${tableId}-result"></div>`
		html += renderOracleTable(tableId, oracle.rows)
		html += `</div>`
	}

	return html
}

/** Render an embedded oracle table (inside a move) */
export function renderEmbeddedOracle(oracle: EmbeddedOracle): string {
	const rows = oracle.rows
	if (!rows || rows.length === 0) return ''

	const tableId = generateId('oracle')
	const dice = oracle.dice || '1d100'
	const rollInfo: RollInfo = { type: 'oracle', tableId, dice }

	let html = `</p><div class="embedded-oracle-table">`
	html += `<button class="roll-button" ${ROLL_DATA_ATTR}="${encodeRollInfo(rollInfo)}">Roll ${dice}</button>`
	html += `<div class="roll-result" id="${tableId}-result"></div>`
	html += renderOracleTable(tableId, rows)
	html += `</div><p>`

	return html
}

/** Render oracle columns (Ask the Oracle style) */
export function renderOracleColumns(oracles: Record<string, EmbeddedOracle>): string {
	const oracleEntries = Object.entries(oracles)
	if (oracleEntries.length === 0) return ''

	let html = `</p><div class="oracle-odds-picker">`
	html += `<div class="oracle-odds-label">Choose your odds and roll:</div>`
	html += `<div class="oracle-odds-buttons">`

	for (const [key, oracle] of oracleEntries) {
		const name = oracle.name || key
		const rows = oracle.rows || []
		const thresholdDisplay = getOddsThreshold(rows)
		const rollInfo: RollInfo = { type: 'odds', tableId: generateId('odds'), rows }

		html += `<button class="odds-button" ${ROLL_DATA_ATTR}="${encodeRollInfo(rollInfo)}">`
		html += `<span class="odds-name">${escapeHtml(name)}</span>`
		html += `<span class="odds-threshold">${thresholdDisplay}</span>`
		html += `</button>`
	}

	html += `</div>`
	html += `<div class="oracle-odds-result" id="odds-result"></div>`
	html += `</div><p>`

	return html
}

/** Get the threshold display for odds-based oracles */
function getOddsThreshold(rows: OracleRow[]): string {
	for (const row of rows) {
		const text = (row.text || '').toLowerCase()
		if (text === 'yes' && row.roll) {
			// Starforged: Yes on low rolls (1-X)
			// Classic: Yes on high rolls (X-100)
			if (row.roll.min === 1) {
				return `≤${row.roll.max}`
			} else {
				return `${row.roll.min}+`
			}
		}
	}
	return ''
}

/** Render the table portion of an oracle */
function renderOracleTable(tableId: string, rows: OracleRow[] | Datasworn.OracleRollableRow[]): string {
	let html = `<table id="${tableId}"><thead><tr><th class="roll-col">Roll</th><th>Result</th></tr></thead><tbody>`

	for (const row of rows) {
		const roll = row.roll
		const rollStr = roll ? formatRollRange(roll) : ''
		const minRoll = roll?.min ?? 0
		const maxRoll = roll?.max ?? 0

		const text = 'text' in row ? row.text : undefined
		const text2 = 'text2' in row ? (row as { text2?: string }).text2 : undefined
		const renderedText = text ? renderMarkdown(text) : ''
		const renderedText2 = text2 ? `<div class="oracle-text2">${renderMarkdown(text2)}</div>` : ''

		html += `<tr data-min="${minRoll}" data-max="${maxRoll}">`
		html += `<td class="roll-cell">${rollStr}</td>`
		html += `<td>${renderedText}${renderedText2}</td>`
		html += `</tr>`
	}

	html += `</tbody></table>`
	return html
}
