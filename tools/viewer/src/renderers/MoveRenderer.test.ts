/**
 * Tests for Move rendering functions
 */

import { describe, it, expect } from 'vitest'
import { renderMove } from './MoveRenderer'
import type { Datasworn } from '@datasworn/core'

describe('MoveRenderer', () => {
	describe('renderMove', () => {
		it('renders move with trigger', () => {
			const move = {
				_id: 'move:test/face_danger',
				type: 'move',
				name: 'Face Danger',
				roll_type: 'action_roll',
				trigger: {
					text: 'When you attempt something risky or react to an imminent threat...'
				},
				text: 'Roll the dice.',
				_source: { title: 'Test', authors: [], date: '2024-01-01', license: 'MIT', url: '' }
			} as unknown as Datasworn.Move

			const html = renderMove(move)

			expect(html).toContain('trigger-card')
			expect(html).toContain('When you...')
			expect(html).toContain('attempt something risky')
		})

		it('renders roll type badge', () => {
			const move = {
				_id: 'move:test/move',
				type: 'move',
				name: 'Test Move',
				roll_type: 'action_roll',
				_source: { title: 'Test', authors: [], date: '2024-01-01', license: 'MIT', url: '' }
			} as unknown as Datasworn.Move

			const html = renderMove(move)

			expect(html).toContain('roll-type-badge')
			expect(html).toContain('Action Roll')
		})

		it('renders move text', () => {
			const move = {
				_id: 'move:test/move',
				type: 'move',
				name: 'Test Move',
				text: 'This is the move text.',
				_source: { title: 'Test', authors: [], date: '2024-01-01', license: 'MIT', url: '' }
			} as unknown as Datasworn.Move

			const html = renderMove(move)

			expect(html).toContain('move-text')
			expect(html).toContain('This is the move text.')
		})

		it('renders outcomes', () => {
			const move = {
				_id: 'move:test/move',
				type: 'move',
				name: 'Test Move',
				roll_type: 'action_roll',
				outcomes: {
					strong_hit: { text: 'You succeed!' },
					weak_hit: { text: 'You partially succeed.' },
					miss: { text: 'You fail.' }
				},
				_source: { title: 'Test', authors: [], date: '2024-01-01', license: 'MIT', url: '' }
			} as unknown as Datasworn.Move

			const html = renderMove(move)

			expect(html).toContain('outcomes')
			expect(html).toContain('outcome-strong_hit')
			expect(html).toContain('outcome-weak_hit')
			expect(html).toContain('outcome-miss')
			expect(html).toContain('You succeed!')
			expect(html).toContain('You partially succeed.')
			expect(html).toContain('You fail.')
		})

		it('renders stat pills for action rolls', () => {
			const move = {
				_id: 'move:test/move',
				type: 'move',
				name: 'Test Move',
				roll_type: 'action_roll',
				trigger: {
					text: 'When you test...',
					conditions: [
						{
							roll_options: [
								{ using: 'stat', stat: 'edge' },
								{ using: 'stat', stat: 'iron' }
							]
						}
					]
				},
				_source: { title: 'Test', authors: [], date: '2024-01-01', license: 'MIT', url: '' }
			} as unknown as Datasworn.Move

			const html = renderMove(move)

			expect(html).toContain('stat-pills')
			expect(html).toContain('stat-pill')
			expect(html).toContain('edge')
			expect(html).toContain('iron')
		})

		it('handles move without trigger', () => {
			const move = {
				_id: 'move:test/move',
				type: 'move',
				name: 'Test Move',
				text: 'Just do it.',
				_source: { title: 'Test', authors: [], date: '2024-01-01', license: 'MIT', url: '' }
			} as unknown as Datasworn.Move

			const html = renderMove(move)

			expect(html).not.toContain('trigger-card')
			expect(html).toContain('Just do it.')
		})

		it('handles move without outcomes', () => {
			const move = {
				_id: 'move:test/move',
				type: 'move',
				name: 'Test Move',
				roll_type: 'no_roll',
				text: 'No roll needed.',
				_source: { title: 'Test', authors: [], date: '2024-01-01', license: 'MIT', url: '' }
			} as unknown as Datasworn.Move

			const html = renderMove(move)

			expect(html).not.toContain('outcomes')
			expect(html).toContain('No roll needed.')
		})

		it('renders embedded oracle templates', () => {
			const move = {
				_id: 'move:test/move',
				type: 'move',
				name: 'Test Move',
				text: 'Roll on {{table>self.oracles.test}} table.',
				oracles: {
					test: {
						name: 'Test Oracle',
						dice: '1d6',
						rows: [
							{ roll: { min: 1, max: 3 }, text: 'Result A' },
							{ roll: { min: 4, max: 6 }, text: 'Result B' }
						]
					}
				},
				_source: { title: 'Test', authors: [], date: '2024-01-01', license: 'MIT', url: '' }
			} as unknown as Datasworn.Move

			const html = renderMove(move)

			expect(html).toContain('embedded-oracle-table')
			expect(html).toContain('Result A')
			expect(html).toContain('Result B')
		})

		it('shows placeholder for missing oracle references', () => {
			const move = {
				_id: 'move:test/move',
				type: 'move',
				name: 'Test Move',
				text: 'Roll on {{table>self.oracles.missing}} table.',
				_source: { title: 'Test', authors: [], date: '2024-01-01', license: 'MIT', url: '' }
			} as unknown as Datasworn.Move

			const html = renderMove(move)

			expect(html).toContain('[Oracle table:')
		})
	})
})
