/**
 * Detail panel component - displays selected item details
 */

import { state } from '../state'
import { escapeHtml, generateId } from '../utils/html'
import { formatType, formatLabel } from '../utils/formatting'
import {
	isMove,
	isAsset,
	isOracleRollable,
	isNpc,
	isAtlasEntry,
	isTruth,
	isCollection,
	isDelveSite,
	isDelveSiteTheme,
	isDelveSiteDomain
} from '../types'
import {
	renderMove,
	renderAsset,
	renderOracle,
	renderNpc,
	renderAtlasEntry,
	renderTruth,
	renderCollection,
	renderGeneric,
	renderDelveSite,
	renderDelveSiteTheme,
	renderDelveSiteDomain
} from '../renderers'

export function createDetailPanel(container: HTMLElement): void {
	const panel = document.createElement('div')
	panel.className = 'detail-panel'
	container.appendChild(panel)

	// Handle clicks on datasworn links, breadcrumbs, and copy button
	panel.addEventListener('click', (e) => {
		const target = e.target as HTMLElement

		// Handle datasworn: links
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

		// Handle copy ID button
		const copyButton = target.closest('.copy-id-button') as HTMLElement | null
		if (copyButton) {
			const id = copyButton.dataset.id
			if (id) {
				navigator.clipboard.writeText(`datasworn:${id}`).then(() => {
					copyButton.classList.add('copied')
					copyButton.textContent = 'Copied!'
					setTimeout(() => {
						copyButton.classList.remove('copied')
						copyButton.textContent = 'Copy'
					}, 1500)
				})
			}
		}

		// Handle breadcrumb clicks
		const breadcrumb = target.closest('.breadcrumb-item') as HTMLElement | null
		if (breadcrumb) {
			const pathData = breadcrumb.dataset.path
			if (pathData) {
				const path = JSON.parse(pathData) as string[]
				navigateToPath(path)
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

/** Navigate to a path in the tree */
function navigateToPath(path: string[]): void {
	const ruleset = state.getCurrentRuleset()
	if (!ruleset) return

	let current: unknown = ruleset
	for (const segment of path) {
		if (typeof current !== 'object' || current === null) return
		const obj = current as Record<string, unknown>

		// Try direct access first
		if (obj[segment]) {
			current = obj[segment]
			continue
		}

		// Try contents
		const contents = obj.contents as Record<string, unknown> | undefined
		if (contents?.[segment]) {
			current = contents[segment]
			continue
		}

		// Try collections
		const collections = obj.collections as Record<string, unknown> | undefined
		if (collections?.[segment]) {
			current = collections[segment]
			continue
		}

		return // Path not found
	}

	state.selectItem(path, current)
}

function renderDetail(item: unknown, path: string[]): string {
	if (typeof item !== 'object' || item === null) {
		return `<div class="json-view">${JSON.stringify(item, null, 2)}</div>`
	}

	const obj = item as Record<string, unknown>
	const name = (typeof obj.name === 'string' ? obj.name : null) || path[path.length - 1] || 'Item'
	const type = typeof obj.type === 'string' ? obj.type : undefined
	const id = typeof obj._id === 'string' ? obj._id : undefined

	let html = ''

	// Breadcrumb trail
	if (path.length > 1) {
		html += renderBreadcrumbs(path)
	}

	html += `<div class="detail-header">`

	// Type badge
	if (type) {
		html += `<span class="type-badge type-${type}">${formatType(type)}</span>`
	}

	html += `<h2>${escapeHtml(name)}</h2>`

	if (id) {
		html += `<div class="detail-id-row">
			<code class="detail-id">${id}</code>
			<button class="copy-id-button" data-id="${id}">Copy</button>
		</div>`
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
	} else if (isDelveSite(item)) {
		html += renderDelveSite(item)
	} else if (isDelveSiteTheme(item)) {
		html += renderDelveSiteTheme(item)
	} else if (isDelveSiteDomain(item)) {
		html += renderDelveSiteDomain(item)
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

/** Render breadcrumb navigation */
function renderBreadcrumbs(path: string[]): string {
	let html = '<nav class="breadcrumbs" aria-label="Breadcrumb">'

	for (let i = 0; i < path.length - 1; i++) {
		const segment = path[i]
		const partialPath = path.slice(0, i + 1)

		html += `<span class="breadcrumb-item" data-path='${JSON.stringify(partialPath)}'>${escapeHtml(formatLabel(segment))}</span>`
		html += '<span class="breadcrumb-separator">›</span>'
	}

	// Current item (not clickable)
	html += `<span class="breadcrumb-current">${escapeHtml(formatLabel(path[path.length - 1]))}</span>`

	html += '</nav>'
	return html
}
