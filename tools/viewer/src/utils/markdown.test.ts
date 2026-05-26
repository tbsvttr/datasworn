import { describe, expect, it } from 'vitest'
import { escapeHtml, renderMarkdown } from './markdown'

describe('renderMarkdown', () => {
	it('returns empty string for empty input', () => {
		expect(renderMarkdown('')).toBe('')
	})

	it('renders standard markdown', () => {
		const out = renderMarkdown('**bold** and *italic*')
		expect(out).toContain('<strong>bold</strong>')
		expect(out).toContain('<em>italic</em>')
	})

	it('converts Datasworn-style __bold__ to standard bold', () => {
		const out = renderMarkdown('__Act:__ do the thing')
		expect(out).toContain('<strong>Act:</strong>')
	})

	it('strips script tags from rendered output', () => {
		const out = renderMarkdown('hello <script>alert(1)</script> world')
		expect(out).not.toContain('<script')
		expect(out).not.toContain('alert(1)')
	})

	it('strips event handler attributes', () => {
		const out = renderMarkdown('<img src=x onerror="alert(1)">')
		expect(out).not.toContain('onerror')
	})

	it('strips javascript: URIs from links', () => {
		const out = renderMarkdown('[click](javascript:alert(1))')
		expect(out).not.toMatch(/href="javascript:/i)
	})
})

describe('escapeHtml', () => {
	it('escapes angle brackets and ampersand', () => {
		expect(escapeHtml('<script>&')).toBe('&lt;script&gt;&amp;')
	})
})
