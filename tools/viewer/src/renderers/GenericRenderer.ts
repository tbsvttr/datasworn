/**
 * Generic/fallback rendering for unknown item types
 */

import { escapeHtml } from '../utils/html'
import { formatLabel } from '../utils/formatting'
import { renderMarkdown } from '../utils/markdown'

/** Render a generic item (fallback for unknown types) */
export function renderGeneric(obj: Record<string, unknown>): string {
	let html = '<div class="generic-card">'

	// Render common text fields
	const textFields = ['summary', 'description', 'text']
	let hasTextContent = false
	for (const field of textFields) {
		if (obj[field] && typeof obj[field] === 'string') {
			html += `<div class="generic-field">${renderMarkdown(obj[field] as string)}</div>`
			hasTextContent = true
		}
	}

	// Show contents count
	const contents = obj.contents as Record<string, unknown> | undefined
	if (contents) {
		const count = Object.keys(contents).length
		html += `<div class="generic-meta"><strong>Contents:</strong> ${count} items</div>`
	}

	// Show collections count
	const collections = obj.collections as Record<string, unknown> | undefined
	if (collections) {
		const count = Object.keys(collections).length
		html += `<div class="generic-meta"><strong>Collections:</strong> ${count} items</div>`
	}

	// If no text content and no contents/collections, render child items
	if (!hasTextContent && !contents && !collections) {
		html += renderChildItems(obj)
	}

	html += '</div>'
	return html
}

/** Render child items in a grid */
function renderChildItems(obj: Record<string, unknown>): string {
	const childItems = Object.entries(obj).filter(([key, value]) => {
		if (key.startsWith('_') || key === 'type' || key === 'name') return false
		return value && typeof value === 'object' && !Array.isArray(value)
	})

	if (childItems.length === 0) return ''

	let html = `<div class="collection-section">`
	html += `<div class="collection-section-title">Contains ${childItems.length} items</div>`
	html += `<div class="collection-grid">`

	for (const [key, value] of childItems) {
		const item = value as Record<string, unknown>
		const itemName = getItemName(item, key)
		const itemType = typeof item.type === 'string' ? item.type : undefined

		html += `<div class="collection-item">`
		html += `<span class="item-name">${escapeHtml(itemName)}</span>`
		if (itemType) {
			html += `<span class="item-type">${formatLabel(itemType)}</span>`
		}
		html += `</div>`
	}

	html += `</div></div>`
	return html
}

/** Get display name for an item */
function getItemName(item: Record<string, unknown>, fallbackKey: string): string {
	if (typeof item.name === 'string') return item.name
	if (typeof item.label === 'string') return item.label
	if (typeof item._id === 'string') return item._id
	return formatLabel(fallbackKey)
}
