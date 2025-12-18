/**
 * Move rendering functions
 */

import type { Datasworn } from '@datasworn/core'
import { formatLabel, formatOutcome, OUTCOME_LABELS } from '../utils/formatting'
import { renderMarkdown } from '../utils/markdown'
import { renderEmbeddedOracle, renderOracleColumns } from './OracleRenderer'
import type { EmbeddedOracle } from '../types'

/** Render a move */
export function renderMove(move: Datasworn.Move): string {
	let html = ''
	const oracles = move.oracles as Record<string, EmbeddedOracle> | undefined

	// Roll type badge
	if (move.roll_type) {
		html += `<div class="roll-type-badge">${formatLabel(move.roll_type)}</div>`
	}

	// Trigger card
	if (move.trigger?.text) {
		html += `
			<div class="card trigger-card">
				<div class="card-header">When you...</div>
				<div class="card-body">${renderMarkdownWithOracles(move.trigger.text, oracles)}</div>
			</div>
		`
	}

	// Stats for action rolls
	html += renderActionRollStats(move)

	// Main text
	if (move.text) {
		html += `<div class="move-text">${renderMarkdownWithOracles(move.text, oracles)}</div>`
	}

	// Outcomes
	html += renderOutcomes(move, oracles)

	return html
}

/** Render stat pills for action rolls */
function renderActionRollStats(move: Datasworn.Move): string {
	if (move.roll_type !== 'action_roll' || !('trigger' in move) || !move.trigger) {
		return ''
	}

	const trigger = move.trigger as Datasworn.TriggerActionRoll
	if (!trigger.conditions) return ''

	const stats = new Set<string>()
	for (const cond of trigger.conditions) {
		if (cond.roll_options) {
			for (const opt of cond.roll_options) {
				if (opt.using === 'stat' && 'stat' in opt) {
					stats.add(opt.stat)
				}
			}
		}
	}

	if (stats.size === 0) return ''

	let html = `<div class="stat-pills">`
	for (const stat of stats) {
		html += `<span class="stat-pill">${stat}</span>`
	}
	html += `</div>`

	return html
}

/** Render move outcomes */
function renderOutcomes(move: Datasworn.Move, oracles?: Record<string, EmbeddedOracle>): string {
	if (!('outcomes' in move) || !move.outcomes) return ''

	const outcomes = move.outcomes
	let html = `<div class="outcomes">`

	const outcomeOrder = ['strong_hit', 'weak_hit', 'miss'] as const
	for (const key of outcomeOrder) {
		const outcome = outcomes[key]
		if (outcome?.text) {
			html += `
				<div class="outcome-card outcome-${key}">
					<div class="outcome-header">${formatOutcome(key)}</div>
					<div class="outcome-body">${renderMarkdownWithOracles(outcome.text, oracles)}</div>
				</div>
			`
		}
	}

	html += `</div>`
	return html
}

/** Render markdown with embedded oracle template support */
function renderMarkdownWithOracles(text: string, oracles?: Record<string, EmbeddedOracle>): string {
	if (!text) return ''

	// Replace {{table>...}} templates
	let processed = text.replace(/\{\{table>([^}]+)\}\}/g, (_, ref) => {
		const oracleKey = ref.split('.').pop()
		if (oracles && oracleKey && oracles[oracleKey]) {
			return renderEmbeddedOracle(oracles[oracleKey])
		}
		return `<em>[Oracle table: ${ref}]</em>`
	})

	// Replace {{table_columns>...}} templates
	processed = processed.replace(/\{\{table_columns>([^}]+)\}\}/g, (_, ref) => {
		if (oracles && Object.keys(oracles).length > 0) {
			return renderOracleColumns(oracles)
		}
		return `<em>[Oracle columns: ${ref}]</em>`
	})

	return renderMarkdown(processed)
}
