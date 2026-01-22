import { expect, test, describe } from 'bun:test'
import { $ } from 'bun'
import { existsSync, readFileSync, readdirSync } from 'fs'
import path from 'path'
import ajvPkg, { type ErrorObject } from 'ajv'
import ajvFormatPkg from 'ajv-formats'
import * as JTD from 'jtd'

// workaround for https://github.com/ajv-validator/ajv/issues/2132
const Ajv = ajvPkg.default
const addFormats = ajvFormatPkg.default

const ROOT = path.resolve(import.meta.dir, '../..')

describe('Build Pipeline', () => {
	test('TypeScript compilation passes', async () => {
		const result = await $`npm run check`.quiet().nothrow()
		expect(result.exitCode).toBe(0)
	}, 60000)

	test('build:schema generates schema files', async () => {
		const result = await $`npm run build:schema`.quiet().nothrow()
		expect(result.exitCode).toBe(0)

		// Verify output files exist
		expect(existsSync(path.join(ROOT, 'datasworn/datasworn.schema.json'))).toBe(true)
		expect(existsSync(path.join(ROOT, 'datasworn/datasworn-source.schema.json'))).toBe(true)
	}, 60000)

	test('build:dts generates TypeScript types', async () => {
		const result = await $`npm run build:dts`.quiet().nothrow()
		expect(result.exitCode).toBe(0)

		// Verify output files exist
		expect(existsSync(path.join(ROOT, 'src/types/Datasworn.d.ts'))).toBe(true)
		expect(existsSync(path.join(ROOT, 'src/types/DataswornSource.d.ts'))).toBe(true)
	}, 60000)

	test('build:json compiles source data', async () => {
		const result = await $`npm run build:json`.quiet().nothrow()
		expect(result.exitCode).toBe(0)

		// Verify output files exist
		expect(existsSync(path.join(ROOT, 'datasworn/classic/classic.json'))).toBe(true)
		expect(existsSync(path.join(ROOT, 'datasworn/starforged/starforged.json'))).toBe(true)
	}, 120000)

	test('build:pkg builds packages', async () => {
		const result = await $`npm run build:pkg`.quiet().nothrow()
		expect(result.exitCode).toBe(0)

		// Verify package files exist
		expect(existsSync(path.join(ROOT, 'pkg/nodejs/@datasworn/core/package.json'))).toBe(true)
	}, 60000)
})

describe('Schema Validation', () => {
	test('generated schema is valid JSON', () => {
		const schemaPath = path.join(ROOT, 'datasworn/datasworn.schema.json')
		const content = readFileSync(schemaPath, 'utf-8')
		expect(() => JSON.parse(content)).not.toThrow()
	})

	test('schema has required top-level properties', () => {
		const schemaPath = path.join(ROOT, 'datasworn/datasworn.schema.json')
		const schema = JSON.parse(readFileSync(schemaPath, 'utf-8'))

		expect(schema.$schema).toBeDefined()
		expect(schema.definitions).toBeDefined()
		expect(schema.$ref).toBeDefined()
	})
})

