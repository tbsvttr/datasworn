/**
 * Tests for type guards
 */

import { describe, it, expect } from 'vitest'
import {
	hasType,
	isMove,
	isAsset,
	isOracleRollable,
	isNpc,
	isAtlasEntry,
	isTruth,
	isCollection,
	isDelveSite,
	isDelveSiteTheme,
	isDelveSiteDomain
} from './types'

describe('Type Guards', () => {
	describe('hasType', () => {
		it('returns true for matching type', () => {
			expect(hasType({ type: 'move' }, 'move')).toBe(true)
			expect(hasType({ type: 'asset' }, 'asset')).toBe(true)
		})

		it('returns false for non-matching type', () => {
			expect(hasType({ type: 'move' }, 'asset')).toBe(false)
		})

		it('returns false for null', () => {
			expect(hasType(null, 'move')).toBe(false)
		})

		it('returns false for undefined', () => {
			expect(hasType(undefined, 'move')).toBe(false)
		})

		it('returns false for primitives', () => {
			expect(hasType('string', 'move')).toBe(false)
			expect(hasType(123, 'move')).toBe(false)
			expect(hasType(true, 'move')).toBe(false)
		})

		it('returns false for objects without type', () => {
			expect(hasType({}, 'move')).toBe(false)
			expect(hasType({ name: 'test' }, 'move')).toBe(false)
		})
	})

	describe('isMove', () => {
		it('returns true for move objects', () => {
			expect(isMove({ type: 'move', name: 'Face Danger' })).toBe(true)
		})

		it('returns false for non-move objects', () => {
			expect(isMove({ type: 'asset' })).toBe(false)
			expect(isMove(null)).toBe(false)
		})
	})

	describe('isAsset', () => {
		it('returns true for asset objects', () => {
			expect(isAsset({ type: 'asset', name: 'Alchemist' })).toBe(true)
		})

		it('returns false for non-asset objects', () => {
			expect(isAsset({ type: 'move' })).toBe(false)
		})
	})

	describe('isOracleRollable', () => {
		it('returns true for oracle_rollable objects', () => {
			expect(isOracleRollable({ type: 'oracle_rollable' })).toBe(true)
		})

		it('returns false for non-oracle objects', () => {
			expect(isOracleRollable({ type: 'move' })).toBe(false)
		})
	})

	describe('isNpc', () => {
		it('returns true for npc objects', () => {
			expect(isNpc({ type: 'npc', name: 'Raider' })).toBe(true)
		})

		it('returns false for non-npc objects', () => {
			expect(isNpc({ type: 'move' })).toBe(false)
		})
	})

	describe('isAtlasEntry', () => {
		it('returns true for atlas_entry objects', () => {
			expect(isAtlasEntry({ type: 'atlas_entry' })).toBe(true)
		})

		it('returns false for non-atlas objects', () => {
			expect(isAtlasEntry({ type: 'move' })).toBe(false)
		})
	})

	describe('isTruth', () => {
		it('returns true for truth objects', () => {
			expect(isTruth({ type: 'truth' })).toBe(true)
		})

		it('returns false for non-truth objects', () => {
			expect(isTruth({ type: 'move' })).toBe(false)
		})
	})

	describe('isCollection', () => {
		it('returns true for move_category', () => {
			expect(isCollection({ type: 'move_category' })).toBe(true)
		})

		it('returns true for asset_collection', () => {
			expect(isCollection({ type: 'asset_collection' })).toBe(true)
		})

		it('returns true for oracle_collection', () => {
			expect(isCollection({ type: 'oracle_collection' })).toBe(true)
		})

		it('returns true for npc_collection', () => {
			expect(isCollection({ type: 'npc_collection' })).toBe(true)
		})

		it('returns true for atlas_collection', () => {
			expect(isCollection({ type: 'atlas_collection' })).toBe(true)
		})

		it('returns false for non-collection types', () => {
			expect(isCollection({ type: 'move' })).toBe(false)
			expect(isCollection({ type: 'asset' })).toBe(false)
		})

		it('returns false for null/undefined', () => {
			expect(isCollection(null)).toBe(false)
			expect(isCollection(undefined)).toBe(false)
		})
	})

	describe('isDelveSite', () => {
		it('returns true for delve_site objects', () => {
			expect(isDelveSite({ type: 'delve_site' })).toBe(true)
		})

		it('returns false for non-delve_site objects', () => {
			expect(isDelveSite({ type: 'move' })).toBe(false)
		})
	})

	describe('isDelveSiteTheme', () => {
		it('returns true for delve_site_theme objects', () => {
			expect(isDelveSiteTheme({ type: 'delve_site_theme' })).toBe(true)
		})

		it('returns false for non-delve_site_theme objects', () => {
			expect(isDelveSiteTheme({ type: 'delve_site' })).toBe(false)
		})
	})

	describe('isDelveSiteDomain', () => {
		it('returns true for delve_site_domain objects', () => {
			expect(isDelveSiteDomain({ type: 'delve_site_domain' })).toBe(true)
		})

		it('returns false for non-delve_site_domain objects', () => {
			expect(isDelveSiteDomain({ type: 'delve_site' })).toBe(false)
		})
	})
})
