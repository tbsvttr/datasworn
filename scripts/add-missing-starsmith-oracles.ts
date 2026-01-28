import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import YAML from 'yaml'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const inputPath = '/Users/tvcc/Code/privat/starsmith-compendiums/src/oracles-expanded/starsmith-expanded-oracles.json'

interface FoundryResult {
  text: string
  range: [number, number]
}

interface FoundryOracle {
  name: string
  formula: string
  description?: string
  results: FoundryResult[]
}

interface FoundryData {
  items: FoundryOracle[]
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
}

// Read FoundryVTT data
const data: FoundryData = JSON.parse(fs.readFileSync(inputPath, 'utf-8'))

// Find missing oracles
const missingOraclePatterns = [
  'Random NPC Conversation',
  'Quick Flora',
  'Registry Number',
  'Starship Quirks'
]

// Collect all variants of each oracle
const oracleGroups: Record<string, FoundryOracle[]> = {}

for (const oracle of data.items) {
  for (const pattern of missingOraclePatterns) {
    if (oracle.name.startsWith(pattern)) {
      const baseName = oracle.name.replace(/ \(\d+ - \d+\)$/, '')
      if (!oracleGroups[baseName]) {
        oracleGroups[baseName] = []
      }
      oracleGroups[baseName].push(oracle)
      break
    }
  }
}

console.log('Found oracle groups:')
for (const [name, oracles] of Object.entries(oracleGroups)) {
  console.log(`  ${name}: ${oracles.length} variant(s)`)
}

const sourceInfo = {
  title: 'Starsmith Expanded Oracles',
  date: '2023-03-09',
  url: 'https://playeveryrole.com/starsmith-products/',
  license: 'https://creativecommons.org/licenses/by-sa/4.0',
  authors: [{ name: 'Eric Bright' }]
}

// Convert oracles - handle multi-column (1-2, 3-4, 5-6) variants as 1d300
const mergedOracles: Record<string, unknown> = {}

for (const [baseName, variants] of Object.entries(oracleGroups)) {
  const slug = slugify(baseName)

  if (variants.length === 3) {
    // Multi-column oracle (like Action/Theme) - merge into 1d300
    // Sort: (1-2) = offset 0, (3-4) = offset 100, (5-6) = offset 200
    const sorted = variants.sort((a, b) => {
      const aNum = parseInt(a.name.match(/\((\d+)/)?.[1] || '0')
      const bNum = parseInt(b.name.match(/\((\d+)/)?.[1] || '0')
      return aNum - bNum
    })

    const allRows: { roll: { min: number; max: number }; text: string }[] = []

    sorted.forEach((variant, idx) => {
      const offset = idx * 100
      for (const r of variant.results) {
        allRows.push({
          roll: { min: r.range[0] + offset, max: r.range[1] + offset },
          text: r.text
        })
      }
    })

    // Sort by min
    allRows.sort((a, b) => a.roll.min - b.roll.min)

    let description = ''
    for (const v of variants) {
      if (v.description) {
        description = v.description.replace(/<[^>]*>/g, '').trim()
        break
      }
    }

    const oracleEntry: Record<string, unknown> = {
      name: baseName,
      type: 'oracle_rollable',
      oracle_type: 'table_text',
      _source: sourceInfo,
      dice: '1d300',
      rows: allRows
    }

    if (description) {
      oracleEntry.summary = description
    }

    mergedOracles[slug] = oracleEntry

  } else if (variants.length === 1) {
    // Single column oracle
    const oracle = variants[0]
    const rows = oracle.results.map(r => ({
      roll: { min: r.range[0], max: r.range[1] },
      text: r.text
    }))

    // Determine dice type from max range
    const maxRange = Math.max(...oracle.results.map(r => r.range[1]))
    const dice = maxRange <= 6 ? '1d6' : maxRange <= 10 ? '1d10' : '1d100'

    let description = ''
    if (oracle.description) {
      description = oracle.description.replace(/<[^>]*>/g, '').trim()
    }

    const oracleEntry: Record<string, unknown> = {
      name: baseName,
      type: 'oracle_rollable',
      oracle_type: 'table_text',
      _source: sourceInfo,
      dice,
      rows
    }

    if (description) {
      oracleEntry.summary = description
    }

    mergedOracles[slug] = oracleEntry
  }
}

// Create the output structure
const output = {
  _id: 'starsmith',
  datasworn_version: '0.1.0',
  type: 'expansion',
  ruleset: 'starforged',
  oracles: {
    additional: {
      name: 'Additional Oracles',
      type: 'oracle_collection',
      _source: sourceInfo,
      oracle_type: 'tables',
      contents: mergedOracles
    }
  }
}

const outputPath = path.join(__dirname, '../source_data/starsmith/oracles/additional.yaml')
const yamlStr = YAML.stringify(output, {
  lineWidth: 0,
  defaultStringType: 'QUOTE_DOUBLE',
  defaultKeyType: 'PLAIN'
})

fs.writeFileSync(outputPath, yamlStr)
console.log(`\nWrote ${Object.keys(mergedOracles).length} oracles to ${outputPath}`)

// Show summary
for (const [key, oracle] of Object.entries(mergedOracles)) {
  const o = oracle as Record<string, unknown>
  const rows = o.rows as unknown[]
  console.log(`  ${key}: ${rows.length} rows (${o.dice})`)
}
