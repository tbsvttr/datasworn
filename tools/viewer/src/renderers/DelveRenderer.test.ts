/**
 * Tests for Delve-specific rendering functions
 */

import { describe, it, expect } from 'vitest'
import { renderDelveSite, renderDelveSiteTheme, renderDelveSiteDomain } from './DelveRenderer'
import type { Datasworn } from '@datasworn/core'

// Helper to create minimal source for tests
const testSource = {
	title: 'Test',
	authors: [{ name: 'Test Author' }],
	date: '2024-01-01',
	license: 'MIT',
	url: 'https://test.com'
}

describe('DelveRenderer', () => {
	describe('renderDelveSite', () => {
		it('renders a basic delve site', () => {
			const site = {
				_id: 'delve_site:delve/test_site',
				type: 'delve_site',
				name: 'Test Site',
				rank: 2,
				theme: 'delve_site_theme:delve/ancient',
				domain: 'delve_site_domain:delve/barrow',
				description: 'A test site.',
				denizens: [],
				_source: testSource
			} as unknown as Datasworn.DelveSite

			const html = renderDelveSite(site)

			expect(html).toContain('delve-site-card')
			expect(html).toContain('Rank:')
		})

		it('renders denizens with npc references', () => {
			const site = {
				_id: 'delve_site:delve/test_site',
				type: 'delve_site',
				name: 'Test Site',
				rank: 2,
				theme: 'delve_site_theme:delve/ancient',
				domain: 'delve_site_domain:delve/barrow',
				description: 'A test site.',
				denizens: [
					{
						_id: 'delve_site.denizen:delve/test_site.0',
						npc: 'npc:classic/ironlanders/raider',
						frequency: 'very_common',
						roll: { min: 1, max: 27 }
					}
				],
				_source: testSource
			} as unknown as Datasworn.DelveSite

			const html = renderDelveSite(site)

			expect(html).toContain('Denizens')
			expect(html).toContain('datasworn:npc:classic/ironlanders/raider')
			expect(html).toContain('Raider')
			expect(html).toContain('frequency-very_common')
			// Roll functionality
			expect(html).toContain('roll-button')
			expect(html).toContain('Roll 1d100')
			expect(html).toContain('data-min="1"')
			expect(html).toContain('data-max="27"')
		})

		it('handles denizens without npc references', () => {
			const site = {
				_id: 'delve_site:delve/test_site',
				type: 'delve_site',
				name: 'Test Site',
				rank: 2,
				theme: 'delve_site_theme:delve/ancient',
				domain: 'delve_site_domain:delve/barrow',
				description: 'A test site.',
				denizens: [
					{
						_id: 'delve_site.denizen:delve/test_site.0',
						frequency: 'common',
						roll: { min: 42, max: 55 }
					}
				],
				_source: testSource
			} as unknown as Datasworn.DelveSite

			// Should not throw an error
			const html = renderDelveSite(site)

			expect(html).toContain('Denizens')
			expect(html).toContain('42–55') // Uses en-dash
		})

		it('renders theme and domain links', () => {
			const site = {
				_id: 'delve_site:delve/test_site',
				type: 'delve_site',
				name: 'Test Site',
				rank: 2,
				theme: 'delve_site_theme:delve/ancient',
				domain: 'delve_site_domain:delve/barrow',
				description: 'A test site.',
				denizens: [],
				_source: testSource
			} as unknown as Datasworn.DelveSite

			const html = renderDelveSite(site)

			expect(html).toContain('Theme:')
			expect(html).toContain('datasworn:delve_site_theme:delve/ancient')
			expect(html).toContain('Domain:')
			expect(html).toContain('datasworn:delve_site_domain:delve/barrow')
		})
	})

	describe('renderDelveSiteTheme', () => {
		it('renders features and dangers tables with roll buttons', () => {
			const theme = {
				_id: 'delve_site_theme:delve/ancient',
				type: 'delve_site_theme',
				name: 'Ancient',
				summary: 'This place holds secrets.',
				features: [
					{
						_id: 'delve_site_theme.feature:delve/ancient.0',
						roll: { min: 1, max: 4 },
						text: 'Evidence of lost knowledge'
					},
					{
						_id: 'delve_site_theme.feature:delve/ancient.1',
						roll: { min: 17, max: 20 },
						text: 'Last feature'
					}
				],
				dangers: [
					{
						_id: 'delve_site_theme.danger:delve/ancient.0',
						roll: { min: 1, max: 5 },
						text: 'Ancient trap'
					},
					{
						_id: 'delve_site_theme.danger:delve/ancient.1',
						roll: { min: 26, max: 30 },
						text: 'Last danger'
					}
				],
				_source: testSource
			} as unknown as Datasworn.DelveSiteTheme

			const html = renderDelveSiteTheme(theme)

			expect(html).toContain('delve-theme-card')
			expect(html).toContain('This place holds secrets.')
			expect(html).toContain('Features')
			expect(html).toContain('Evidence of lost knowledge')
			expect(html).toContain('Dangers')
			expect(html).toContain('Ancient trap')
			// Roll functionality - features max is 20, dangers max is 30
			expect(html).toContain('Roll 1d20') // Features table
			expect(html).toContain('Roll 1d100') // Dangers table (max 30 > 20)
		})
	})

	describe('renderDelveSiteDomain', () => {
		it('renders features and dangers tables', () => {
			const domain = {
				_id: 'delve_site_domain:delve/barrow',
				type: 'delve_site_domain',
				name: 'Barrow',
				summary: 'A burial mound.',
				features: [
					{
						_id: 'delve_site_domain.feature:delve/barrow.0',
						roll: { min: 21, max: 43 },
						text: 'Grave goods'
					}
				],
				dangers: [
					{
						_id: 'delve_site_domain.danger:delve/barrow.0',
						roll: { min: 31, max: 33 },
						text: 'Undead guardian'
					}
				],
				_source: testSource
			} as unknown as Datasworn.DelveSiteDomain

			const html = renderDelveSiteDomain(domain)

			expect(html).toContain('delve-domain-card')
			expect(html).toContain('A burial mound.')
			expect(html).toContain('Features')
			expect(html).toContain('Grave goods')
			expect(html).toContain('Dangers')
			expect(html).toContain('Undead guardian')
		})
	})
})
