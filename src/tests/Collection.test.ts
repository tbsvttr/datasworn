import { describe, expect, test } from 'bun:test'

import { validate } from '../pkg-core/Validators/Collection.js'

// Build minimal collection-shaped objects matching what the validator accesses:
// obj.contents (Record<string, child>) and obj.collections (Record<string, subcollection>)

function makeCollection(opts: {
	contents?: Record<string, unknown>
	collections?: Record<string, unknown>
}) {
	return {
		type: 'oracle_collection',
		contents: opts.contents ?? {},
		collections: opts.collections ?? {}
	} as any
}

describe('Collection.validate', () => {
	test('empty collection returns true', () => {
		const passThrough = () => true
		expect(validate(makeCollection({}), passThrough, passThrough)).toBe(true)
	})

	test('calls collectableValidator for each item in contents', () => {
		const validated: unknown[] = []
		const col = makeCollection({
			contents: { a: { name: 'A' }, b: { name: 'B' } }
		})
		validate(
			col,
			() => true,
			(child: any) => {
				validated.push(child.name)
				return true
			}
		)
		expect(validated).toContain('A')
		expect(validated).toContain('B')
		expect(validated.length).toBe(2)
	})

	test('recurses into nested collections', () => {
		const collectionNames: string[] = []
		const col = makeCollection({
			collections: {
				sub: makeCollection({
					contents: { x: { name: 'X' } }
				})
			}
		})
		validate(
			col,
			(c: any) => {
				if (c.type) collectionNames.push(c.type)
				return true
			},
			() => true
		)
		// collectionValidator called for root + subcollection
		expect(collectionNames.length).toBe(2)
	})

	test('deeply nested collections recurse fully', () => {
		const leafNames: string[] = []
		const col = makeCollection({
			collections: {
				level1: makeCollection({
					collections: {
						level2: makeCollection({
							contents: { leaf: { name: 'Leaf' } }
						})
					}
				})
			}
		})
		validate(
			col,
			() => true,
			(child: any) => {
				leafNames.push(child.name)
				return true
			}
		)
		expect(leafNames).toContain('Leaf')
	})
})
