/**
 * Text formatting utilities
 */

/** Format a snake_case or kebab-case key as Title Case */
export function formatLabel(key: string): string {
	return key
		.replace(/[_-]/g, ' ')
		.replace(/\b\w/g, (c) => c.toUpperCase())
}

/** Outcome labels for moves */
export const OUTCOME_LABELS: Record<string, string> = {
	strong_hit: 'Strong Hit',
	weak_hit: 'Weak Hit',
	miss: 'Miss'
}

/** Format an outcome key to display label */
export function formatOutcome(key: string): string {
	return OUTCOME_LABELS[key] || formatLabel(key)
}

/** Rank labels for NPCs */
export const RANK_LABELS: Record<number, string> = {
	1: 'Troublesome',
	2: 'Dangerous',
	3: 'Formidable',
	4: 'Extreme',
	5: 'Epic'
}

/** Format a numeric rank to display label */
export function formatRank(rank: number): string {
	return RANK_LABELS[rank] || `Rank ${rank}`
}

/** Datasworn type display names */
export const TYPE_LABELS: Record<string, string> = {
	move: 'Move',
	asset: 'Asset',
	oracle_rollable: 'Oracle',
	npc: 'NPC',
	atlas_entry: 'Atlas Entry',
	truth: 'Truth',
	move_category: 'Move Category',
	asset_collection: 'Asset Collection',
	oracle_collection: 'Oracle Collection',
	npc_collection: 'NPC Collection',
	atlas_collection: 'Atlas Collection'
}

/** Format a type key to display label */
export function formatType(type: string): string {
	return TYPE_LABELS[type] || formatLabel(type)
}
