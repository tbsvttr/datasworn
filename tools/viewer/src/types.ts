/**
 * Viewer-specific type definitions
 * Uses types from @datasworn/core where possible
 */

import type { Datasworn } from '@datasworn/core'

// Re-export Datasworn types for convenience
export type { Datasworn }

// Use core types directly instead of custom interfaces
export type OracleRow = Datasworn.OracleRollableRow
export type EmbeddedOracle = Datasworn.EmbeddedOracleRollable
export type DiceRange = Datasworn.DiceRange

/** Collection types */
export type CollectionType =
	| Datasworn.MoveCategory
	| Datasworn.AssetCollection
	| Datasworn.OracleCollection
	| Datasworn.NpcCollection
	| Datasworn.AtlasCollection

/** Datasworn item types */
export type DataswornType =
	| 'move'
	| 'asset'
	| 'oracle_rollable'
	| 'npc'
	| 'atlas_entry'
	| 'truth'
	| 'move_category'
	| 'asset_collection'
	| 'oracle_collection'
	| 'npc_collection'
	| 'atlas_collection'
	| 'delve_site'
	| 'delve_site_theme'
	| 'delve_site_domain'

/** Check if an item is a specific Datasworn type */
export function hasType(item: unknown, type: DataswornType): boolean {
	return (
		typeof item === 'object' &&
		item !== null &&
		(item as Record<string, unknown>).type === type
	)
}

/** Type guard for Move */
export function isMove(item: unknown): item is Datasworn.Move {
	return hasType(item, 'move')
}

/** Type guard for Asset */
export function isAsset(item: unknown): item is Datasworn.Asset {
	return hasType(item, 'asset')
}

/** Type guard for OracleRollable */
export function isOracleRollable(item: unknown): item is Datasworn.OracleRollable {
	return hasType(item, 'oracle_rollable')
}

/** Type guard for NPC */
export function isNpc(item: unknown): item is Datasworn.Npc {
	return hasType(item, 'npc')
}

/** Type guard for AtlasEntry */
export function isAtlasEntry(item: unknown): item is Datasworn.AtlasEntry {
	return hasType(item, 'atlas_entry')
}

/** Type guard for Truth */
export function isTruth(item: unknown): item is Datasworn.Truth {
	return hasType(item, 'truth')
}

/** Type guard for collection types */
export function isCollection(item: unknown): item is CollectionType {
	if (typeof item !== 'object' || item === null) return false
	const type = (item as Record<string, unknown>).type
	return (
		type === 'move_category' ||
		type === 'asset_collection' ||
		type === 'oracle_collection' ||
		type === 'npc_collection' ||
		type === 'atlas_collection'
	)
}

/** Type guard for DelveSite */
export function isDelveSite(item: unknown): item is Datasworn.DelveSite {
	return hasType(item, 'delve_site')
}

/** Type guard for DelveSiteTheme */
export function isDelveSiteTheme(item: unknown): item is Datasworn.DelveSiteTheme {
	return hasType(item, 'delve_site_theme')
}

/** Type guard for DelveSiteDomain */
export function isDelveSiteDomain(item: unknown): item is Datasworn.DelveSiteDomain {
	return hasType(item, 'delve_site_domain')
}
