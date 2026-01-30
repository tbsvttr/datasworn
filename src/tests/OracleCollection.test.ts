import { describe, expect, test } from 'bun:test'

import { validate } from '../pkg-core/Validators/OracleCollection.js'

function makeRollable(
	rows: Array<{
		roll: { min: number; max: number } | null
		text: string
	}>
) {
	return {
		_id: 'oracle_rollable:test/col',
		name: 'Test',
		_source: { title: 'Test', authors: [] },
		oracle_type: 'column_text',
		type: 'oracle_rollable',
		dice: '1d6',
		rows: rows.map((r) => ({ text: r.text, roll: r.roll })),
		column_labels: { roll: 'Roll', text: 'Result' }
	} as any
}

function makeCollection(
	oracleType: string,
	contents: Record<string, ReturnType<typeof makeRollable>>
) {
	return {
		_id: 'oracle_collection:test/shared',
		name: 'Shared Table',
		_source: { title: 'Test', authors: [] },
		type: 'oracle_collection',
		oracle_type: oracleType,
		contents,
		column_labels: { text: 'Result' }
	} as any
}

describe('OracleCollection.validate', () => {
	describe('table_shared_rolls', () => {
		test('matching roll ranges across columns passes', () => {
			const col = makeCollection('table_shared_rolls', {
				column_a: makeRollable([
					{ roll: { min: 1, max: 3 }, text: 'A1' },
					{ roll: { min: 4, max: 6 }, text: 'A2' }
				]),
				column_b: makeRollable([
					{ roll: { min: 1, max: 3 }, text: 'B1' },
					{ roll: { min: 4, max: 6 }, text: 'B2' }
				])
			})
			expect(validate(col)).toBe(true)
		})

		test('mismatched roll ranges throws', () => {
			const col = makeCollection('table_shared_rolls', {
				column_a: makeRollable([
					{ roll: { min: 1, max: 3 }, text: 'A1' },
					{ roll: { min: 4, max: 6 }, text: 'A2' }
				]),
				column_b: makeRollable([
					{ roll: { min: 1, max: 2 }, text: 'B1' },
					{ roll: { min: 3, max: 6 }, text: 'B2' }
				])
			})
			expect(() => validate(col)).toThrow('same roll ranges')
		})
	})

	describe('table_shared_text', () => {
		test('matching text across columns passes', () => {
			const col = makeCollection('table_shared_text', {
				column_a: makeRollable([
					{ roll: { min: 1, max: 3 }, text: 'Shared 1' },
					{ roll: { min: 4, max: 6 }, text: 'Shared 2' }
				]),
				column_b: makeRollable([
					{ roll: { min: 1, max: 3 }, text: 'Shared 1' },
					{ roll: { min: 4, max: 6 }, text: 'Shared 2' }
				])
			})
			expect(validate(col)).toBe(true)
		})

		test('mismatched text throws', () => {
			const col = makeCollection('table_shared_text', {
				column_a: makeRollable([
					{ roll: { min: 1, max: 3 }, text: 'Same' },
					{ roll: { min: 4, max: 6 }, text: 'Same' }
				]),
				column_b: makeRollable([
					{ roll: { min: 1, max: 3 }, text: 'Same' },
					{ roll: { min: 4, max: 6 }, text: 'Different' }
				])
			})
			expect(() => validate(col)).toThrow('same text content')
		})
	})

	describe('tables (default)', () => {
		test('no cross-validation needed, passes with any contents', () => {
			const col = makeCollection('tables', {
				column_a: makeRollable([{ roll: { min: 1, max: 6 }, text: 'A' }]),
				column_b: makeRollable([
					{ roll: { min: 1, max: 3 }, text: 'B1' },
					{ roll: { min: 4, max: 6 }, text: 'B2' }
				])
			})
			expect(validate(col)).toBe(true)
		})
	})
})