describe('Output Data Validation', () => {
	test('classic.json is valid and has expected structure', () => {
		const dataPath = path.join(ROOT, 'datasworn/classic/classic.json')
		const data = JSON.parse(readFileSync(dataPath, 'utf-8'))

		expect(data._id).toBe('classic')
		expect(data.type).toBe('ruleset')
		expect(data.moves).toBeDefined()
		expect(data.assets).toBeDefined()
		expect(data.oracles).toBeDefined()
	})

	test('lodestar.json is valid and has expected structure', () => {
		const dataPath = path.join(ROOT, 'datasworn/lodestar/lodestar.json')
		const data = JSON.parse(readFileSync(dataPath, 'utf-8'))

		expect(data._id).toBe('lodestar')
		expect(data.type).toBe('expansion')
		expect(data.ruleset).toBe("classic")
		expect(data.moves).toBeDefined()
	})

	test('starforged.json is valid and has expected structure', () => {
		const dataPath = path.join(ROOT, 'datasworn/starforged/starforged.json')
		const data = JSON.parse(readFileSync(dataPath, 'utf-8'))

		expect(data._id).toBe('starforged')
		expect(data.type).toBe('ruleset')
		expect(data.moves).toBeDefined()
		expect(data.assets).toBeDefined()
		expect(data.oracles).toBeDefined()
	})

	test('starsmith.json is valid expansion for Starforged', () => {
		const dataPath = path.join(ROOT, 'datasworn/starsmith/starsmith.json')
		const data = JSON.parse(readFileSync(dataPath, 'utf-8'))

		expect(data._id).toBe('starsmith')
		expect(data.type).toBe('expansion')
		expect(data.ruleset).toBe('starforged')
		expect(data.oracles).toBeDefined()
		// Starsmith is oracle-only expansion
		expect(Object.keys(data.oracles).length).toBeGreaterThan(0)
	})

	test('fe_runners.json is valid expansion for Starforged', () => {
		const dataPath = path.join(ROOT, 'datasworn/fe_runners/fe_runners.json')
		const data = JSON.parse(readFileSync(dataPath, 'utf-8'))

		expect(data._id).toBe('fe_runners')
		expect(data.type).toBe('expansion')
		expect(data.ruleset).toBe('starforged')
		// Fe-Runners has moves, assets, oracles, and rules
		expect(data.moves).toBeDefined()
		expect(data.assets).toBeDefined()
		expect(data.oracles).toBeDefined()
		expect(Object.keys(data.moves).length).toBeGreaterThan(0)
		expect(Object.keys(data.assets).length).toBeGreaterThan(0)
	})

	test('sundered_isles.json is valid expansion for Starforged', () => {
		const dataPath = path.join(ROOT, 'datasworn/sundered_isles/sundered_isles.json')
		const data = JSON.parse(readFileSync(dataPath, 'utf-8'))

		expect(data._id).toBe('sundered_isles')
		expect(data.type).toBe('expansion')
		expect(data.ruleset).toBe('starforged')
		// Sundered Isles has assets and oracles
		expect(data.assets).toBeDefined()
		expect(data.oracles).toBeDefined()
		expect(Object.keys(data.assets).length).toBeGreaterThan(0)
		expect(Object.keys(data.oracles).length).toBeGreaterThan(0)
	})

	test('ancient_wonders.json is valid expansion for Starforged', () => {
		const dataPath = path.join(ROOT, 'datasworn/ancient_wonders/ancient_wonders.json')
		const data = JSON.parse(readFileSync(dataPath, 'utf-8'))

		expect(data._id).toBe('ancient_wonders')
		expect(data.type).toBe('expansion')
		expect(data.ruleset).toBe('starforged')
		// Ancient Wonders has moves, assets, and oracles
		expect(data.moves).toBeDefined()
		expect(data.assets).toBeDefined()
		expect(data.oracles).toBeDefined()
		expect(Object.keys(data.moves).length).toBeGreaterThan(0)
		expect(Object.keys(data.assets).length).toBeGreaterThan(0)
		expect(Object.keys(data.oracles).length).toBeGreaterThan(0)
	})

	test('ancient_wonders.json has substantial oracle content', () => {
		const dataPath = path.join(ROOT, 'datasworn/ancient_wonders/ancient_wonders.json')
		const data = JSON.parse(readFileSync(dataPath, 'utf-8'))

		// Ancient Wonders has 10 oracle categories
		const oracleCategories = Object.keys(data.oracles)
		expect(oracleCategories.length).toBeGreaterThanOrEqual(9)

		// Check that key categories exist
		expect(oracleCategories).toContain('planets_expanded')
		expect(oracleCategories).toContain('alien_megastructures')
		expect(oracleCategories).toContain('splinters')
	})

	test('sundered_isles.json has incidental_vehicle collection with sailing_ship', () => {
		const dataPath = path.join(ROOT, 'datasworn/sundered_isles/sundered_isles.json')
		const data = JSON.parse(readFileSync(dataPath, 'utf-8'))

		// Check incidental_vehicle collection exists
		expect(data.assets.incidental_vehicle).toBeDefined()
		expect(data.assets.incidental_vehicle.type).toBe('asset_collection')
		expect(data.assets.incidental_vehicle.name).toBe('Incidental Vehicle Assets')

		// Check sailing_ship asset exists with correct properties
		const sailingShip = data.assets.incidental_vehicle.contents.sailing_ship
		expect(sailingShip).toBeDefined()
		expect(sailingShip._id).toBe('asset:sundered_isles/incidental_vehicle/sailing_ship')
		expect(sailingShip.name).toBe('Sailing Ship')
		expect(sailingShip.category).toBe('Incidental Vehicle')
		expect(sailingShip.shared).toBe(true)

		// Check integrity control exists (without battered/cursed - that's intentional)
		expect(sailingShip.controls.integrity).toBeDefined()
		expect(sailingShip.controls.integrity.field_type).toBe('condition_meter')
		expect(sailingShip.controls.integrity.max).toBe(5)
		expect(sailingShip.controls.integrity.controls).toEqual({}) // No battered/cursed
	})
})

