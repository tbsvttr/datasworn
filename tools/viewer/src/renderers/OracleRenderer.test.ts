/**
 * Tests for Oracle rendering functions
 */

import { describe, it, expect } from 'vitest'
import { encodeRollInfo, renderOracle, renderEmbeddedOracle, renderOracleColumns, ROLL_DATA_ATTR } from './OracleRenderer'
import type { Datasworn } from '@datasworn/core'
import type { EmbeddedOracle } from '../types'

describe('OracleRenderer', () => {
	describe('encodeRollInfo', () => {
		it('encodes roll info as URL-safe string', () => {
			const info = { type: 'oracle' as const, tableId: 'test-123', dice: '1d100' }
			const encoded = encodeRollInfo(info)

			// Should be URL encoded JSON
			const decoded = JSON.parse(decodeURIComponent(encoded))
			expect(decoded).toEqual(info)
		})

		it('handles special characters', () => {
			const info = { type: 'oracle' as const, tableId: 'test/with:special', dice: '1d6' }
			const encoded = encodeRollInfo(info)

			const decoded = JSON.parse(decodeURIComponent(encoded))
			expect(decoded.tableId).toBe('test/with:special')
		})
	})

	describe('renderOracle', () => {
		it('renders oracle with rows', () => {
			const oracle = {
				_id: 'oracle_rollable:test/oracle',
				type: 'oracle_rollable',
				name: 'Test Oracle',
				dice: '1d6',
				rows: [
					{ _id: 'row1', roll: { min: 1, max: 3 }, text: 'Result A' },
					{ _id: 'row2', roll: { min: 4, max: 6 }, text: 'Result B' }
				],
				_source: { title: 'Test', authors: [], date: '2024-01-01', license: 'MIT', url: '' }
			} as unknown as Datasworn.OracleRollable

			const html = renderOracle(oracle)

			expect(html).toContain('oracle-table')
			expect(html).toContain('roll-button')
			expect(html).toContain('Roll 1d6')
			expect(html).toContain('Result A')
			expect(html).toContain('Result B')
			expect(html).toContain('data-min="1"')
			expect(html).toContain('data-max="3"')
		})

		it('renders oracle with summary', () => {
			const oracle = {
				_id: 'oracle_rollable:test/oracle',
				type: 'oracle_rollable',
				name: 'Test Oracle',
				summary: 'This is a test oracle.',
				rows: [
					{ _id: 'row1', roll: { min: 1, max: 100 }, text: 'Result' }
				],
				_source: { title: 'Test', authors: [], date: '2024-01-01', license: 'MIT', url: '' }
			} as unknown as Datasworn.OracleRollable

			const html = renderOracle(oracle)

			expect(html).toContain('oracle-summary')
			expect(html).toContain('This is a test oracle.')
		})

		it('uses default 1d100 when no dice specified', () => {
			const oracle = {
				_id: 'oracle_rollable:test/oracle',
				type: 'oracle_rollable',
				name: 'Test Oracle',
				rows: [
					{ _id: 'row1', roll: { min: 1, max: 100 }, text: 'Result' }
				],
				_source: { title: 'Test', authors: [], date: '2024-01-01', license: 'MIT', url: '' }
			} as unknown as Datasworn.OracleRollable

			const html = renderOracle(oracle)

			expect(html).toContain('Roll 1d100')
		})

		it('returns empty string for oracle without rows', () => {
			const oracle = {
				_id: 'oracle_rollable:test/oracle',
				type: 'oracle_rollable',
				name: 'Test Oracle',
				rows: [],
				_source: { title: 'Test', authors: [], date: '2024-01-01', license: 'MIT', url: '' }
			} as unknown as Datasworn.OracleRollable

			const html = renderOracle(oracle)

			expect(html).not.toContain('oracle-table')
		})
	})

	describe('renderEmbeddedOracle', () => {
		it('renders embedded oracle table', () => {
			const oracle = {
				name: 'Embedded Oracle',
				dice: '1d6',
				rows: [
					{ roll: { min: 1, max: 3 }, text: 'Low' },
					{ roll: { min: 4, max: 6 }, text: 'High' }
				]
			} as unknown as EmbeddedOracle

			const html = renderEmbeddedOracle(oracle)

			expect(html).toContain('embedded-oracle-table')
			expect(html).toContain('Roll 1d6')
			expect(html).toContain('Low')
			expect(html).toContain('High')
		})

		it('returns empty string for empty rows', () => {
			const oracle = { name: 'Empty', rows: [] } as unknown as EmbeddedOracle
			const html = renderEmbeddedOracle(oracle)
			expect(html).toBe('')
		})

		it('returns empty string for missing rows', () => {
			const oracle = { name: 'No rows' }
			const html = renderEmbeddedOracle(oracle as any)
			expect(html).toBe('')
		})
	})

	describe('renderOracleColumns', () => {
		it('renders odds buttons for Ask the Oracle', () => {
			const oracles = {
				almost_certain: {
					name: 'Almost Certain',
					rows: [
						{ roll: { min: 1, max: 90 }, text: 'Yes' },
						{ roll: { min: 91, max: 100 }, text: 'No' }
					]
				},
				likely: {
					name: 'Likely',
					rows: [
						{ roll: { min: 1, max: 75 }, text: 'Yes' },
						{ roll: { min: 76, max: 100 }, text: 'No' }
					]
				}
			} as unknown as Record<string, EmbeddedOracle>

			const html = renderOracleColumns(oracles)

			expect(html).toContain('oracle-odds-picker')
			expect(html).toContain('Almost Certain')
			expect(html).toContain('Likely')
			expect(html).toContain('odds-button')
			expect(html).toContain('≤90') // threshold for Almost Certain
			expect(html).toContain('≤75') // threshold for Likely
		})

		it('returns empty string for empty oracles', () => {
			const html = renderOracleColumns({})
			expect(html).toBe('')
		})

		it('handles classic-style high-roll Yes', () => {
			const oracles = {
				likely: {
					name: 'Likely',
					rows: [
						{ roll: { min: 1, max: 25 }, text: 'No' },
						{ roll: { min: 26, max: 100 }, text: 'Yes' }
					]
				}
			} as unknown as Record<string, EmbeddedOracle>

			const html = renderOracleColumns(oracles)

			expect(html).toContain('26+')
		})
	})

	describe('ROLL_DATA_ATTR', () => {
		it('is the expected data attribute', () => {
			expect(ROLL_DATA_ATTR).toBe('data-roll-info')
		})
	})
})
