/**
 * Detail panel component - displays selected item details
 */

import { state } from '../state'
import { escapeHtml, generateId } from '../utils/html'
import { formatType } from '../utils/formatting'
import {
	isMove,
	isAsset,
	isOracleRollable,
	isNpc,
	isAtlasEntry,
	isTruth,
	isCollection
} from '../types'
import {
	renderMove,
	renderAsset,
	renderOracle,
	renderNpc,
	renderAtlasEntry,
	renderTruth,
	renderCollection,
	renderGeneric
} from '../renderers'

export function createDetailPanel(container: HTMLElement): void {
	const panel = document.createElement('div')
	panel.className = 'detail-panel'
	container.appendChild(panel)

	// Handle clicks on datasworn links
	panel.addEventListener('click', (e) => {
		const target = e.target as HTMLElement
		if (target.tagName === 'A') {
			const href = target.getAttribute('href')
			if (href?.startsWith('datasworn:')) {
				e.preventDefault()
				const id = href.slice('datasworn:'.length)
				const found = state.navigateToId(id)
				if (!found) {
					console.warn('Could not find item:', id)
				}
			}
		}
	})

	state.subscribe((s) => {
		if (!s.selectedItem) {
			panel.innerHTML = `
				<div class="detail-empty">
					<p>Select an item from the tree to view details</p>
				</div>
			`
			return
		}

		panel.innerHTML = renderDetail(s.selectedItem, s.selectedPath || [])
	})
}

function renderDetail(item: unknown, path: string[]): string {
	if (typeof item !== 'object' || item === null) {
		return `<div class="json-view">${JSON.stringify(item, null, 2)}</div>`
	}

	const obj = item as Record<string, unknown>
	const name = (typeof obj.name === 'string' ? obj.name : null) || path[path.length - 1] || 'Item'
	const type = typeof obj.type === 'string' ? obj.type : undefined
	const id = typeof obj._id === 'string' ? obj._id : undefined

	let html = `<div class="detail-header">`

	// Type badge
	if (type) {
		html += `<span class="type-badge type-${type}">${formatType(type)}</span>`
	}

	html += `<h2>${escapeHtml(name)}</h2>`

	if (id) {
		html += `<code class="detail-id">${id}</code>`
	}

	html += `</div><div class="detail-content">`

	// Render based on type using type guards
	if (isMove(item)) {
		html += renderMove(item)
	} else if (isAsset(item)) {
		html += renderAsset(item)
	} else if (isOracleRollable(item)) {
		html += renderOracle(item)
	} else if (isNpc(item)) {
		html += renderNpc(item)
	} else if (isAtlasEntry(item)) {
		html += renderAtlasEntry(item)
	} else if (isTruth(item)) {
		html += renderTruth(item)
	} else if (isCollection(item)) {
		html += renderCollection(item)
	} else {
		html += renderGeneric(obj)
	}

	html += `</div>`

	// Collapsible raw JSON view
	const jsonId = generateId('json')
	html += `
		<div class="detail-section json-section">
			<div class="detail-section-title json-toggle" onclick="this.classList.toggle('expanded'); document.getElementById('${jsonId}').classList.toggle('collapsed')">Raw JSON</div>
			<div id="${jsonId}" class="json-view collapsed">${escapeHtml(JSON.stringify(obj, null, 2))}</div>
		</div>
	`

	return html
}