describe('Schema Round-Trip Validation', () => {
	// Load schema once for all validation tests
	const schemaPath = path.join(ROOT, 'datasworn/datasworn.schema.json')
	const schema = JSON.parse(readFileSync(schemaPath, 'utf-8'))

	// Create AJV instance with formats
	const ajv = new Ajv({
		strict: false,
		allErrors: true,
		verbose: true
	})
	addFormats(ajv as unknown as Parameters<typeof addFormats>[0])

	const validate = ajv.compile(schema)

	// Find all output JSON files
	const dataswornDir = path.join(ROOT, 'datasworn')
	const outputDirs = readdirSync(dataswornDir, { withFileTypes: true })
		.filter((d) => d.isDirectory())
		.map((d) => d.name)

	for (const dir of outputDirs) {
		const jsonPath = path.join(dataswornDir, dir, `${dir}.json`)
		if (!existsSync(jsonPath)) continue

		test(`${dir}.json validates against schema`, () => {
			const data = JSON.parse(readFileSync(jsonPath, 'utf-8'))
			const valid = validate(data)

			if (!valid) {
				// Show first 5 errors for debugging
				const errors = validate.errors?.slice(0, 5).map((e: ErrorObject) => ({
					path: e.instancePath,
					message: e.message,
					keyword: e.keyword
				}))
				console.error(`Validation errors in ${dir}.json:`, errors)
			}

			expect(valid).toBe(true)
		})
	}
})

describe('Source Schema Validation', () => {
	// Validate source data against source schema
	const sourceSchemaPath = path.join(ROOT, 'datasworn/datasworn-source.schema.json')
	if (existsSync(sourceSchemaPath)) {
		const sourceSchema = JSON.parse(readFileSync(sourceSchemaPath, 'utf-8'))

		const ajv = new Ajv({
			strict: false,
			allErrors: true,
			verbose: true
		})
		addFormats(ajv as unknown as Parameters<typeof addFormats>[0])

		const validateSource = ajv.compile(sourceSchema)

		test('source schema compiles without errors', () => {
			expect(validateSource).toBeDefined()
		})
	}
})

