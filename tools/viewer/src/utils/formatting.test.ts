/**
 * Tests for formatting utilities
 */

import { describe, it, expect } from 'vitest'
import { formatLabel, formatOutcome, formatRank, formatType } from './formatting'

describe('Formatting Utilities', () => {
	describe('formatLabel', () => {
		it('converts snake_case to Title Case', () => {
			expect(formatLabel('strong_hit')).toBe('Strong Hit')
			expect(formatLabel('weak_hit')).toBe('Weak Hit')
			expect(formatLabel('oracle_rollable')).toBe('Oracle Rollable')
		})

		it('converts kebab-case to Title Case', () => {
			expect(formatLabel('strong-hit')).toBe('Strong Hit')
			expect(formatLabel('oracle-rollable')).toBe('Oracle Rollable')
		})

		it('capitalizes single words', () => {
			expect(formatLabel('move')).toBe('Move')
			expect(formatLabel('asset')).toBe('Asset')
		})

		it('handles empty string', () => {
			expect(formatLabel('')).toBe('')
		})
	})

	describe('formatOutcome', () => {
		it('returns predefined labels for known outcomes', () => {
			expect(formatOutcome('strong_hit')).toBe('Strong Hit')
			expect(formatOutcome('weak_hit')).toBe('Weak Hit')
			expect(formatOutcome('miss')).toBe('Miss')
		})

		it('falls back to formatLabel for unknown outcomes', () => {
			expect(formatOutcome('custom_outcome')).toBe('Custom Outcome')
		})
	})

	describe('formatRank', () => {
		it('returns correct labels for all ranks', () => {
			expect(formatRank(1)).toBe('Troublesome')
			expect(formatRank(2)).toBe('Dangerous')
			expect(formatRank(3)).toBe('Formidable')
			expect(formatRank(4)).toBe('Extreme')
			expect(formatRank(5)).toBe('Epic')
		})

		it('falls back to "Rank N" for unknown ranks', () => {
			expect(formatRank(0)).toBe('Rank 0')
			expect(formatRank(6)).toBe('Rank 6')
		})
	})

	describe('formatType', () => {
		it('returns predefined labels for known types', () => {
			expect(formatType('move')).toBe('Move')
			expect(formatType('asset')).toBe('Asset')
			expect(formatType('oracle_rollable')).toBe('Oracle')
			expect(formatType('npc')).toBe('NPC')
			expect(formatType('atlas_entry')).toBe('Atlas Entry')
			expect(formatType('truth')).toBe('Truth')
		})

		it('returns labels for collection types', () => {
			expect(formatType('move_category')).toBe('Move Category')
			expect(formatType('asset_collection')).toBe('Asset Collection')
			expect(formatType('oracle_collection')).toBe('Oracle Collection')
			expect(formatType('npc_collection')).toBe('NPC Collection')
			expect(formatType('atlas_collection')).toBe('Atlas Collection')
		})

		it('falls back to formatLabel for unknown types', () => {
			expect(formatType('custom_type')).toBe('Custom Type')
		})
	})
})
