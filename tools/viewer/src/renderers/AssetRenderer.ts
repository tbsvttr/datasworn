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

	// Tags (supernatural, technological, starforged-friendly, etc.)
	html += renderAssetTags(asset)

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

			// Render impacts (e.g. "battered" for vehicles, "out of action" for companions)
			let impacts = ''
			if (control.controls) {
				for (const impact of Object.values(control.controls)) {
					impacts += `<div class="asset-impact">${impact.label}</div>`
				}
			}

			html += `
				<div class="asset-meter">
					<span class="meter-label">${escapeHtml(label)}</span>
					<div class="meter-track">${boxes}</div>
					<div class="impact-list">${impacts}</div>
				</div>
			`
		}
	}

	return html
}

/** Tag display labels and descriptions */
const TAG_LABELS: Record<string, { label: string; description: string; icon?: string }> = {
	supernatural: {
		label: 'Supernatural',
		description: 'Features supernatural or mythic powers',
		icon: '✦'
	},
	technological: {
		label: 'Technological',
		description: 'Features remarkable technologies',
		icon: '⚙'
	},
	requires_allies: {
		label: 'Allies Required',
		description: 'For co-op or guided play with allies',
		icon: '⚑'
	}
}

/** Namespace-specific labels for the 'recommended' tag */
const RECOMMENDED_LABELS: Record<string, { label: string; description: string; cssClass: string }> = {
	starforged: {
		label: '★ SF Friendly',
		description: 'Recommended for use in Starforged',
		cssClass: 'asset-tag-sf-friendly'
	},
	sundered_isles: {
		label: '★ SI Friendly',
		description: 'Recommended for use in Sundered Isles',
		cssClass: 'asset-tag-si-friendly'
	}
}

/** Render asset tags as badges */
function renderAssetTags(asset: Datasworn.Asset): string {
	const tags = (asset as { tags?: Record<string, Record<string, unknown>> }).tags
	if (!tags) return ''

	const tagBadges: string[] = []

	// Check each namespace (_core, starforged, sundered_isles, etc.)
	for (const [namespace, values] of Object.entries(tags)) {
		if (typeof values !== 'object' || values === null) continue

		for (const [tagName, tagValue] of Object.entries(values)) {
			if (!tagValue) continue

			// Handle 'recommended' tag specially - label depends on namespace
			if (tagName === 'recommended') {
				const recInfo = RECOMMENDED_LABELS[namespace]
				if (recInfo) {
					tagBadges.push(
						`<span class="asset-tag ${recInfo.cssClass}" title="${recInfo.description}">${recInfo.label}</span>`
					)
				}
				continue
			}

			const tagInfo = TAG_LABELS[tagName]
			if (tagInfo) {
				const icon = tagInfo.icon ? `${tagInfo.icon} ` : ''
				tagBadges.push(
					`<span class="asset-tag asset-tag-${tagName}" title="${tagInfo.description}">${icon}${tagInfo.label}</span>`
				)
			}
		}
	}

	if (tagBadges.length === 0) return ''

	return `<div class="asset-tags">${tagBadges.join('')}</div>`
}