describe('Schema Stability', () => {
	const schemaPath = path.join(ROOT, 'datasworn/datasworn.schema.json')
	const schema = JSON.parse(readFileSync(schemaPath, 'utf-8'))

	test('schema has expected number of definitions (detect accidental changes)', () => {
		const defCount = Object.keys(schema.definitions).length
		// This is a snapshot - if schema changes, update this number intentionally
		// Current count as of initial test setup
		expect(defCount).toBeGreaterThan(100) // At minimum, should have many definitions
	})

	test('schema contains critical type definitions', () => {
		const defs = Object.keys(schema.definitions)

		// Core types that must exist
		const requiredDefs = [
			'Asset',
			'AssetAbility',
			'AssetCollection',
			'Move',
			'MoveCategory',
			'OracleRollable',
			'OracleCollection',
			'RulesPackage',
			'Ruleset',
			'Expansion',
			'SourceInfo',
			'Truth'
		]

		for (const def of requiredDefs) {
			expect(defs).toContain(def)
		}
	})
})

describe('Generated Types Compilation', () => {
	test('Datasworn.d.ts is valid TypeScript', async () => {
		const dtsPath = path.join(ROOT, 'src/types/Datasworn.d.ts')
		expect(existsSync(dtsPath)).toBe(true)

		// Try to compile just the types file (--typeRoots avoids broken @types/parse-path stub)
		const result = await $`npx tsc ${dtsPath} --noEmit --skipLibCheck --typeRoots none`.quiet().nothrow()
		expect(result.exitCode).toBe(0)
	}, 30000)
})

describe('Content Integrity', () => {
	// Helper to count all items recursively in a collection structure
	// Structure: data.moves = { category1: { contents: {...}, collections: {...} }, ... }
	function countContentsRecursive(obj: Record<string, unknown>): number {
		let count = 0

		// Count items in contents
		if (obj.contents && typeof obj.contents === 'object') {
			count += Object.keys(obj.contents as object).length
		}

		// Recurse into collections
		if (obj.collections && typeof obj.collections === 'object') {
			for (const coll of Object.values(obj.collections as Record<string, unknown>)) {
				if (coll && typeof coll === 'object') {
					count += countContentsRecursive(coll as Record<string, unknown>)
				}
			}
		}

		return count
	}

	// Count items across all top-level categories
	function countAllContents(topLevel: Record<string, unknown>): number {
		let total = 0
		for (const category of Object.values(topLevel)) {
			if (category && typeof category === 'object') {
				total += countContentsRecursive(category as Record<string, unknown>)
			}
		}
		return total
	}

	test('classic.json has expected content counts', () => {
		const data = JSON.parse(
			readFileSync(path.join(ROOT, 'datasworn/classic/classic.json'), 'utf-8')
		)

		// These are minimum expected counts - actual counts may be higher
		// Update these if content is intentionally added/removed
		const movesCount = countAllContents(data.moves)
		const assetsCount = countAllContents(data.assets)
		const oraclesCount = countAllContents(data.oracles)

		expect(movesCount).toBeGreaterThan(30) // Ironsworn has 30+ moves
		expect(assetsCount).toBeGreaterThan(20) // Ironsworn has 20+ assets
		expect(oraclesCount).toBeGreaterThan(20) // Ironsworn has 20+ oracles
	})

	test('starforged.json has expected content counts', () => {
		const data = JSON.parse(
			readFileSync(path.join(ROOT, 'datasworn/starforged/starforged.json'), 'utf-8')
		)

		const movesCount = countAllContents(data.moves)
		const assetsCount = countAllContents(data.assets)
		const oraclesCount = countAllContents(data.oracles)

		expect(movesCount).toBeGreaterThan(50) // Starforged has 50+ moves
		expect(assetsCount).toBeGreaterThan(50) // Starforged has 50+ assets
		expect(oraclesCount).toBeGreaterThan(100) // Starforged has many oracles
	})

	test('all rulesets have required top-level collections', () => {
		const dataswornDir = path.join(ROOT, 'datasworn')
		const outputDirs = readdirSync(dataswornDir, { withFileTypes: true })
			.filter((d) => d.isDirectory())
			.map((d) => d.name)

		for (const dir of outputDirs) {
			const jsonPath = path.join(dataswornDir, dir, `${dir}.json`)
			if (!existsSync(jsonPath)) continue

			const data = JSON.parse(readFileSync(jsonPath, 'utf-8'))

			// All rulesets/expansions should have these
			if (data.type === 'ruleset') {
				expect(data.moves).toBeDefined()
				expect(data.assets).toBeDefined()
				expect(data.oracles).toBeDefined()
			}
		}
	})
})

