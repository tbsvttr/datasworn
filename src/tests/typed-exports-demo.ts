/**
 * This file demonstrates how consumers like Ironvault can use
 * the typed exports without needing `as unknown as` type assertions.
 *
 * Before this change, consumers had to do:
 *   import delveJson from '@datasworn/ironsworn-classic-delve/json/delve.json'
 *   const delve = delveJson as unknown as Datasworn.Expansion // Type assertion required!
 *
 * After this change, they can simply:
 *   import { delve } from '@datasworn/ironsworn-classic-delve'
 *   // delve is already typed as Datasworn.Expansion - no assertion needed!
 */

import type { Datasworn } from '../pkg-core/index.js'

// Import the typed exports - these come pre-typed from the packages
import { classic } from '../../pkg/nodejs/@datasworn/ironsworn-classic/index.js'
import { delve } from '../../pkg/nodejs/@datasworn/ironsworn-classic-delve/index.js'
import { lodestar } from '../../pkg/nodejs/@datasworn/ironsworn-classic-lodestar/index.js'
import { starforged } from '../../pkg/nodejs/@datasworn/starforged/index.js'
import { sundered_isles } from '../../pkg/nodejs/@datasworn/sundered-isles/index.js'
import { ancient_wonders } from '../../pkg/nodejs/@datasworn-community-content/ancient-wonders/index.js'
import { fe_runners } from '../../pkg/nodejs/@datasworn-community-content/fe-runners/index.js'
import { starsmith } from '../../pkg/nodejs/@datasworn-community-content/starsmith/index.js'

// Import ID constants for type-safe ID references
import {
	MoveIds,
	OracleIds,
	AssetIds
} from '../../pkg/nodejs/@datasworn/starforged/ids.js'

// Type-safe usage - no assertions needed!
// TypeScript knows the exact types from the .d.ts files

// Rulesets
const classicRuleset: Datasworn.Ruleset = classic
const starforgedRuleset: Datasworn.Ruleset = starforged

// Expansions
const delveExpansion: Datasworn.Expansion = delve
const lodestarExpansion: Datasworn.Expansion = lodestar
const sunderedIslesExpansion: Datasworn.Expansion = sundered_isles
const ancientWondersExpansion: Datasworn.Expansion = ancient_wonders
const feRunnersExpansion: Datasworn.Expansion = fe_runners
const starsmithExpansion: Datasworn.Expansion = starsmith

// Example: Ironvault-style datastore that accepts typed data
type DatastoreEntry = [Datasworn.Ruleset | Datasworn.Expansion, number]

// This is similar to what Ironvault does - building an array of sources
// Previously this required `as unknown as` casts, now it works directly!
const BUILTIN_SOURCES: DatastoreEntry[] = [
	[classicRuleset, 0],
	[delveExpansion, 1],
	[lodestarExpansion, 1],
	[starforgedRuleset, 0],
	[sunderedIslesExpansion, 1],
	[ancientWondersExpansion, 2],
	[feRunnersExpansion, 2],
	[starsmithExpansion, 2],
]

// Access type-specific properties safely
console.log('Rulesets:')
console.log(`- ${classic._id}: ${classic.title}`)
console.log(`- ${starforged._id}: ${starforged.title}`)

console.log('\nExpansions:')
console.log(`- ${delve._id}: ${delve.title} (ruleset: ${delve.ruleset})`)
console.log(`- ${lodestar._id}: ${lodestar.title} (ruleset: ${lodestar.ruleset})`)
console.log(`- ${sundered_isles._id}: ${sundered_isles.title} (ruleset: ${sundered_isles.ruleset})`)
console.log(`- ${ancient_wonders._id}: ${ancient_wonders.title} (ruleset: ${ancient_wonders.ruleset})`)
console.log(`- ${fe_runners._id}: ${fe_runners.title} (ruleset: ${fe_runners.ruleset})`)
console.log(`- ${starsmith._id}: ${starsmith.title} (ruleset: ${starsmith.ruleset})`)

console.log(`\nTotal sources: ${BUILTIN_SOURCES.length}`)

// Demonstrate ID constants usage
// These provide full auto-complete in IDE and literal string types
console.log('\n--- ID Constants Demo ---')

// MoveIds give you fully typed ID strings
const faceDangerId = MoveIds.adventure.face_danger
// Type: "move:starforged/adventure/face_danger" (literal type!)
console.log(`Face Danger ID: ${faceDangerId}`)

// OracleIds work with nested structures
const actionOracleId = OracleIds.core.action
const givenNameOracleId = OracleIds.character.name.given_name
console.log(`Action Oracle ID: ${actionOracleId}`)
console.log(`Given Name Oracle ID: ${givenNameOracleId}`)

// AssetIds for companions, paths, etc.
const bansheeId = AssetIds.companion.banshee
const starshipId = AssetIds.command_vehicle.starship
console.log(`Banshee Asset ID: ${bansheeId}`)
console.log(`Starship Asset ID: ${starshipId}`)

// The types are literal strings, so this works with IdParser.get()
// and any function that expects specific ID types
type StarforgedMoveId = typeof MoveIds[keyof typeof MoveIds][keyof typeof MoveIds[keyof typeof MoveIds]]
// This creates a union type of all move IDs

export { BUILTIN_SOURCES, MoveIds, OracleIds, AssetIds }
