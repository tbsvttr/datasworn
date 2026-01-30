import { describe, expect, test } from 'bun:test'

import {
	compareRanges,
	validate
} from '../pkg-core/Validators/OracleRollable.js'

// Minimal OracleRollable-shaped test data
function makeTable(
	dice: string,
	rows: Array<{ roll: { min: number; max: number } | null; text: string }>
) {
	return {
		_id: 'oracle_rollable:test/table',
		name: 'Test Table',
		_source: { title: 'Test', authors: [] },
		oracle_type: 'table_text',
		type: 'oracle_rollable',
		dice,
		rows: rows.map((r) => ({
			text: r.text,
			roll: r.roll
		})),
		column_labels: { roll: 'Roll', text: 'Result' }
	} as any
}

describe('compareRanges', () => {
	test('both null rolls returns 0', () => {
		expect(compareRanges({ roll: null }, { roll: null })).toBe(0)
	})

	test('a null, b not null returns -1', () => {
		expect(compareRanges({ roll: null }, { roll: { min: 1, max: 50 } })).toBe(
			-1
		)
	})

	test('a not null, b null returns 1', () => {
		expect(compareRanges({ roll: { min: 1, max: 50 } }, { roll: null })).toBe(1)
	})

	test('a.min < b.min returns -1', () => {
		expect(
			compareRanges(
				{ roll: { min: 1, max: 50 } },
				{ roll: { min: 51, max: 100 } }
			)
		).toBe(-1)
	})

	test('a.min > b.min returns 1', () => {
		expect(
			compareRanges(
				{ roll: { min: 51, max: 100 } },
				{ roll: { min: 1, max: 50 } }
			)
		).toBe(1)
	})

	test('equal mins returns 0', () => {
		expect(
			compareRanges(
				{ roll: { min: 1, max: 50 } },
				{ roll: { min: 1, max: 100 } }
			)
		).toBe(0)
	})
})

describe('validate', () => {
	test('valid sequential 1d100 table passes', () => {
		const table = makeTable('1d100', [
			{ roll: { min: 1, max: 33 }, text: 'Result A' },
			{ roll: { min: 34, max: 66 }, text: 'Result B' },
			{ roll: { min: 67, max: 100 }, text: 'Result C' }
		])
		expect(validate(table)).toBe(true)
	})

	test('valid 1d6 table passes', () => {
		const table = makeTable('1d6', [
			{ roll: { min: 1, max: 2 }, text: 'Low' },
			{ roll: { min: 3, max: 4 }, text: 'Mid' },
			{ roll: { min: 5, max: 6 }, text: 'High' }
		])
		expect(validate(table)).toBe(true)
	})

	test('single-row table passes', () => {
		const table = makeTable('1d6', [
			{ roll: { min: 1, max: 6 }, text: 'Everything' }
		])
		expect(validate(table)).toBe(true)
	})

	test('null-roll cosmetic rows are skipped', () => {
		const table = makeTable('1d6', [
			{ roll: null, text: '(header)' },
			{ roll: { min: 1, max: 3 }, text: 'Low' },
			{ roll: { min: 4, max: 6 }, text: 'High' }
		])
		expect(validate(table)).toBe(true)
	})

	test('gap in ranges throws', () => {
		const table = makeTable('1d100', [
			{ roll: { min: 1, max: 33 }, text: 'Result A' },
			// gap: 34-50 missing
			{ roll: { min: 51, max: 100 }, text: 'Result B' }
		])
		expect(() => validate(table)).toThrow('not sequential')
	})

	test('row min below dice minimum throws', () => {
		const table = makeTable('1d6', [
			{ roll: { min: 0, max: 3 }, text: 'Low' },
			{ roll: { min: 4, max: 6 }, text: 'High' }
		])
		expect(() => validate(table)).toThrow('less than the minimum possible roll')
	})

	test('row max above dice maximum throws', () => {
		const table = makeTable('1d6', [
			{ roll: { min: 1, max: 3 }, text: 'Low' },
			{ roll: { min: 4, max: 7 }, text: 'High' }
		])
		expect(() => validate(table)).toThrow(
			'greater than the maximum possible roll'
		)
	})

	test('invalid dice expression throws', () => {
		const table = makeTable('bad_dice', [
			{ roll: { min: 1, max: 6 }, text: 'Result' }
		])
		expect(() => validate(table)).toThrow('Could not parse')
	})

	test('2d6 table validates with correct range (2-12)', () => {
		const table = makeTable('2d6', [
			{ roll: { min: 2, max: 6 }, text: 'Low' },
			{ roll: { min: 7, max: 9 }, text: 'Mid' },
			{ roll: { min: 10, max: 12 }, text: 'High' }
		])
		expect(validate(table)).toBe(true)
	})
})