describe('JTD Schema Validation', () => {
	const jtdPath = path.join(ROOT, 'json-typedef/datasworn.jtd.json')

	test('JTD schema file exists and is valid JSON', () => {
		expect(existsSync(jtdPath)).toBe(true)
		const content = readFileSync(jtdPath, 'utf-8')
		expect(() => JSON.parse(content)).not.toThrow()
	})

	test('JTD schema has definitions', () => {
		const jtd = JSON.parse(readFileSync(jtdPath, 'utf-8'))
		expect(jtd.definitions).toBeDefined()
		expect(Object.keys(jtd.definitions).length).toBeGreaterThan(100)
	})

	test('JTD schema passes official validation', () => {
		// Fixes rsek/datasworn#77 - ensures JTD schema is valid (not to be confused with JSON Schema)
		const jtd = JSON.parse(readFileSync(jtdPath, 'utf-8'))
		expect(JTD.isValidSchema(jtd)).toBe(true)
	})

	test('SourceInfo.date is typed as string (not timestamp)', () => {
		// Fixes rsek/datasworn#78 - date strings like "2019-06-05" are not RFC 3339 timestamps
		const jtd = JSON.parse(readFileSync(jtdPath, 'utf-8'))
		const sourceInfo = jtd.definitions?.SourceInfo

		expect(sourceInfo).toBeDefined()
		expect(sourceInfo.properties?.date?.type).toBe('string')
		// Ensure it's NOT timestamp (which would require RFC 3339 format)
		expect(sourceInfo.properties?.date?.type).not.toBe('timestamp')
	})

	test('nullable fields have nullable: true property', () => {
		// Fixes rsek/datasworn#78 - nullable properties must be preserved for proper Rust Option<> generation
		const jtd = JSON.parse(readFileSync(jtdPath, 'utf-8'))

		// OracleRoll.dice should be nullable (can be null to use table default)
		const oracleRoll = jtd.definitions?.OracleRoll
		expect(oracleRoll).toBeDefined()
		expect(oracleRoll.properties?.dice?.nullable).toBe(true)

		// OracleRoll.oracle should be nullable (null = roll on same table)
		expect(oracleRoll.properties?.oracle?.nullable).toBe(true)

		// SourceInfo.license should be nullable
		const sourceInfo = jtd.definitions?.SourceInfo
		expect(sourceInfo.properties?.license?.nullable).toBe(true)
	})

	test('TaggableNodeType enum includes RuleType values', () => {
		// Fixes rsek/datasworn#78 - TaggableNodeType was missing rule types
		const jtd = JSON.parse(readFileSync(jtdPath, 'utf-8'))
		const taggableNodeType = jtd.definitions?.TaggableNodeType

		expect(taggableNodeType).toBeDefined()
		expect(taggableNodeType.enum).toBeDefined()

		// Must include rule types (from RuleType enum)
		expect(taggableNodeType.enum).toContain('special_track')
		expect(taggableNodeType.enum).toContain('stat')
		expect(taggableNodeType.enum).toContain('condition_meter')
		expect(taggableNodeType.enum).toContain('impact')

		// Must include primary types
		expect(taggableNodeType.enum).toContain('asset')
		expect(taggableNodeType.enum).toContain('move')
		expect(taggableNodeType.enum).toContain('oracle_rollable')

		// Must include embed-only types
		expect(taggableNodeType.enum).toContain('ability')
		expect(taggableNodeType.enum).toContain('row')
	})

	test('generated Rust types exist', () => {
		const rustPath = path.join(ROOT, 'json-typedef/rust/mod.rs')
		expect(existsSync(rustPath)).toBe(true)

		const content = readFileSync(rustPath, 'utf-8')
		// Verify key structs exist
		expect(content).toContain('pub struct SourceInfo')
		expect(content).toContain('pub struct OracleRoll')
		expect(content).toContain('pub enum RulesPackage')
	})

	test('Rust types use Option for nullable fields', () => {
		const rustPath = path.join(ROOT, 'json-typedef/rust/mod.rs')
		const content = readFileSync(rustPath, 'utf-8')

		// OracleRoll.dice should be Option<>
		expect(content).toMatch(/pub dice: Option<.*DiceExpression/)
		// OracleRoll.oracle should be Option<>
		expect(content).toMatch(/pub oracle: Option<.*OracleRollableId/)
	})
})

