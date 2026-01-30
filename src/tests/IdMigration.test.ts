import { describe, expect, test } from 'bun:test'
import { readdir } from 'node:fs/promises'
import { ROOT_HISTORY, VERSION } from '../scripts/const.js'
import { loadDatasworn, loadIdMap } from './loadJson.js'

const versions = (await readdir(ROOT_HISTORY))
	.sort(Bun.semver.order)
	.filter((ver) => !/-[0-9]+$/.test(ver))

const previousVersion = versions.at(-2) as string
const currentVersion = versions.at(-1) as string

test(`History exists for current version (${VERSION})`, () =>
	expect(currentVersion).toBe(VERSION))

const [
	{ tree: _previousTree, index: previousIndex },
	{ tree: _currentTree, index: currentIndex },
	idMap
] = await Promise.all([
	loadDatasworn(previousVersion),
	loadDatasworn(currentVersion),
	loadIdMap(currentVersion)
])

const changedIds: [string, string | null | undefined][] = []

for (const oldId of previousIndex.keys()) {
	if (currentIndex.has(oldId)) continue
	changedIds.push([oldId, idMap[oldId]])
}

describe('Changed ID has migration', () => {
	test.each(changedIds)('%p => %p', (_oldId, mapping) => {
		expect(mapping).not.toBeUndefined()
	})
})
