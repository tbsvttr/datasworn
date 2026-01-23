/**
 * Tests for Asset rendering functions
 */

import { describe, it, expect } from 'vitest'
import { renderAsset } from './AssetRenderer'
import type { Datasworn } from '@datasworn/core'

describe('AssetRenderer', () => {
	describe('renderAsset', () => {
		it('renders asset with category', () => {
			const asset = {
				_id: 'asset:test/alchemist',
				type: 'asset',
				name: 'Alchemist',
				category: 'Path',
				abilities: [],
				_source: { title: 'Test', authors: [], date: '2024-01-01', license: 'MIT', url: '' }
			} as unknown as Datasworn.Asset

			const html = renderAsset(asset)

			expect(html).toContain('asset-card')
			expect(html).toContain('asset-category')
			expect(html).toContain('Path')
		})

		it('renders asset with requirement', () => {
			const asset = {
				_id: 'asset:test/asset',
				type: 'asset',
				name: 'Test Asset',
				requirement: 'Must have the Alchemist path.',
				abilities: [],
				_source: { title: 'Test', authors: [], date: '2024-01-01', license: 'MIT', url: '' }
			} as unknown as Datasworn.Asset

			const html = renderAsset(asset)

			expect(html).toContain('asset-requirement')
			expect(html).toContain('Must have the Alchemist path.')
		})

		it('renders asset abilities', () => {
			const asset = {
				_id: 'asset:test/asset',
				type: 'asset',
				name: 'Test Asset',
				abilities: [
					{ name: 'First Ability', text: 'Do something cool.', enabled: true },
					{ name: 'Second Ability', text: 'Do something cooler.', enabled: false },
					{ text: 'Third ability without name.', enabled: false }
				],
				_source: { title: 'Test', authors: [], date: '2024-01-01', license: 'MIT', url: '' }
			} as unknown as Datasworn.Asset

			const html = renderAsset(asset)

			expect(html).toContain('asset-abilities')
			expect(html).toContain('First Ability')
			expect(html).toContain('Do something cool.')
			expect(html).toContain('Second Ability')
			expect(html).toContain('ability-enabled')
			expect(html).toContain('◆') // enabled checkbox
			expect(html).toContain('◇') // disabled checkbox
		})

		it('renders asset options/inputs', () => {
			const asset = {
				_id: 'asset:test/asset',
				type: 'asset',
				name: 'Test Asset',
				options: {
					name: { label: 'Companion Name' },
					species: { label: null } // will use formatted key
				},
				abilities: [],
				_source: { title: 'Test', authors: [], date: '2024-01-01', license: 'MIT', url: '' }
			} as unknown as Datasworn.Asset

			const html = renderAsset(asset)

			expect(html).toContain('asset-options')
			expect(html).toContain('Companion Name')
			expect(html).toContain('option-field')
			expect(html).toContain('___________')
		})

		it('renders asset control meters', () => {
			const asset = {
				_id: 'asset:test/companion',
				type: 'asset',
				name: 'Test Companion',
				abilities: [],
				controls: {
					health: {
						field_type: 'condition_meter',
						label: 'Health',
						max: 5,
						controls: {
							wounded: { label: 'Wounded' }
						}
					}
				},
				_source: { title: 'Test', authors: [], date: '2024-01-01', license: 'MIT', url: '' }
			} as unknown as Datasworn.Asset

			const html = renderAsset(asset)

			expect(html).toContain('asset-meter')
			expect(html).toContain('meter-label')
			expect(html).toContain('Health')
			expect(html).toContain('meter-track')
			expect(html).toContain('meter-box')
			expect(html).toContain('asset-impact')
			expect(html).toContain('Wounded')
		})

		it('renders asset tags', () => {
			const asset = {
				_id: 'asset:test/asset',
				type: 'asset',
				name: 'Test Asset',
				abilities: [],
				tags: {
					_core: {
						supernatural: true
					}
				},
				_source: { title: 'Test', authors: [], date: '2024-01-01', license: 'MIT', url: '' }
			} as unknown as Datasworn.Asset

			const html = renderAsset(asset)

			expect(html).toContain('asset-tags')
			expect(html).toContain('asset-tag-supernatural')
			expect(html).toContain('Supernatural')
		})

		it('renders starforged-friendly tag', () => {
			const asset = {
				_id: 'asset:test/asset',
				type: 'asset',
				name: 'Test Asset',
				abilities: [],
				tags: {
					starforged: {
						recommended: true
					}
				},
				_source: { title: 'Test', authors: [], date: '2024-01-01', license: 'MIT', url: '' }
			} as unknown as Datasworn.Asset

			const html = renderAsset(asset)

			expect(html).toContain('asset-tag-sf-friendly')
			expect(html).toContain('SF Friendly')
		})

		it('handles asset without optional fields', () => {
			const asset = {
				_id: 'asset:test/minimal',
				type: 'asset',
				name: 'Minimal Asset',
				abilities: [],
				_source: { title: 'Test', authors: [], date: '2024-01-01', license: 'MIT', url: '' }
			} as unknown as Datasworn.Asset

			const html = renderAsset(asset)

			expect(html).toContain('asset-card')
			expect(html).not.toContain('asset-category')
			expect(html).not.toContain('asset-requirement')
			expect(html).not.toContain('asset-options')
			expect(html).not.toContain('asset-tags')
		})

		it('escapes HTML in category', () => {
			const asset = {
				_id: 'asset:test/asset',
				type: 'asset',
				name: 'Test Asset',
				category: '<script>alert("xss")</script>',
				abilities: [],
				_source: { title: 'Test', authors: [], date: '2024-01-01', license: 'MIT', url: '' }
			} as unknown as Datasworn.Asset

			const html = renderAsset(asset)

			expect(html).not.toContain('<script>')
			expect(html).toContain('&lt;script&gt;')
		})
	})
})
