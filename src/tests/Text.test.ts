import { describe, expect, test } from 'bun:test'

import {
	forEachIdRef,
	forEachPrimitiveValue,
	needsIdValidation,
	validateIdPointer,
	validateIdsInStrings
} from '../pkg-core/Validators/Text.js'

describe('needsIdValidation', () => {
	test('_id key returns false', () => {
		expect(needsIdValidation('_id', 'oracle_rollable:pkg/path')).toBe(false)
	})

	test('plain text keys return false', () => {
		expect(needsIdValidation('name', 'oracle_rollable:pkg/path')).toBe(false)
		expect(needsIdValidation('label', 'oracle_rollable:pkg/path')).toBe(false)
		expect(needsIdValidation('title', 'oracle_rollable:pkg/path')).toBe(false)
	})

	test('URL keys return false', () => {
		expect(needsIdValidation('url', 'https://example.com/path')).toBe(false)
		expect(needsIdValidation('license', 'https://creativecommons.org')).toBe(
			false
		)
	})

	test('non-text keys return false', () => {
		expect(needsIdValidation('dice', '1d100')).toBe(false)
	})

	test('string without slash returns false', () => {
		expect(needsIdValidation('text', 'no slash here')).toBe(false)
	})

	test('string without colon returns false', () => {
		expect(needsIdValidation('text', 'no/colon/here')).toBe(false)
	})

	test('non-string value returns false', () => {
		expect(needsIdValidation('text', 42)).toBe(false)
		expect(needsIdValidation('text', true)).toBe(false)
		expect(needsIdValidation('text', null)).toBe(false)
	})

	test('markdown text with ID-like string returns true', () => {
		expect(
			needsIdValidation('text', '[Asset](datasworn:asset:starforged/path/ace)')
		).toBe(true)
	})

	test('bare ID string returns true', () => {
		expect(needsIdValidation('text', 'oracle_rollable:pkg/path')).toBe(true)
	})
})

describe('forEachPrimitiveValue', () => {
	test('calls fn for string values', () => {
		const values: unknown[] = []
		forEachPrimitiveValue('hello', 'key', (v) => values.push(v))
		expect(values).toEqual(['hello'])
	})

	test('calls fn for number values', () => {
		const values: unknown[] = []
		forEachPrimitiveValue(42, 'key', (v) => values.push(v))
		expect(values).toEqual([42])
	})

	test('calls fn for boolean values', () => {
		const values: unknown[] = []
		forEachPrimitiveValue(true, 'key', (v) => values.push(v))
		expect(values).toEqual([true])
	})

	test('calls fn for null', () => {
		const values: unknown[] = []
		forEachPrimitiveValue(null, 'key', (v) => values.push(v))
		expect(values).toEqual([null])
	})

	test('skips undefined', () => {
		const values: unknown[] = []
		forEachPrimitiveValue(undefined, 'key', (v) => values.push(v))
		expect(values).toEqual([])
	})

	test('recurses into objects', () => {
		const values: unknown[] = []
		forEachPrimitiveValue({ a: 1, b: 'two' }, undefined, (v) => values.push(v))
		expect(values).toContain(1)
		expect(values).toContain('two')
	})

	test('recurses into arrays with index as key', () => {
		const keys: unknown[] = []
		forEachPrimitiveValue(['a', 'b'], undefined, (_v, k) => keys.push(k))
		expect(keys).toEqual([0, 1])
	})

	test('deeply nested structures', () => {
		const values: unknown[] = []
		forEachPrimitiveValue(
			{ nested: { deep: [1, { x: 'y' }] } },
			undefined,
			(v) => values.push(v)
		)
		expect(values).toContain(1)
		expect(values).toContain('y')
	})
})

describe('forEachIdRef', () => {
	test('extracts IDs from nested markdown text', () => {
		const ids: string[] = []
		const data = {
			text: 'See [Asset](datasworn:asset:starforged/path/ace) for details',
			name: 'Test'
		}
		forEachIdRef(data, (id) => ids.push(id))
		expect(ids.length).toBeGreaterThan(0)
		expect(ids).toContain('asset:starforged/path/ace')
	})

	test('plain text without IDs produces no results', () => {
		const ids: string[] = []
		forEachIdRef({ text: 'Just plain text, nothing special.' }, (id) =>
			ids.push(id)
		)
		expect(ids).toEqual([])
	})

	test('skips _id field', () => {
		const ids: string[] = []
		forEachIdRef({ _id: 'oracle_rollable:test/foo' }, (id) => ids.push(id))
		expect(ids).toEqual([])
	})

	test('skips name field', () => {
		const ids: string[] = []
		forEachIdRef({ name: 'oracle_rollable:test/foo' }, (id) => ids.push(id))
		expect(ids).toEqual([])
	})
})

describe('validateIdPointer', () => {
	test('valid ID in index returns true', () => {
		const index = new Map([['oracle_rollable:pkg/path', {}]])
		expect(validateIdPointer('oracle_rollable:pkg/path', index)).toBe(true)
	})

	test('missing ID throws', () => {
		const index = new Map<string, unknown>()
		expect(() =>
			validateIdPointer('oracle_rollable:pkg/missing', index)
		).toThrow('Bad Datasworn ID pointer')
	})
})

describe('validateIdsInStrings', () => {
	test('data with valid IDs returns true', () => {
		const index = new Map([['asset:starforged/path/ace', {}]])
		const data = {
			text: 'Use [Ace](datasworn:asset:starforged/path/ace)'
		}
		expect(validateIdsInStrings(data, index)).toBe(true)
	})

	test('data with no IDs returns true', () => {
		const index = new Map<string, unknown>()
		expect(validateIdsInStrings({ text: 'Plain text' }, index)).toBe(true)
	})
})
