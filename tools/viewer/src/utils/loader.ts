import type { Datasworn } from '@datasworn/core'

// Re-export for convenience
export type RulesPackage = Datasworn.RulesPackage

const RULESETS = [
	'classic',
	'delve',
	'starforged',
	'sundered_isles',
	'starsmith',
	'fe_runners',
	'ancient_wonders'
]

export async function loadRuleset(id: string): Promise<Datasworn.RulesPackage> {
	const response = await fetch(`/datasworn/${id}/${id}.json`)
	if (!response.ok) {
		throw new Error(`Failed to load ruleset: ${id}`)
	}
	return response.json()
}

export async function loadAllRulesets(): Promise<Map<string, Datasworn.RulesPackage>> {
	const results = new Map<string, Datasworn.RulesPackage>()

	const promises = RULESETS.map(async (id) => {
		try {
			const data = await loadRuleset(id)
			results.set(id, data)
		} catch (e) {
			console.warn(`Could not load ruleset: ${id}`, e)
		}
	})

	await Promise.all(promises)
	return results
}

export function getRulesetDisplayName(pkg: Datasworn.RulesPackage): string {
	return pkg.title
}
