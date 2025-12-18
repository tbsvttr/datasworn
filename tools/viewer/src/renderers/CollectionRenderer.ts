/**
 * Collection rendering functions
 */

import type { CollectionType } from '../types'
import { escapeHtml } from '../utils/html'
import { formatLabel } from '../utils/formatting'
import { renderMarkdown } from '../utils/markdown'

/** Render a collection (move category, asset collection, etc.) */
export function renderCollection(collection: CollectionType): string {
	let html = '<div class="collection-card">'

	const summary = (collection as { summary?: string }).summary
	if (summary) {
		html += `<div class="collection-summary">${renderMarkdown(summary)}</div>`
	}

	if (collection.description) {
		html += `<div class="collection-description">${renderMarkdown(collection.description)}</div>`
	}

	// Contents
	if ('contents' in collection && collection.contents) {
		const items = Object.values(collection.contents)
		html += renderCollectionGrid('Contents', items)
	}

	// Sub-collections
	if ('collections' in collection && collection.collections) {
		const items = Object.values(collection.collections)
		html += renderSubCollectionGrid('Sub-collections', items)
	}

	html += '</div>'
	return html
}

/** Render a grid of collection items */
function renderCollectionGrid(
	title: string,
	items: Array<{ name?: string; _id?: string; type?: string }>
): string {
	if (items.length === 0) return ''

	let html = `<div class="collection-section">`
	html += `<div class="collection-section-title">${title} (${items.length})</div>`
	html += `<div class="collection-grid">`

	for (const item of items) {
		const name = item.name || item._id || 'Unknown'
		const type = item.type
		html += `<div class="collection-item">`
		html += `<span class="item-name">${escapeHtml(name)}</span>`
		if (type) {
			html += `<span class="item-type">${type}</span>`
		}
		html += `</div>`
	}

	html += `</div></div>`
	return html
}

/** Render a grid of sub-collections */
function renderSubCollectionGrid(
	title: string,
	items: Array<{ name?: string; _id?: string }>
): string {
	if (items.length === 0) return ''

	let html = `<div class="collection-section">`
	html += `<div class="collection-section-title">${title} (${items.length})</div>`
	html += `<div class="collection-grid">`

	for (const item of items) {
		const name = item.name || item._id || 'Unknown'
		html += `<div class="collection-item collection-folder">`
		html += `<span class="item-name">${escapeHtml(name)}</span>`
		html += `</div>`
	}

	html += `</div></div>`
	return html
}
