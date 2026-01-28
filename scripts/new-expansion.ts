#!/usr/bin/env bun
/**
 * Scaffold a new expansion package
 * Usage: bun scripts/new-expansion.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import * as readline from 'readline'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.join(__dirname, '..')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function ask(question: string): Promise<string> {
  return new Promise(resolve => rl.question(question, resolve))
}

async function main() {
  console.log('=== New Expansion Scaffold ===\n')

  // Gather info
  const id = await ask('Expansion ID (e.g., my_expansion): ')
  const name = await ask('Package name (e.g., my-expansion): ')
  const title = await ask('Title (e.g., My Expansion): ')
  const description = await ask('Description: ')
  const authorName = await ask('Author name: ')
  const authorUrl = await ask('Author URL: ')
  const ruleset = await ask('Ruleset (classic/starforged): ')
  const scope = await ask('Scope (community/official) [community]: ') || 'community'

  rl.close()

  const isOfficial = scope === 'official'
  const pkgScope = isOfficial ? '@datasworn' : '@datasworn-community-content'
  const depPkg = ruleset === 'starforged' ? '@datasworn/starforged' : '@datasworn/ironsworn-classic'

  console.log('\n--- Creating files ---\n')

  // 1. Create source_data folder
  const sourceDir = path.join(ROOT, 'source_data', id)
  if (!fs.existsSync(sourceDir)) {
    fs.mkdirSync(sourceDir, { recursive: true })
    console.log(`Created: source_data/${id}/`)
  }

  // 2. Create stub assets.yaml
  const assetsYaml = `_id: "${id}"
datasworn_version: "0.1.0"
type: "expansion"
ruleset: "${ruleset}"
title: "${title}"
date: "${new Date().toISOString().split('T')[0]}"
url: ""
license: "https://creativecommons.org/licenses/by/4.0"
authors:
  - name: "${authorName}"

assets: {}
`
  const assetsPath = path.join(sourceDir, 'assets.yaml')
  if (!fs.existsSync(assetsPath)) {
    fs.writeFileSync(assetsPath, assetsYaml)
    console.log(`Created: source_data/${id}/assets.yaml`)
  }

  // 3. Create nodejs package folder
  const pkgDir = path.join(ROOT, 'pkg/nodejs', pkgScope, name)
  if (!fs.existsSync(pkgDir)) {
    fs.mkdirSync(path.join(pkgDir, 'json'), { recursive: true })
    console.log(`Created: pkg/nodejs/${pkgScope}/${name}/`)
  }

  // 4. Create package.json
  const packageJson = {
    name: `${pkgScope}/${name}`,
    version: '0.1.0',
    description,
    files: ['index.js', 'index.d.ts', 'json', 'migration'],
    repository: {
      type: 'git',
      url: 'git+https://github.com/rsek/datasworn.git',
      directory: `pkg/nodejs/${pkgScope}/${name}`
    },
    keywords: ['ironsworn', 'datasworn', 'TTRPG', name],
    contributors: [{ name: authorName, url: authorUrl }],
    scripts: { release: 'release-it' },
    license: 'CC-BY-4.0',
    bugs: { url: 'https://github.com/rsek/datasworn/issues' },
    dependencies: { [depPkg]: '0.1.0' },
    authors: [{ name: authorName, url: authorUrl }],
    private: true,
    type: 'module',
    main: 'index.js',
    types: 'index.d.ts',
    exports: {
      '.': { types: './index.d.ts', default: './index.js' },
      './ids': { types: './ids.d.ts', default: './ids.js' },
      [`./json/${id}.json`]: `./json/${id}.json`
    }
  }

  const pkgJsonPath = path.join(pkgDir, 'package.json')
  fs.writeFileSync(pkgJsonPath, JSON.stringify(packageJson, null, '\t') + '\n')
  console.log(`Created: pkg/nodejs/${pkgScope}/${name}/package.json`)

  // 5. Generate pkgConfig entry
  const scopeConst = isOfficial ? 'PKG_SCOPE_OFFICIAL' : 'PKG_SCOPE_COMMUNITY'
  const configName = id.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')

  const configEntry = `
export const ${configName}: RulesPackageConfig = {
\ttype: 'expansion',
\tpaths: {
\t\tsource: path.join(ROOT_SOURCE_DATA, '${id}'),
\t},
\tid: '${id}',
\tpkg: {
\t\tname: '${name}',
\t\tprivate: true,
\t\tscope: ${scopeConst},
\t\tdescription: '${description}',
\t\tkeywords: ['ironsworn', 'datasworn', 'TTRPG', '${name}'],
\t\tauthors: [
\t\t\t{
\t\t\t\tname: '${authorName}',
\t\t\t\turl: '${authorUrl}',
\t\t\t},
\t\t],
\t},
}
`

  console.log(`\n--- Add to src/scripts/pkg/pkgConfig.ts ---\n`)
  console.log(configEntry)

  console.log(`\n--- Next steps ---`)
  console.log(`1. Add the config above to src/scripts/pkg/pkgConfig.ts`)
  console.log(`2. Add content to source_data/${id}/assets.yaml`)
  console.log(`3. Run: npm run build:all`)
  console.log(`4. Commit all changes`)
}

main().catch(console.error)
