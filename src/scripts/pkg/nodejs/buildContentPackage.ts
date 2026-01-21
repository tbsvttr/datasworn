import path from 'node:path'
import { copyDir, copyFile, updateJSON } from 'scripts/utils/readWrite.js'
import type { RulesPackageConfig } from '../../../schema/tools/build/index.js'
import {
	PKG_DIR_NODE,
	PKG_SCOPE_OFFICIAL,
	ROOT_HISTORY,
	ROOT_OUTPUT,
	VERSION
} from '../../const.js'
import Log from '../../utils/Log.js'
import { emptyDir } from '../../utils/readWrite.js'
import { Glob } from 'bun'

/** Generate the index.js content for a content package */
function generateIndexJs(id: string, jsonFileName: string): string {
	return `export { default } from './json/${jsonFileName}.json' with { type: 'json' };
export { default as ${id} } from './json/${jsonFileName}.json' with { type: 'json' };
`
}

/** Generate the index.d.ts content for a content package */
function generateIndexDts(id: string, type: 'ruleset' | 'expansion'): string {
	const dataswornType = type === 'ruleset' ? 'Ruleset' : 'Expansion'
	return `import type { Datasworn } from '@datasworn/core';

declare const data: Datasworn.${dataswornType};
export default data;
export { data as ${id} };
`
}

/** Assemble a NodeJS package from a {@link RulesPackageConfig} using data in {@link ROOT_OUTPUT} */
export async function buildContentPackage({
	id,
	type,
	pkg,
	paths,
}: RulesPackageConfig) {
	const { name, scope, ...packageUpdate } = pkg

	/** async operations on package JSON files */
	const jsonOps: Promise<unknown>[] = []

	/** scoped package name for NPM */
	const pkgID = path.join(scope, name)

	/** Desination path for built package */
	const pkgRoot = path.join(PKG_DIR_NODE, pkgID)

	/** Path to the NPM package's package.json */
	const nodePackageJsonPath = Bun.file(path.join(pkgRoot, 'package.json'))

	/** async operations on package JSON */
	jsonOps.push(
		// update package.json from data in the RulesPackageConfig
		updateJSON<Record<string, unknown>>(
			nodePackageJsonPath,
			(packageDotJson) => {
				Object.assign(packageDotJson, packageUpdate)
				packageDotJson.version = VERSION

				// Add typed exports configuration
				packageDotJson.type = 'module'
				packageDotJson.main = 'index.js'
				packageDotJson.types = 'index.d.ts'
				packageDotJson.exports = {
					'.': {
						types: './index.d.ts',
						default: './index.js'
					},
					[`./json/${id}.json`]: `./json/${id}.json`
				}

				// Update files array to include index files
				const files = packageDotJson.files as string[] | undefined
				if (files != null && !files.includes('index.js')) {
					files.unshift('index.js', 'index.d.ts')
				}

				const dependencies = packageDotJson?.dependencies as
					| Record<string, string>
					| undefined

				if (dependencies != null)
					for (const depId in dependencies)
						if (depId.startsWith(PKG_SCOPE_OFFICIAL))
							dependencies[depId] = VERSION

				return packageDotJson
			}
		)
	)

	// Generate and write index.js and index.d.ts files
	const indexJsPath = path.join(pkgRoot, 'index.js')
	const indexDtsPath = path.join(pkgRoot, 'index.d.ts')

	jsonOps.push(
		Bun.write(indexJsPath, generateIndexJs(id, id)),
		Bun.write(indexDtsPath, generateIndexDts(id, type))
	)

	/** Destination path for the JSON content directory */
	const pkgJsonDest = path.join(pkgRoot, 'json')
	/** Path to the prebuilt JSON content directory */
	const jsonSrc = path.join(ROOT_OUTPUT, id)

	jsonOps.push(
		// empty JSON destination directory
		emptyDir(pkgJsonDest).then(() => copyDir(jsonSrc, pkgJsonDest))
	)

	/** async operations on package image assets */
	const imgAssetOps: Promise<unknown>[] = []

	for (const imgAssetSrc of paths.assets ?? []) {
		const imgAssetDest = path.join(
			pkgRoot,
			imgAssetSrc.split('/').pop() as string
		)

		imgAssetOps.push(
			emptyDir(imgAssetDest).then(() => copyDir(imgAssetSrc, imgAssetDest))
		)
	}

	const migrationFileGlob = new Glob(`*/${id}/*_map.json`)

	/** Files relative to ROOT_HISTORY which are to be evaluated for copying.
	 * @example "0.1.0/starforged/id_map.json"
	 */
	const migrationFiles = migrationFileGlob.scan(ROOT_HISTORY)

	for await (const sourceFile of migrationFiles) {
		const [version, _id, filename] = sourceFile.split('/')
		// skip if this filepath is for a higher version, somehow
		if (Bun.semver.order(VERSION, version) === -1) continue

		const destination = path.join(pkgRoot, 'migration', version, filename)

		jsonOps.push(copyFile(path.join(ROOT_HISTORY, sourceFile), destination))
	}

	await Promise.all([...jsonOps, ...imgAssetOps])

	return Log.info(`✅ Finished building ${pkgID}`)



}

