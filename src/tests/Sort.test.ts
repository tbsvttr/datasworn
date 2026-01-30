import { describe, expect, test } from 'bun:test'

import {
	compareObjectKeys,
	sortDataswornKeys,
	sortJson,
	sortObjectKeys
} from '../pkg-core/Utils/Sort.js'

describe('compareObjectKeys', () => {
	const keyOrder = ['alpha', 'beta', 'gamma', 'delta']

	test('both keys in order returns correct sign', () => {
		expect(compareObjectKeys('alpha', 'gamma', keyOrder)).toBeLessThan(0)
		expect(compareObjectKeys('gamma', 'alpha', keyOrder)).toBeGreaterThan(0)
	})

	test('missing key sorts after known keys', () => {
		expect(compareObjectKeys('alpha', 'unknown', keyOrder)).toBeLessThan(0)
		expect(compareObjectKeys('unknown', 'alpha', keyOrder)).toBeGreaterThan(0)
	})

	test('two missing keys fall back to alphabetical', () => {
		expect(compareObjectKeys('zebra', 'apple', keyOrder)).toBeGreaterThan(0)
		expect(compareObjectKeys('apple', 'zebra', keyOrder)).toBeLessThan(0)
	})

	test('same key returns alphabetical comparison (0)', () => {
		expect(compareObjectKeys('alpha', 'alpha', keyOrder)).toBe(0)
	})

	test('empty keyOrder falls back to alphabetical', () => {
		expect(compareObjectKeys('beta', 'alpha', [])).toBeGreaterThan(0)
	})

	test('tracks unsortable keys when set is provided', () => {
		const unsortable = new Set<string>()
		compareObjectKeys('unknown_key', 'alpha', keyOrder, unsortable)
		expect(unsortable.has('unknown_key')).toBe(true)
		expect(unsortable.has('alpha')).toBe(false)
	})
})

describe('sortObjectKeys', () => {
	test('reorders keys according to keyOrder', () => {
		const input = { gamma: 3, alpha: 1, beta: 2 }
		const keyOrder = ['alpha', 'beta', 'gamma']
		const result = sortObjectKeys(input, keyOrder)
		expect(Object.keys(result)).toEqual(['alpha', 'beta', 'gamma'])
	})

	test('preserves values', () => {
		const input = { b: 'two', a: 'one' }
		const result = sortObjectKeys(input, ['a', 'b'])
		expect(result.a).toBe('one')
		expect(result.b).toBe('two')
	})

	test('unknown keys go to end in alphabetical order', () => {
		const input = { z: 4, a: 1, known: 2, m: 3 }
		const result = sortObjectKeys(input, ['known'])
		const keys = Object.keys(result)
		expect(keys[0]).toBe('known')
		// remaining keys sorted alphabetically
		expect(keys.slice(1)).toEqual(['a', 'm', 'z'])
	})
})

describe('sortDataswornKeys', () => {
	test('_id comes before type, type before name, name before description', () => {
		const input = {
			description: 'desc',
			name: 'test',
			type: 'oracle_rollable',
			_id: 'oracle_rollable:test/foo'
		}
		const result = sortDataswornKeys(input)
		const keys = Object.keys(result)
		expect(keys.indexOf('_id')).toBeLessThan(keys.indexOf('type'))
		expect(keys.indexOf('type')).toBeLessThan(keys.indexOf('name'))
		expect(keys.indexOf('name')).toBeLessThan(keys.indexOf('description'))
	})

	test('_source comes near the end', () => {
		const input = {
			_source: {},
			_id: 'test:foo/bar',
			name: 'Test'
		}
		const result = sortDataswornKeys(input)
		const keys = Object.keys(result)
		expect(keys.indexOf('_id')).toBeLessThan(keys.indexOf('_source'))
		expect(keys.indexOf('name')).toBeLessThan(keys.indexOf('_source'))
	})
})

describe('sortJson', () => {
	test('returns non-objects unchanged', () => {
		expect(sortJson('key', 'string_value')).toBe('string_value')
		expect(sortJson('key', 42)).toBe(42)
		expect(sortJson('key', null)).toBe(null)
		expect(sortJson('key', true)).toBe(true)
	})

	test('returns arrays unchanged', () => {
		const arr = [3, 1, 2]
		expect(sortJson('key', arr)).toBe(arr)
	})

	test('skips blacklisted keys', () => {
		const obj = { z: 1, a: 2 }
		// 'options' is blacklisted — should return unchanged
		expect(sortJson('options', obj)).toBe(obj)
		expect(sortJson('controls', obj)).toBe(obj)
		expect(sortJson('contents', obj)).toBe(obj)
		expect(sortJson('collections', obj)).toBe(obj)
	})

	test('skips dictionaries of ID nodes', () => {
		const dict = {
			foo: { _id: 'type:pkg/foo', name: 'Foo' },
			bar: { _id: 'type:pkg/bar', name: 'Bar' }
		}
		// dictionary of ID nodes should be returned as-is
		expect(sortJson('some_key', dict)).toBe(dict)
	})

	test('sorts plain objects by datasworn key order', () => {
		const input = { name: 'test', _id: 'type:pkg/test', type: 'move' }
		const result = sortJson('some_key', input) as Record<string, unknown>
		const keys = Object.keys(result)
		expect(keys.indexOf('_id')).toBeLessThan(keys.indexOf('type'))
		expect(keys.indexOf('type')).toBeLessThan(keys.indexOf('name'))
	})
})
