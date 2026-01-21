import { expect, test, describe } from 'bun:test'

import { IdParser } from '../pkg-core/IdParser.js'
import { loadDatasworn } from './loadJson.js'

const { tree, index } = await loadDatasworn()

IdParser.tree = tree

const cases = Array.from(index.keys()).map((id) => [id, IdParser.get(id)._id])

describe('IdParser lookup', () => {
	test.each(cases)('%p', (id, lookupId) => expect(id).toBe(lookupId))
})

describe('Condition ID parsing', () => {
	// Get all condition IDs from the index
	const conditionIds = Array.from(index.keys()).filter((id) =>
		id.includes('.condition:')
	)

	test('condition IDs exist in the data', () => {
		expect(conditionIds.length).toBeGreaterThan(0)
	})

	test('move condition IDs have correct format', () => {
		const moveConditionIds = conditionIds.filter((id) =>
			id.startsWith('move.condition:')
		)
		expect(moveConditionIds.length).toBeGreaterThan(0)

		for (const id of moveConditionIds) {
			// Format: move.condition:package/path/move_key.index
			expect(id).toMatch(/^move\.condition:[a-z_]+\/[a-z_/]+\.\d+$/)
		}
	})

	test('embedded move condition IDs have correct format', () => {
		const embeddedConditionIds = conditionIds.filter((id) =>
			id.includes('ability.move.condition:')
		)

		// These exist in asset abilities that define custom moves
		if (embeddedConditionIds.length > 0) {
			for (const id of embeddedConditionIds) {
				// Format: asset.ability.move.condition:package/path/asset_key.ability_index.move_key.condition_index
				expect(id).toMatch(
					/^asset\.ability\.move\.condition:[a-z_]+\/[a-z_/]+\.\d+\.[a-z_]+\.\d+$/
				)
			}
		}
	})

	test('condition IDs resolve to objects with _id property', () => {
		for (const id of conditionIds.slice(0, 10)) {
			// Test first 10 for speed
			const parsed = IdParser.get(id)
			expect(parsed._id).toBe(id)
		}
	})

	test('condition objects have expected properties', () => {
		const sampleId = conditionIds[0]
		if (sampleId) {
			const condition = IdParser.get(sampleId)
			expect(condition).toHaveProperty('_id')
			expect(condition).toHaveProperty('method')
			expect(condition).toHaveProperty('roll_options')
		}
	})
})
