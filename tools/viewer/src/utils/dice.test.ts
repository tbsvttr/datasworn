/**
 * Tests for dice utilities
 */

import { describe, it, expect } from 'vitest'
import { parseDice, rollDice, isInRange, isMatch, formatRollRange } from './dice'

describe('Dice Utilities', () => {
	describe('parseDice', () => {
		it('parses 1d100', () => {
			expect(parseDice('1d100')).toEqual({ count: 1, sides: 100 })
		})

		it('parses 1d6', () => {
			expect(parseDice('1d6')).toEqual({ count: 1, sides: 6 })
		})

		it('parses 2d10', () => {
			expect(parseDice('2d10')).toEqual({ count: 2, sides: 10 })
		})

		it('parses 1d20', () => {
			expect(parseDice('1d20')).toEqual({ count: 1, sides: 20 })
		})

		it('is case insensitive', () => {
			expect(parseDice('1D100')).toEqual({ count: 1, sides: 100 })
		})

		it('returns default for invalid notation', () => {
			expect(parseDice('invalid')).toEqual({ count: 1, sides: 100 })
		})
	})

	describe('rollDice', () => {
		it('returns a number within range for 1d6', () => {
			for (let i = 0; i < 100; i++) {
				const result = rollDice('1d6')
				expect(result).toBeGreaterThanOrEqual(1)
				expect(result).toBeLessThanOrEqual(6)
			}
		})

		it('returns a number within range for 1d100', () => {
			for (let i = 0; i < 100; i++) {
				const result = rollDice('1d100')
				expect(result).toBeGreaterThanOrEqual(1)
				expect(result).toBeLessThanOrEqual(100)
			}
		})

		it('returns a number within range for 2d6', () => {
			for (let i = 0; i < 100; i++) {
				const result = rollDice('2d6')
				expect(result).toBeGreaterThanOrEqual(2)
				expect(result).toBeLessThanOrEqual(12)
			}
		})
	})

	describe('isInRange', () => {
		it('returns true when roll is within range', () => {
			expect(isInRange(5, { min: 1, max: 10 })).toBe(true)
			expect(isInRange(1, { min: 1, max: 10 })).toBe(true)
			expect(isInRange(10, { min: 1, max: 10 })).toBe(true)
		})

		it('returns false when roll is outside range', () => {
			expect(isInRange(0, { min: 1, max: 10 })).toBe(false)
			expect(isInRange(11, { min: 1, max: 10 })).toBe(false)
		})

		it('works with single value ranges', () => {
			expect(isInRange(100, { min: 100, max: 100 })).toBe(true)
			expect(isInRange(99, { min: 100, max: 100 })).toBe(false)
		})
	})

	describe('isMatch', () => {
		it('returns true for doubles', () => {
			expect(isMatch(11)).toBe(true)
			expect(isMatch(22)).toBe(true)
			expect(isMatch(33)).toBe(true)
			expect(isMatch(44)).toBe(true)
			expect(isMatch(55)).toBe(true)
			expect(isMatch(66)).toBe(true)
			expect(isMatch(77)).toBe(true)
			expect(isMatch(88)).toBe(true)
			expect(isMatch(99)).toBe(true)
		})

		it('returns false for non-doubles', () => {
			expect(isMatch(12)).toBe(false)
			expect(isMatch(50)).toBe(false)
			expect(isMatch(100)).toBe(false)
		})

		it('returns false for single digits', () => {
			expect(isMatch(1)).toBe(false)
			expect(isMatch(5)).toBe(false)
			expect(isMatch(10)).toBe(false)
		})
	})

	describe('formatRollRange', () => {
		it('formats a range with en-dash', () => {
			expect(formatRollRange({ min: 1, max: 10 })).toBe('1–10')
		})

		it('formats a single value without dash', () => {
			expect(formatRollRange({ min: 100, max: 100 })).toBe('100')
		})

		it('formats various ranges', () => {
			expect(formatRollRange({ min: 21, max: 43 })).toBe('21–43')
			expect(formatRollRange({ min: 1, max: 27 })).toBe('1–27')
		})
	})
})
