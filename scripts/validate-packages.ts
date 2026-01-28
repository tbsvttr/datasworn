#!/usr/bin/env bun
/**
 * Validates that all package configurations have required files
 * Run before build to catch missing files early
 */

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.join(__dirname, '..')

// Import package configs
const pkgConfigPath = path.join(ROOT, 'src/scripts/pkg/pkgConfig.ts')
const configContent = fs.readFileSync(pkgConfigPath, 'utf-8')

// Extract all package IDs and names from pkgConfig.ts
const packageMatches = configContent.matchAll(
  /export const (\w+)[\s\S]*?id: '([^']+)'[\s\S]*?name: '([^']+)'[\s\S]*?scope: (PKG_SCOPE_\w+)/g
)

interface PackageInfo {
  configName: string
  id: string
  name: string
  scope: 'official' | 'community'
}

const packages: PackageInfo[] = []
for (const match of packageMatches) {
  packages.push({
    configName: match[1],
    id: match[2],
    name: match[3],
    scope: match[4].includes('COMMUNITY') ? 'community' : 'official'
  })
}

let errors = 0
let warnings = 0

console.log('=== Package Validation ===\n')

for (const pkg of packages) {
  const issues: string[] = []
  const warns: string[] = []

  // Check source_data folder
  const sourceDir = path.join(ROOT, 'source_data', pkg.id)
  if (!fs.existsSync(sourceDir)) {
    issues.push(`Missing source_data/${pkg.id}/`)
  } else {
    // Check for at least one yaml file
    const yamlFiles = fs.readdirSync(sourceDir).filter(f => f.endsWith('.yaml'))
    if (yamlFiles.length === 0) {
      issues.push(`No YAML files in source_data/${pkg.id}/`)
    }
  }

  // Check nodejs package folder
  const pkgScope = pkg.scope === 'community' ? '@datasworn-community-content' : '@datasworn'
  const pkgDir = path.join(ROOT, 'pkg/nodejs', pkgScope, pkg.name)
  const pkgJsonPath = path.join(pkgDir, 'package.json')

  if (!fs.existsSync(pkgJsonPath)) {
    issues.push(`Missing pkg/nodejs/${pkgScope}/${pkg.name}/package.json`)
  }

  // Check if JSON output exists (after build)
  const jsonOutput = path.join(ROOT, 'datasworn', pkg.id, `${pkg.id}.json`)
  if (!fs.existsSync(jsonOutput)) {
    warns.push(`No built JSON (run build:json first)`)
  }

  // Check if nodejs package has generated files (after build:pkg)
  const idsJs = path.join(pkgDir, 'ids.js')
  if (fs.existsSync(pkgJsonPath) && !fs.existsSync(idsJs)) {
    warns.push(`No generated ids.js (run build:pkg first)`)
  }

  // Print results
  if (issues.length > 0 || warns.length > 0) {
    console.log(`${pkg.configName} (${pkg.id}):`)
    for (const issue of issues) {
      console.log(`  ✗ ${issue}`)
      errors++
    }
    for (const warn of warns) {
      console.log(`  ⚠ ${warn}`)
      warnings++
    }
    console.log('')
  }
}

if (errors === 0 && warnings === 0) {
  console.log(`✓ All ${packages.length} packages validated successfully\n`)
} else {
  console.log(`---`)
  if (errors > 0) {
    console.log(`✗ ${errors} error(s) - fix before building`)
  }
  if (warnings > 0) {
    console.log(`⚠ ${warnings} warning(s) - run build:all to resolve`)
  }
  console.log('')

  if (errors > 0) {
    process.exit(1)
  }
}
