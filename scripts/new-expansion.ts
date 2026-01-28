#!/usr/bin/env bun
/**
 * Scaffold a new expansion package
 * Usage: bun scripts/new-expansion.ts <id> <ruleset> <author> [--build]
 *
 * Examples:
 *   bun scripts/new-expansion.ts my_expansion starforged "Eric Bright"
 *   bun scripts/new-expansion.ts my_expansion classic "Author Name" --build
 */

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.join(__dirname, '..')

function toTitle(id: string): string {
  return id.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function toPackageName(id: string): string {
  return id.replace(/_/g, '-')
}

function toConfigName(id: string): string {
  return id.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')
}

async function main() {
  const args = process.argv.slice(2)
  const runBuild = args.includes('--build')
  const filteredArgs = args.filter(a => a !== '--build')

  if (filteredArgs.length < 3) {
    console.log('Usage: bun scripts/new-expansion.ts <id> <ruleset> <author> [--build]')
    console.log('')
    console.log('  id       Expansion ID with underscores (e.g., my_expansion)')
    console.log('  ruleset  classic or starforged')
    console.log('  author   Author name in quotes')
    console.log('  --build  Run build:all after scaffolding')
    console.log('')
    console.log('Examples:')
    console.log('  bun scripts/new-expansion.ts iron_abyss classic "John Smith"')
    console.log('  bun scripts/new-expansion.ts star_realms starforged "Jane Doe" --build')
    process.exit(1)
  }

  const [id, ruleset, authorName] = filteredArgs

  if (!['classic', 'starforged'].includes(ruleset)) {
    console.error('Error: ruleset must be "classic" or "starforged"')
    process.exit(1)
  }

  const name = toPackageName(id)
  const title = toTitle(id)
  const configName = toConfigName(id)
  const pkgScope = '@datasworn-community-content'
  const depPkg = ruleset === 'starforged' ? '@datasworn/starforged' : '@datasworn/ironsworn-classic'

  console.log(`\n=== Creating expansion: ${title} ===\n`)

  // 1. Create source_data folder and assets.yaml
  const sourceDir = path.join(ROOT, 'source_data', id)
  fs.mkdirSync(sourceDir, { recursive: true })

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
    console.log(`✓ source_data/${id}/assets.yaml`)
  } else {
    console.log(`• source_data/${id}/assets.yaml (exists)`)
  }

  // 2. Create nodejs package folder and package.json
  const pkgDir = path.join(ROOT, 'pkg/nodejs', pkgScope, name)
  fs.mkdirSync(path.join(pkgDir, 'json'), { recursive: true })

  const packageJson = {
    name: `${pkgScope}/${name}`,
    version: '0.1.0',
    description: `Datasworn JSON data for ${title}.`,
    files: ['index.js', 'index.d.ts', 'json', 'migration'],
    repository: {
      type: 'git',
      url: 'git+https://github.com/rsek/datasworn.git',
      directory: `pkg/nodejs/${pkgScope}/${name}`
    },
    keywords: ['ironsworn', 'datasworn', 'TTRPG', name],
    contributors: [{ name: authorName }],
    scripts: { release: 'release-it' },
    license: 'CC-BY-4.0',
    bugs: { url: 'https://github.com/rsek/datasworn/issues' },
    dependencies: { [depPkg]: '0.1.0' },
    authors: [{ name: authorName }],
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
  console.log(`✓ pkg/nodejs/${pkgScope}/${name}/package.json`)

  // 3. Append to pkgConfig.ts
  const pkgConfigPath = path.join(ROOT, 'src/scripts/pkg/pkgConfig.ts')
  const pkgConfigContent = fs.readFileSync(pkgConfigPath, 'utf-8')

  if (pkgConfigContent.includes(`id: '${id}'`)) {
    console.log(`• src/scripts/pkg/pkgConfig.ts (${configName} exists)`)
  } else {
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
\t\tscope: PKG_SCOPE_COMMUNITY,
\t\tdescription:
\t\t\t'Datasworn JSON data for ${title}.',
\t\tkeywords: [
\t\t\t'ironsworn',
\t\t\t'datasworn',
\t\t\t'TTRPG',
\t\t\t'${name}',
\t\t],
\t\tauthors: [
\t\t\t{
\t\t\t\tname: '${authorName}',
\t\t\t},
\t\t],
\t},
}
`
    fs.appendFileSync(pkgConfigPath, configEntry)
    console.log(`✓ src/scripts/pkg/pkgConfig.ts (added ${configName})`)
  }

  console.log('')

  if (runBuild) {
    console.log('=== Running build:all ===\n')
    execSync('npm run build:all', { cwd: ROOT, stdio: 'inherit' })
  } else {
    console.log('Next steps:')
    console.log(`1. Add content to source_data/${id}/assets.yaml`)
    console.log('2. Run: npm run build:all')
    console.log('3. Commit all changes')
  }
}

main().catch(console.error)
