import { describe, expect, test } from 'bun:test'

import { validate } from '../pkg-core/Validators/DiceRange.js'

describe('DiceRange.validate', () => {
	test('valid range returns true', () => {
		expect(validate({ min: 1, max: 6 })).toBe(true)
	})

	test('equal min and max returns true', () => {
		expect(validate({ min: 5, max: 5 })).toBe(true)
	})

	test('inverted range throws', () => {
		expect(() => validate({ min: 6, max: 1 })).toThrow(
			'min (6) is greater than max (1)'
		)
	})
})
