/**
 * Hover preview tooltip for datasworn: links
 */

import { state } from '../state'
import { escapeHtml } from '../utils/html'
import { formatType } from '../utils/formatting'

let tooltip: HTMLElement | null = null
let hideTimeout: number | null = null
let currentLinkId: string | null = null

/** Create or get the tooltip element */
function getTooltip(): HTMLElement {
	if (!tooltip) {
		tooltip = document.createElement('div')
		tooltip.className = 'hover-preview-tooltip'
		document.body.appendChild(tooltip)
	}
	return tooltip
}

/** Get preview content for an item */
function getPreviewContent(item: unknown): string {
	if (!item || typeof item !== 'object') return ''

	const obj = item as Record<string, unknown>
	const name = obj.name as string | undefined
	const type = (obj._id as string)?.split(':')[0] || 'item'
	const summary = obj.summary as string | undefined
	const description = obj.description as string | undefined
	const text = obj.text as string | undefined

	// Get a short preview text
	let preview = summary || description || text || ''
	if (preview.length > 200) {
		preview = preview.slice(0, 200) + '...'
	}

	// For oracles, show dice and row count
	let extraInfo = ''
	if (type === 'oracle_rollable') {
		const dice = obj.dice as string | undefined
		const rows = obj.rows as unknown[] | undefined
		if (dice || rows) {
			extraInfo = `<div class="hover-preview-meta">`
			if (dice) extraInfo += `<span>${escapeHtml(dice)}</span>`
			if (rows) extraInfo += `<span>${rows.length} entries</span>`
			extraInfo += `</div>`
		}
	}

	// For moves, show trigger
	if (type === 'move') {
		const trigger = obj.trigger as Record<string, unknown> | undefined
		const triggerText = trigger?.text as string | undefined
		if (triggerText) {
			preview = triggerText
			if (preview.length > 200) {
				preview = preview.slice(0, 200) + '...'
			}
		}
	}

	// For assets, show category
	if (type === 'asset') {
		const category = obj.category as string | undefined
		if (category) {
			extraInfo = `<div class="hover-preview-meta"><span>${escapeHtml(category)}</span></div>`
		}
	}

	return `
		<div class="hover-preview-header">
			<span class="hover-preview-type">${formatType(type)}</span>
			<span class="hover-preview-name">${escapeHtml(name || 'Unknown')}</span>
		</div>
		${preview ? `<div class="hover-preview-text">${escapeHtml(preview)}</div>` : ''}
		${extraInfo}
		<div class="hover-preview-hint">Click to navigate</div>
	`
}

/** Position the tooltip near the target element */
function positionTooltip(target: HTMLElement): void {
	const tip = getTooltip()
	const rect = target.getBoundingClientRect()
	const tipRect = tip.getBoundingClientRect()

	// Default: position below the link
	let top = rect.bottom + 8
	let left = rect.left

	// If tooltip would go off right edge, align to right
	if (left + tipRect.width > window.innerWidth - 16) {
		left = window.innerWidth - tipRect.width - 16
	}

	// If tooltip would go off bottom, position above
	if (top + tipRect.height > window.innerHeight - 16) {
		top = rect.top - tipRect.height - 8
	}

	// Ensure minimum left position
	if (left < 16) left = 16

	tip.style.top = `${top}px`
	tip.style.left = `${left}px`
}

/** Show the tooltip for a datasworn: link */
function showTooltip(target: HTMLElement, id: string): void {
	// Clear any pending hide
	if (hideTimeout) {
		clearTimeout(hideTimeout)
		hideTimeout = null
	}

	// Don't re-show for same link
	if (currentLinkId === id) return
	currentLinkId = id

	const item = state.findById(id)
	if (!item) return

	const tip = getTooltip()
	tip.innerHTML = getPreviewContent(item)
	tip.classList.add('visible')

	// Position after content is set (so we know the size)
	requestAnimationFrame(() => {
		positionTooltip(target)
	})
}

/** Hide the tooltip */
function hideTooltip(): void {
	hideTimeout = window.setTimeout(() => {
		const tip = getTooltip()
		tip.classList.remove('visible')
		currentLinkId = null
	}, 100) as unknown as number
}

/** Set up hover preview event listeners on a container */
export function setupHoverPreview(container: HTMLElement): void {
	// Use event delegation for efficiency
	container.addEventListener('mouseenter', (e) => {
		const target = e.target as HTMLElement
		if (target.tagName !== 'A') return

		const href = target.getAttribute('href')
		if (!href?.startsWith('datasworn:')) return

		const id = href.slice('datasworn:'.length)
		showTooltip(target, id)
	}, true)

	container.addEventListener('mouseleave', (e) => {
		const target = e.target as HTMLElement
		if (target.tagName !== 'A') return

		const href = target.getAttribute('href')
		if (!href?.startsWith('datasworn:')) return

		hideTooltip()
	}, true)

	// Also keep tooltip visible when hovering the tooltip itself
	const tip = getTooltip()
	tip.addEventListener('mouseenter', () => {
		if (hideTimeout) {
			clearTimeout(hideTimeout)
			hideTimeout = null
		}
	})
	tip.addEventListener('mouseleave', () => {
		hideTooltip()
	})
}
