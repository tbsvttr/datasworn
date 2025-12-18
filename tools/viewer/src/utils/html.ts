/**
 * HTML utility functions
 */

/** Escape HTML special characters to prevent XSS */
export function escapeHtml(text: string): string {
	const div = document.createElement('div')
	div.textContent = text
	return div.innerHTML
}

/** Generate a unique ID for DOM elements */
export function generateId(prefix = 'id'): string {
	return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}

/** Create an HTML element string with attributes */
export function createElement(
	tag: string,
	attrs: Record<string, string | number | boolean> = {},
	content = ''
): string {
	const attrStr = Object.entries(attrs)
		.filter(([, v]) => v !== false && v !== undefined)
		.map(([k, v]) => (v === true ? k : `${k}="${escapeHtml(String(v))}"`))
		.join(' ')

	return `<${tag}${attrStr ? ' ' + attrStr : ''}>${content}</${tag}>`
}