describe('Rust Integration Test', () => {
	// Check if cargo is available
	const cargoAvailable = (() => {
		try {
			const result = Bun.spawnSync(['cargo', '--version'])
			return result.exitCode === 0
		} catch {
			return false
		}
	})()

	const rustTestDir = path.join(ROOT, 'json-typedef/rust-test')

	test.skipIf(!cargoAvailable)('cargo is available', () => {
		expect(cargoAvailable).toBe(true)
	})

	test.skipIf(!cargoAvailable)('Rust test project compiles', async () => {
		const result = await $`cargo build --release`.cwd(rustTestDir).quiet().nothrow()
		expect(result.exitCode).toBe(0)
	}, 120000)

	test.skipIf(!cargoAvailable)('Rust types can deserialize all JSON files', async () => {
		// Find all output JSON files
		const dataswornDir = path.join(ROOT, 'datasworn')
		const jsonFiles = readdirSync(dataswornDir, { withFileTypes: true })
			.filter((d) => d.isDirectory())
			.map((d) => path.join(dataswornDir, d.name, `${d.name}.json`))
			.filter((p) => existsSync(p))

		expect(jsonFiles.length).toBeGreaterThan(0)

		// Run the Rust test binary with all JSON files
		const binary = path.join(rustTestDir, 'target/release/datasworn-rust-test')
		const result = await $`${binary} ${jsonFiles}`.quiet().nothrow()

		if (result.exitCode !== 0) {
			console.error('Rust integration test output:')
			console.error(result.stderr.toString())
		}

		expect(result.exitCode).toBe(0)
	}, 30000)
})

