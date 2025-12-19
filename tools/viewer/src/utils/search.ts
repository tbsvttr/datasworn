/**
 * Search utilities for finding items in rulesets
 */

import type { RulesPackage } from './loader'

export interface SearchResult {
	id: string
	name: string
	type: string
	path: string[]
	item: unknown
}

/** Search for items matching a query across all loaded data */
export function searchItems(
	ruleset: RulesPackage,
	query: string,
	limit = 50
): SearchResult[] {
	if (!query.trim()) return []

	const results: SearchResult[] = []
	const lowerQuery = query.toLowerCase()

	// Search in each category
	const categories = ['moves', 'assets', 'oracles', 'npcs', 'atlas', 'truths'] as const

	for (const category of categories) {
		const data = (ruleset as unknown as Record<string, unknown>)[category]
		if (data && typeof data === 'object') {
			searchInObject(data as Record<string, unknown>, [category], lowerQuery, results, limit)
		}
		if (results.length >= limit) break
	}

	// Sort by relevance (exact matches first, then starts-with, then contains)
	results.sort((a, b) => {
		const aLower = a.name.toLowerCase()
		const bLower = b.name.toLowerCase()

		// Exact match
		if (aLower === lowerQuery && bLower !== lowerQuery) return -1
		if (bLower === lowerQuery && aLower !== lowerQuery) return 1

		// Starts with
		const aStarts = aLower.startsWith(lowerQuery)
		const bStarts = bLower.startsWith(lowerQuery)
		if (aStarts && !bStarts) return -1
		if (bStarts && !aStarts) return 1

		// Alphabetical
		return aLower.localeCompare(bLower)
	})

	return results.slice(0, limit)
}

function searchInObject(
	obj: Record<string, unknown>,
	path: string[],
	query: string,
	results: SearchResult[],
	limit: number
): void {
	for (const [key, value] of Object.entries(obj)) {
		if (results.length >= limit) return
		if (typeof value !== 'object' || value === null) continue

		const item = value as Record<string, unknown>
		const name = item.name as string | undefined
		const type = item.type as string | undefined
		const id = item._id as string | undefined

		// Check if this item matches
		if (name && type && id) {
			const lowerName = name.toLowerCase()
			if (lowerName.includes(query)) {
				results.push({
					id,
					name,
					type,
					path: [...path, key],
					item
				})
			}
		}

		// Recurse into contents
		const contents = item.contents as Record<string, unknown> | undefined
		if (contents) {
			searchInObject(contents, [...path, key], query, results, limit)
		}

		// Recurse into collections
		const collections = item.collections as Record<string, unknown> | undefined
		if (collections) {
			searchInObject(collections, [...path, key], query, results, limit)
		}
	}
}
