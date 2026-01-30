#!/usr/bin/env bun
/**
 * Add datasworn: links to >Oracle references in Ancient Wonders oracles.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

// Mapping of display names to oracle collection IDs
const PLANET_LINKS: Record<string, string> = {
	'Anomalous World':
		'oracle_collection:ancient_wonders/planets_expanded/anomalous_world',
	'Chemical World':
		'oracle_collection:ancient_wonders/planets_expanded/chemical_world',
	'Crystalline World':
		'oracle_collection:ancient_wonders/planets_expanded/crystalline_world',
	'Desert World':
		'oracle_collection:ancient_wonders/planets_expanded/desert_world',
	'Furnace World':
		'oracle_collection:ancient_wonders/planets_expanded/furnace_world',
	'Grave World':
		'oracle_collection:ancient_wonders/planets_expanded/grave_world',
	'Ice World': 'oracle_collection:ancient_wonders/planets_expanded/ice_world',
	'Jovian World':
		'oracle_collection:ancient_wonders/planets_expanded/jovian_world',
	'Jungle World':
		'oracle_collection:ancient_wonders/planets_expanded/jungle_world',
	'Karst World':
		'oracle_collection:ancient_wonders/planets_expanded/karst_world',
	'Kintsugi World':
		'oracle_collection:ancient_wonders/planets_expanded/kintsugi_world',
	'Living World':
		'oracle_collection:ancient_wonders/planets_expanded/living_world',
	'Metallic World':
		'oracle_collection:ancient_wonders/planets_expanded/metallic_world',
	'Ocean World':
		'oracle_collection:ancient_wonders/planets_expanded/ocean_world',
	'Quarry World':
		'oracle_collection:ancient_wonders/planets_expanded/quarry_world',
	'Rocky World':
		'oracle_collection:ancient_wonders/planets_expanded/rocky_world',
	'Shattered World':
		'oracle_collection:ancient_wonders/planets_expanded/shattered_world',
	'Tainted World':
		'oracle_collection:ancient_wonders/planets_expanded/tainted_world',
	'Tidally Locked World':
		'oracle_collection:ancient_wonders/planets_expanded/tidally_locked_world',
	'Vital World':
		'oracle_collection:ancient_wonders/planets_expanded/vital_world'
}

// Additional megastructure/location links
const _OTHER_LINKS: Record<string, string> = {
	Ecumenopolis: 'oracle_collection:ancient_wonders/other', // sub-collection for ecumenopolis
	Discworld: 'oracle_collection:ancient_wonders/alien_megastructures',
	'Bishop Ring': 'oracle_collection:ancient_wonders/alien_megastructures',
	Megacity: 'oracle_collection:ancient_wonders/alien_megacities'
	// Add more as needed
}

const oraclesPath = join(
	import.meta.dir,
	'..',
	'source_data',
	'ancient_wonders',
	'oracles.yaml'
)

console.log('Reading:', oraclesPath)
let content = readFileSync(oraclesPath, 'utf8')

let replacements = 0

// Replace planet world references: >Desert World; pg 50 -> [Desert World](datasworn:...) (pg 50)
for (const [name, id] of Object.entries(PLANET_LINKS)) {
	// Match: >Name; pg X or >Name pg X (with optional semicolon)
	const pattern = new RegExp(
		`>\\s*${name.replace(/\s+/g, '\\s+')}[;,]?\\s*pg\\s*(\\d+)`,
		'gi'
	)
	content = content.replace(pattern, (_match, page) => {
		replacements++
		return `[${name}](datasworn:${id}) (pg ${page})`
	})

	// Also match >Name" (trailing quote from broken parsing) - preserve the quote
	const quotePattern = new RegExp(`>\\s*${name.replace(/\s+/g, '\\s+')}"`, 'gi')
	content = content.replace(quotePattern, (_match) => {
		replacements++
		return `[${name}](datasworn:${id})"`
	})
}

// Replace biome sub-references: >Badlands (Desert World); pg 50
// These reference biomes within planet types
const biomePattern =
	/>([A-Z][a-z]+(?:\s+[a-z]+)?)\s*\(([^)]+)\)[;,]?\s*pg\s*(\d+)/g
content = content.replace(biomePattern, (match, biome, planetType, page) => {
	const planetId = PLANET_LINKS[planetType]
	if (planetId) {
		replacements++
		return `${biome} ([${planetType}](datasworn:${planetId})) (pg ${page})`
	}
	return match
})

writeFileSync(oraclesPath, content)

console.log(`\nMade ${replacements} replacements`)
console.log(`Written to: ${oraclesPath}`)
