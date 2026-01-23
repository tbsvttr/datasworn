/**
 * Tests for NPC rendering functions
 */

import { describe, it, expect } from 'vitest'
import { renderNpc } from './NpcRenderer'
import type { Datasworn } from '@datasworn/core'

describe('NpcRenderer', () => {
	describe('renderNpc', () => {
		it('renders NPC with nature', () => {
			const npc = {
				_id: 'npc:test/raider',
				type: 'npc',
				name: 'Raider',
				nature: 'Human',
				_source: { title: 'Test', authors: [], date: '2024-01-01', license: 'MIT', url: '' }
			} as unknown as Datasworn.Npc

			const html = renderNpc(npc)

			expect(html).toContain('npc-card')
			expect(html).toContain('npc-nature')
			expect(html).toContain('Human')
		})

		it('renders NPC with summary and description', () => {
			const npc = {
				_id: 'npc:test/npc',
				type: 'npc',
				name: 'Test NPC',
				summary: 'A dangerous foe.',
				description: 'This creature lurks in the shadows.',
				_source: { title: 'Test', authors: [], date: '2024-01-01', license: 'MIT', url: '' }
			} as unknown as Datasworn.Npc

			const html = renderNpc(npc)

			expect(html).toContain('npc-summary')
			expect(html).toContain('A dangerous foe.')
			expect(html).toContain('npc-description')
			expect(html).toContain('This creature lurks in the shadows.')
		})

		it('renders NPC features', () => {
			const npc = {
				_id: 'npc:test/npc',
				type: 'npc',
				name: 'Test NPC',
				features: ['Sharp claws', 'Red eyes', 'Thick hide'],
				_source: { title: 'Test', authors: [], date: '2024-01-01', license: 'MIT', url: '' }
			} as unknown as Datasworn.Npc

			const html = renderNpc(npc)

			expect(html).toContain('npc-section')
			expect(html).toContain('Features')
			expect(html).toContain('npc-list')
			expect(html).toContain('Sharp claws')
			expect(html).toContain('Red eyes')
			expect(html).toContain('Thick hide')
		})

		it('renders NPC drives', () => {
			const npc = {
				_id: 'npc:test/npc',
				type: 'npc',
				name: 'Test NPC',
				drives: ['Hunt for prey', 'Protect territory'],
				_source: { title: 'Test', authors: [], date: '2024-01-01', license: 'MIT', url: '' }
			} as unknown as Datasworn.Npc

			const html = renderNpc(npc)

			expect(html).toContain('Drives')
			expect(html).toContain('Hunt for prey')
			expect(html).toContain('Protect territory')
		})

		it('renders NPC tactics', () => {
			const npc = {
				_id: 'npc:test/npc',
				type: 'npc',
				name: 'Test NPC',
				tactics: ['Ambush from above', 'Use terrain for cover'],
				_source: { title: 'Test', authors: [], date: '2024-01-01', license: 'MIT', url: '' }
			} as unknown as Datasworn.Npc

			const html = renderNpc(npc)

			expect(html).toContain('Tactics')
			expect(html).toContain('Ambush from above')
			expect(html).toContain('Use terrain for cover')
		})

		it('renders NPC rank', () => {
			const npc = {
				_id: 'npc:test/npc',
				type: 'npc',
				name: 'Test NPC',
				rank: 3,
				_source: { title: 'Test', authors: [], date: '2024-01-01', license: 'MIT', url: '' }
			} as unknown as Datasworn.Npc

			const html = renderNpc(npc)

			expect(html).toContain('npc-rank')
			expect(html).toContain('Rank:')
			expect(html).toContain('Formidable') // rank 3 = Formidable
		})

		it('renders NPC quest starter', () => {
			const npc = {
				_id: 'npc:test/npc',
				type: 'npc',
				name: 'Test NPC',
				quest_starter: 'A village has been terrorized by this creature.',
				_source: { title: 'Test', authors: [], date: '2024-01-01', license: 'MIT', url: '' }
			} as unknown as Datasworn.Npc

			const html = renderNpc(npc)

			expect(html).toContain('npc-quest')
			expect(html).toContain('Quest Starter:')
			expect(html).toContain('A village has been terrorized')
		})

		it('renders NPC variants', () => {
			const npc = {
				_id: 'npc:test/npc',
				type: 'npc',
				name: 'Test NPC',
				variants: {
					alpha: {
						_id: 'npc_variant:test/npc/alpha',
						name: 'Alpha Variant',
						nature: 'Leader',
						rank: 4
					}
				},
				_source: { title: 'Test', authors: [], date: '2024-01-01', license: 'MIT', url: '' }
			} as unknown as Datasworn.Npc

			const html = renderNpc(npc)

			expect(html).toContain('Alpha Variant')
			expect(html).toContain('detail-header')
			expect(html).toContain('Leader')
		})

		it('handles NPC without optional fields', () => {
			const npc = {
				_id: 'npc:test/minimal',
				type: 'npc',
				name: 'Minimal NPC',
				_source: { title: 'Test', authors: [], date: '2024-01-01', license: 'MIT', url: '' }
			} as unknown as Datasworn.Npc

			const html = renderNpc(npc)

			expect(html).toContain('npc-card')
			expect(html).not.toContain('npc-nature')
			expect(html).not.toContain('npc-summary')
			expect(html).not.toContain('npc-section')
			expect(html).not.toContain('npc-rank')
			expect(html).not.toContain('npc-quest')
		})

		it('escapes HTML in nature', () => {
			const npc = {
				_id: 'npc:test/npc',
				type: 'npc',
				name: 'Test NPC',
				nature: '<script>alert("xss")</script>',
				_source: { title: 'Test', authors: [], date: '2024-01-01', license: 'MIT', url: '' }
			} as unknown as Datasworn.Npc

			const html = renderNpc(npc)

			expect(html).not.toContain('<script>')
			expect(html).toContain('&lt;script&gt;')
		})
	})
})
