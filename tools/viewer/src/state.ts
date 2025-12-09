import type { Datasworn } from '@datasworn/core'
import type { RulesPackage } from './utils/loader'

// Re-export Datasworn namespace for use in other files
export type { Datasworn }

export interface AppState {
	rulesets: Map<string, RulesPackage>
	currentRuleset: string | null
	selectedPath: string[] | null
	selectedItem: unknown | null
	loading: boolean
}

type Listener = (state: AppState) => void

class StateManager {
	private state: AppState = {
		rulesets: new Map(),
		currentRuleset: null,
		selectedPath: null,
		selectedItem: null,
		loading: true
	}

	private listeners: Set<Listener> = new Set()

	getState(): AppState {
		return this.state
	}

	setState(partial: Partial<AppState>): void {
		this.state = { ...this.state, ...partial }
		this.notify()
	}

	subscribe(listener: Listener): () => void {
		this.listeners.add(listener)
		return () => this.listeners.delete(listener)
	}

	private notify(): void {
		for (const listener of this.listeners) {
			listener(this.state)
		}
	}

	// Convenience methods
	setRulesets(rulesets: Map<string, RulesPackage>): void {
		const firstRuleset = rulesets.keys().next().value ?? null
		this.setState({
			rulesets,
			currentRuleset: firstRuleset,
			loading: false
		})
	}

	selectRuleset(id: string): void {
		this.setState({
			currentRuleset: id,
			selectedPath: null,
			selectedItem: null
		})
	}

	selectItem(path: string[], item: unknown, updateUrl = true): void {
		this.setState({
			selectedPath: path,
			selectedItem: item
		})

		// Update URL hash for browser history
		if (updateUrl) {
			const obj = item as Record<string, unknown> | null
			const itemId = obj?._id as string | undefined
			if (itemId) {
				history.pushState({ itemId }, '', `#${itemId}`)
			}
		}
	}

	getCurrentRuleset(): RulesPackage | null {
		const { rulesets, currentRuleset } = this.state
		if (!currentRuleset) return null
		return rulesets.get(currentRuleset) ?? null
	}

	// Navigate to an item by its Datasworn ID (e.g., "move:classic/suffer/endure_harm")
	navigateToId(id: string, updateUrl = true): boolean {
		// Parse the ID format: "type:ruleset/category/.../item"
		const colonIdx = id.indexOf(':')
		if (colonIdx === -1) return false

		const type = id.slice(0, colonIdx) // e.g., "move", "oracle", "asset"
		const pathPart = id.slice(colonIdx + 1) // e.g., "classic/suffer/endure_harm"
		const pathSegments = pathPart.split('/')

		if (pathSegments.length < 2) return false

		const rulesetId = pathSegments[0]
		const itemPath = pathSegments.slice(1)

		// Try to find in current ruleset first, then try the specified ruleset
		let ruleset = this.getCurrentRuleset()

		// If the ID specifies a different ruleset, try to switch to it
		if (rulesetId && this.state.rulesets.has(rulesetId) && this.state.currentRuleset !== rulesetId) {
			this.selectRuleset(rulesetId)
			ruleset = this.state.rulesets.get(rulesetId) ?? null
		}

		if (!ruleset) return false

		// Map type to the category key in the ruleset
		const categoryMap: Record<string, string> = {
			move: 'moves',
			move_category: 'moves',
			asset: 'assets',
			asset_collection: 'assets',
			oracle: 'oracles',
			oracle_rollable: 'oracles',
			oracle_collection: 'oracles',
			npc: 'npcs',
			npc_collection: 'npcs',
			truth: 'truths',
			atlas_entry: 'atlas',
			atlas_collection: 'atlas'
		}

		const categoryKey = categoryMap[type] || type.replace(/_collection$/, '') + 's'
		const category = (ruleset as unknown as Record<string, unknown>)[categoryKey] as Record<string, unknown> | undefined
		if (!category) return false

		// Find the item by traversing the path
		const result = this.findItemByPath(category, itemPath, [categoryKey])
		if (result) {
			// Update URL if requested
			if (updateUrl) {
				history.pushState({ itemId: id }, '', `#${id}`)
			}
			this.setState({
				selectedPath: result.path,
				selectedItem: result.item
			})
			// Dispatch event for tree to expand path
			window.dispatchEvent(new CustomEvent('datasworn-navigate', { detail: { path: result.path } }))
			return true
		}

		return false
	}

	private findItemByPath(
		obj: Record<string, unknown>,
		pathSegments: string[],
		currentPath: string[]
	): { item: unknown; path: string[] } | null {
		// Try to find item directly by key matching path segments
		for (const [key, value] of Object.entries(obj)) {
			if (typeof value !== 'object' || value === null) continue

			const item = value as Record<string, unknown>
			const itemId = item._id as string | undefined

			// Check if this item's ID ends with our target path
			if (itemId) {
				const idPath = itemId.split(':')[1]?.split('/').slice(1).join('/') || ''
				if (idPath === pathSegments.join('/')) {
					return { item: value, path: [...currentPath, key] }
				}
			}

			// Check contents
			const contents = item.contents as Record<string, unknown> | undefined
			if (contents) {
				const result = this.findItemByPath(contents, pathSegments, [...currentPath, key])
				if (result) return result
			}

			// Check collections
			const collections = item.collections as Record<string, unknown> | undefined
			if (collections) {
				const result = this.findItemByPath(collections, pathSegments, [...currentPath, key])
				if (result) return result
			}
		}

		return null
	}
}

export const state = new StateManager()