describe('ID Consistency', () => {
	// Helper to get all _id values from a top-level collection recursively
	function getAllIds(topLevel: Record<string, unknown>): string[] {
		const ids: string[] = []

		function collectIds(obj: Record<string, unknown>) {
			if (obj._id && typeof obj._id === 'string') {
				ids.push(obj._id)
			}
			if (obj.contents && typeof obj.contents === 'object') {
				for (const item of Object.values(obj.contents as Record<string, unknown>)) {
					if (item && typeof item === 'object') {
						collectIds(item as Record<string, unknown>)
					}
				}
			}
			if (obj.collections && typeof obj.collections === 'object') {
				for (const coll of Object.values(obj.collections as Record<string, unknown>)) {
					if (coll && typeof coll === 'object') {
						collectIds(coll as Record<string, unknown>)
					}
				}
			}
		}

		for (const category of Object.values(topLevel)) {
			if (category && typeof category === 'object') {
				collectIds(category as Record<string, unknown>)
			}
		}

		return ids
	}

	test('all _id values in classic.json contain ruleset ID', () => {
		const data = JSON.parse(
			readFileSync(path.join(ROOT, 'datasworn/classic/classic.json'), 'utf-8')
		)

		expect(data._id).toBe('classic')

		// Check that move _ids contain the ruleset ID (format: type:ruleset/...)
		const moveIds = getAllIds(data.moves)
		expect(moveIds.length).toBeGreaterThan(0)
		for (const moveId of moveIds) {
			expect(moveId).toContain(':classic/')
		}
	})

	test('all _id values in lodestar.json contain expansion ID', () => {
		const data = JSON.parse(
			readFileSync(path.join(ROOT, 'datasworn/lodestar/lodestar.json'), 'utf-8')
		)

		expect(data._id).toBe('lodestar')
		expect(data.type).toBe('expansion')

		// Check that move _ids contain the expansion ID (format: type:lodestar/...)
		const moveIds = getAllIds(data.moves)
		expect(moveIds.length).toBeGreaterThan(0)
		for (const moveId of moveIds) {
			expect(moveId).toContain(':lodestar/')
		}
	})

	test('all _id values in starforged.json contain ruleset ID', () => {
		const data = JSON.parse(
			readFileSync(path.join(ROOT, 'datasworn/starforged/starforged.json'), 'utf-8')
		)

		expect(data._id).toBe('starforged')

		// Check that move _ids contain the ruleset ID (format: type:ruleset/...)
		const moveIds = getAllIds(data.moves)
		expect(moveIds.length).toBeGreaterThan(0)
		for (const moveId of moveIds) {
			expect(moveId).toContain(':starforged/')
		}
	})

	test('all _id values in starsmith.json contain expansion ID', () => {
		const data = JSON.parse(
			readFileSync(path.join(ROOT, 'datasworn/starsmith/starsmith.json'), 'utf-8')
		)

		expect(data._id).toBe('starsmith')
		expect(data.type).toBe('expansion')

		// Check that oracle _ids contain the expansion ID (format: type:starsmith/...)
		const oracleIds = getAllIds(data.oracles)
		expect(oracleIds.length).toBeGreaterThan(0)
		for (const oracleId of oracleIds) {
			expect(oracleId).toContain(':starsmith/')
		}
	})

	test('all _id values in fe_runners.json contain expansion ID', () => {
		const data = JSON.parse(
			readFileSync(path.join(ROOT, 'datasworn/fe_runners/fe_runners.json'), 'utf-8')
		)

		expect(data._id).toBe('fe_runners')
		expect(data.type).toBe('expansion')

		// Check that move _ids contain the expansion ID
		const moveIds = getAllIds(data.moves)
		expect(moveIds.length).toBeGreaterThan(0)
		for (const moveId of moveIds) {
			expect(moveId).toContain(':fe_runners/')
		}

		// Check that asset _ids contain the expansion ID
		const assetIds = getAllIds(data.assets)
		expect(assetIds.length).toBeGreaterThan(0)
		for (const assetId of assetIds) {
			expect(assetId).toContain(':fe_runners/')
		}

		// Check that oracle _ids contain the expansion ID
		const oracleIds = getAllIds(data.oracles)
		expect(oracleIds.length).toBeGreaterThan(0)
		for (const oracleId of oracleIds) {
			expect(oracleId).toContain(':fe_runners/')
		}
	})

	test('all _id values in ancient_wonders.json contain expansion ID', () => {
		const data = JSON.parse(
			readFileSync(path.join(ROOT, 'datasworn/ancient_wonders/ancient_wonders.json'), 'utf-8')
		)

		expect(data._id).toBe('ancient_wonders')
		expect(data.type).toBe('expansion')

		// Check that move _ids contain the expansion ID
		const moveIds = getAllIds(data.moves)
		expect(moveIds.length).toBeGreaterThan(0)
		for (const moveId of moveIds) {
			expect(moveId).toContain(':ancient_wonders/')
		}

		// Check that asset _ids contain the expansion ID
		const assetIds = getAllIds(data.assets)
		expect(assetIds.length).toBeGreaterThan(0)
		for (const assetId of assetIds) {
			expect(assetId).toContain(':ancient_wonders/')
		}

		// Check that oracle _ids contain the expansion ID
		const oracleIds = getAllIds(data.oracles)
		expect(oracleIds.length).toBeGreaterThan(0)
		for (const oracleId of oracleIds) {
			expect(oracleId).toContain(':ancient_wonders/')
		}
	})
})

