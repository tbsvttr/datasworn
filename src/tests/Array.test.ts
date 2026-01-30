import { describe, expect, test } from 'bun:test'

import { arrayIs } from '../pkg-core/Utils/Array.js'

describe('arrayIs', () => {
	test('equal flat arrays return true', () => {
		expect(arrayIs([1, 2, 3], [1, 2, 3])).toBe(true)
	})

	test('different lengths return false', () => {
		expect(arrayIs([1, 2], [1, 2, 3])).toBe(false)
	})

	test('different values return false', () => {
		expect(arrayIs([1, 2, 3], [1, 9, 3])).toBe(false)
	})

	test('empty arrays return true', () => {
		expect(arrayIs([], [])).toBe(true)
	})

	test('nested arrays are compared recursively', () => {
		expect(arrayIs([[1, 2], [3]], [[1, 2], [3]])).toBe(true)
		expect(arrayIs([[1, 2], [3]], [[1, 2], [4]])).toBe(false)
	})

	test('deeply nested arrays', () => {
		expect(arrayIs([[[1]]], [[[1]]])).toBe(true)
		expect(arrayIs([[[1]]], [[[2]]])).toBe(false)
	})

	test('uses Object.is semantics: NaN equals NaN', () => {
		expect(arrayIs([NaN], [NaN])).toBe(true)
	})

	test('uses Object.is semantics: +0 is not -0', () => {
		expect(arrayIs([+0], [-0])).toBe(false)
	})

	test('string arrays', () => {
		expect(arrayIs(['a', 'b'], ['a', 'b'])).toBe(true)
		expect(arrayIs(['a', 'b'], ['a', 'c'])).toBe(false)
	})
})
