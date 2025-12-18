/**
 * Truth rendering functions
 */

import type { Datasworn } from '@datasworn/core'
import { escapeHtml } from '../utils/html'
import { renderMarkdown } from '../utils/markdown'

/** Render a truth */
export function renderTruth(truth: Datasworn.Truth): string {
	let html = '<div class="truth-card">'

	const summary = (truth as { summary?: string }).summary
	if (summary) {
		html += `<div class="truth-summary">${renderMarkdown(summary)}</div>`
	}

	if (truth.options && truth.options.length > 0) {
		html += `<div class="truth-options">`
		for (let i = 0; i < truth.options.length; i++) {
			html += renderTruthOption(truth.options[i], i + 1)
		}
		html += `</div>`
	}

	html += '</div>'
	return html
}

/** Render a single truth option */
function renderTruthOption(opt: Datasworn.TruthOption, number: number): string {
	let html = `<div class="truth-option">`

	html += `<div class="truth-option-header">`
	html += `<span class="truth-option-number">${number}</span>`
	if (opt.summary) {
		html += `<span class="truth-option-summary">${escapeHtml(opt.summary)}</span>`
	}
	html += `</div>`

	if (opt.description) {
		html += `<div class="truth-option-desc">${renderMarkdown(opt.description)}</div>`
	}

	if (opt.quest_starter) {
		html += `<div class="truth-quest">`
		html += `<strong>Quest Starter:</strong> ${renderMarkdown(opt.quest_starter)}`
		html += `</div>`
	}

	html += `</div>`
	return html
}