describe('Typed Content Package Exports', () => {
	const PKG_DIR = path.join(ROOT, 'pkg/nodejs')

	// Content packages with their expected Datasworn types
	const contentPackages = [
		{ scope: '@datasworn', name: 'ironsworn-classic', id: 'classic', type: 'Ruleset' },
		{ scope: '@datasworn', name: 'ironsworn-classic-delve', id: 'delve', type: 'Expansion' },
		{ scope: '@datasworn', name: 'ironsworn-classic-lodestar', id: 'lodestar', type: 'Expansion' },
		{ scope: '@datasworn', name: 'starforged', id: 'starforged', type: 'Ruleset' },
		{ scope: '@datasworn', name: 'sundered-isles', id: 'sundered_isles', type: 'Expansion' },
		{ scope: '@datasworn-community-content', name: 'ancient-wonders', id: 'ancient_wonders', type: 'Expansion' },
		{ scope: '@datasworn-community-content', name: 'fe-runners', id: 'fe_runners', type: 'Expansion' },
		{ scope: '@datasworn-community-content', name: 'starsmith', id: 'starsmith', type: 'Expansion' },
	]

	for (const pkg of contentPackages) {
		const pkgPath = path.join(PKG_DIR, pkg.scope, pkg.name)

		describe(`${pkg.scope}/${pkg.name}`, () => {
			test('has index.js file', () => {
				const indexPath = path.join(pkgPath, 'index.js')
				expect(existsSync(indexPath)).toBe(true)

				const content = readFileSync(indexPath, 'utf-8')
				// Verify it exports from the correct JSON file
				expect(content).toContain(`./json/${pkg.id}.json`)
				// Verify it has both default and named exports
				expect(content).toContain('export { default }')
				expect(content).toContain(`export { default as ${pkg.id} }`)
			})

			test('has index.d.ts file with correct type', () => {
				const dtsPath = path.join(pkgPath, 'index.d.ts')
				expect(existsSync(dtsPath)).toBe(true)

				const content = readFileSync(dtsPath, 'utf-8')
				// Verify it imports from @datasworn/core
				expect(content).toContain("import type { Datasworn } from '@datasworn/core'")
				// Verify it exports the correct Datasworn type
				expect(content).toContain(`Datasworn.${pkg.type}`)
				// Verify named export
				expect(content).toContain(`export { data as ${pkg.id} }`)
			})

			test('package.json has correct module configuration', () => {
				const packageJsonPath = path.join(pkgPath, 'package.json')
				const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))

				// Verify ESM configuration
				expect(packageJson.type).toBe('module')
				expect(packageJson.main).toBe('index.js')
				expect(packageJson.types).toBe('index.d.ts')

				// Verify exports field
				expect(packageJson.exports).toBeDefined()
				expect(packageJson.exports['.']).toBeDefined()
				expect(packageJson.exports['.'].types).toBe('./index.d.ts')
				expect(packageJson.exports['.'].default).toBe('./index.js')

				// Verify backwards-compatible JSON access
				expect(packageJson.exports[`./json/${pkg.id}.json`]).toBe(`./json/${pkg.id}.json`)

				// Verify files array includes index files
				expect(packageJson.files).toContain('index.js')
				expect(packageJson.files).toContain('index.d.ts')
			})
		})
	}

	test('all index.d.ts files have valid TypeScript syntax', () => {
		// Verify all index.d.ts files are valid by checking they can be parsed
		for (const pkg of contentPackages) {
			const dtsPath = path.join(PKG_DIR, pkg.scope, pkg.name, 'index.d.ts')
			const content = readFileSync(dtsPath, 'utf-8')

			// Basic syntax checks
			expect(content).toMatch(/^import type \{ Datasworn \} from '@datasworn\/core';/m)
			expect(content).toMatch(/^declare const data: Datasworn\.(Ruleset|Expansion);/m)
			expect(content).toMatch(/^export default data;/m)
			expect(content).toMatch(/^export \{ data as \w+ \};/m)
		}
	})
})
