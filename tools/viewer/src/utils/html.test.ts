/**
 * Tests for HTML utilities
 */

import { describe, it, expect } from 'vitest'
import { escapeHtml, generateId, createElement } from './html'

describe('HTML Utilities', () => {
	describe('escapeHtml', () => {
		it('escapes < and >', () => {
			expect(escapeHtml('<script>')).toBe('&lt;script&gt;')
		})

		it('escapes &', () => {
			expect(escapeHtml('foo & bar')).toBe('foo &amp; bar')
		})

		it('does not escape quotes (textContent behavior)', () => {
			// textContent only escapes < > & for innerHTML, not quotes
			expect(escapeHtml('"hello"')).toBe('"hello"')
		})

		it('leaves normal text unchanged', () => {
			expect(escapeHtml('Hello World')).toBe('Hello World')
		})

		it('handles empty string', () => {
			expect(escapeHtml('')).toBe('')
		})

		it('escapes multiple special characters except quotes', () => {
			// textContent only escapes < > &
			expect(escapeHtml('<a href="test">link & text</a>')).toBe(
				'&lt;a href="test"&gt;link &amp; text&lt;/a&gt;'
			)
		})
	})

	describe('generateId', () => {
		it('generates unique IDs', () => {
			const id1 = generateId()
			const id2 = generateId()
			expect(id1).not.toBe(id2)
		})

		it('uses default prefix', () => {
			const id = generateId()
			expect(id).toMatch(/^id-[a-z0-9]+$/)
		})

		it('uses custom prefix', () => {
			const id = generateId('oracle')
			expect(id).toMatch(/^oracle-[a-z0-9]+$/)
		})
	})

	describe('createElement', () => {
		it('creates element with no attributes', () => {
			expect(createElement('div', {}, 'Hello')).toBe('<div>Hello</div>')
		})

		it('creates element with attributes', () => {
			expect(createElement('a', { href: 'https://example.com' }, 'Link')).toBe(
				'<a href="https://example.com">Link</a>'
			)
		})

		it('creates element with multiple attributes', () => {
			const result = createElement('input', { type: 'text', name: 'field' }, '')
			expect(result).toContain('type="text"')
			expect(result).toContain('name="field"')
		})

		it('handles boolean true attributes', () => {
			expect(createElement('input', { disabled: true }, '')).toBe('<input disabled></input>')
		})

		it('excludes false boolean attributes', () => {
			expect(createElement('input', { disabled: false }, '')).toBe('<input></input>')
		})

		it('escapes attribute values', () => {
			expect(createElement('div', { 'data-text': '<script>' }, '')).toBe(
				'<div data-text="&lt;script&gt;"></div>'
			)
		})

		it('creates empty element', () => {
			expect(createElement('span', {}, '')).toBe('<span></span>')
		})
	})
})
