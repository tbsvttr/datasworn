/**
 * Asset rendering functions
 */

import type { Datasworn } from '@datasworn/core'
import { escapeHtml } from '../utils/html'
import { formatLabel } from '../utils/formatting'
import { renderMarkdown } from '../utils/markdown'

/** Render an asset */
export function renderAsset(asset: Datasworn.Asset): string {
	let html = '<div class="asset-card">'

	// Category
	if (asset.category) {
		html += `<div class="asset-category">${escapeHtml(asset.category)}</div>`
	}

	// Requirement
	if (asset.requirement) {
		html += `<div class="asset-requirement">${renderMarkdown(asset.requirement)}</div>`
	}

	// Options (inputs)
	html += renderAssetOptions(asset)

	// Abilities
	html += renderAssetAbilities(asset)

	// Control meters (health, integrity, etc.)
	html += renderAssetControls(asset)

	html += '</div>'
	return html
}

/** Render asset options/inputs */
function renderAssetOptions(asset: Datasworn.Asset): string {
	if (!asset.options || Object.keys(asset.options).length === 0) {
		return ''
	}

	let html = `<div class="asset-options">`
	for (const [key, option] of Object.entries(asset.options)) {
		const label = option.label || formatLabel(key)
		html += `<div class="asset-option">`
		html += `<span class="option-label">${escapeHtml(label)}:</span>`
		html += `<span class="option-field">___________</span>`
		html += `</div>`
	}
	html += `</div>`

	return html
}

/** Render asset abilities */
function renderAssetAbilities(asset: Datasworn.Asset): string {
	if (!asset.abilities || asset.abilities.length === 0) {
		return ''
	}

	let html = `<div class="asset-abilities">`
	for (const ability of asset.abilities) {
		const enabledClass = ability.enabled ? 'ability-enabled' : ''
		const checkbox = ability.enabled ? '◆' : '◇'

		html += `<div class="ability ${enabledClass}">`
		html += `<div class="ability-checkbox">${checkbox}</div>`
		html += `<div class="ability-content">`
		if (ability.name) {
			html += `<strong>${escapeHtml(ability.name)}:</strong> `
		}
		if (ability.text) {
			html += renderMarkdown(ability.text)
		}
		html += `</div></div>`
	}
	html += `</div>`

	return html
}

/** Render asset control meters */
function renderAssetControls(asset: Datasworn.Asset): string {
	if (!asset.controls) return ''

	let html = ''
	for (const [key, control] of Object.entries(asset.controls)) {
		if (control.field_type === 'condition_meter') {
			const max = control.max || 5
			const label = control.label || formatLabel(key)
			const boxes = Array.from({ length: max }, (_, i) =>
				`<div class="meter-box">${max - i}</div>`
			).join('')

			html += `
				<div class="asset-meter">
					<span class="meter-label">${escapeHtml(label)}</span>
					<div class="meter-track">${boxes}</div>
				</div>
			`
		}
	}

	return html
}
