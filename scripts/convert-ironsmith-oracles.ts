import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import YAML from 'yaml'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const inputPath = '/Users/tvcc/Code/privat/ironsmith-compendiums/src/oracles/ironsmith-expanded-oracles.json'
const outputPath = path.join(__dirname, '../source_data/ironsmith/oracles.yaml')

interface SourceRow {
  Chance: number
  Description: string
}

interface SourceOracle {
  Name: string
  d: string
  'Oracle Table': SourceRow[]
}

interface SourceData {
  Title: string
  Oracles: SourceOracle[]
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
}

// Group oracles by category prefix
function categorizeOracle(name: string): string {
  if (name.includes('Corruption')) return 'corruption'
  if (name.startsWith('Fantasy Quest') || name.startsWith('Grim Quest') ||
      name.startsWith('Virtue Challenge') || name.includes('Alternate Fantasy')) return 'quests'
  if (name.startsWith('Mystery Vow')) return 'mystery_vow'
  if (name.startsWith('One-Shot')) return 'one_shot'
  if (name.startsWith('Monster Hunting')) return 'monster_hunting'
  if (name.startsWith('Advance Threat')) return 'advance_threat'
  if (name.includes('Names')) return 'names'
  if (name.includes('NPC') || name.includes('Character')) return 'character'
  if (name.includes('Settlement') || name.includes('Location')) return 'places'
  return 'misc'
}

const categoryNames: Record<string, string> = {
  corruption: 'Corruption Oracles',
  quests: 'Quest Oracles',
  mystery_vow: 'Mystery Vow Oracles',
  one_shot: 'One-Shot Oracles',
  monster_hunting: 'Monster Hunting Oracles',
  advance_threat: 'Advance Threat Oracles',
  names: 'Name Oracles',
  character: 'Character Oracles',
  places: 'Place Oracles',
  misc: 'Miscellaneous Oracles'
}

const data: SourceData = JSON.parse(fs.readFileSync(inputPath, 'utf-8'))

const sourceInfo = {
  title: 'Ironsmith',
  date: '2021-10-21',
  url: 'https://www.drivethrurpg.com/product/351813/Ironsmith',
  license: 'https://creativecommons.org/licenses/by/4.0',
  authors: [{ name: 'Eric Bright' }]
}

// Group oracles by category
const oraclesByCategory: Record<string, SourceOracle[]> = {}
for (const oracle of data.Oracles) {
  const cat = categorizeOracle(oracle.Name)
  if (!oraclesByCategory[cat]) {
    oraclesByCategory[cat] = []
  }
  oraclesByCategory[cat].push(oracle)
}

// Build output structure
const output: Record<string, unknown> = {
  _id: 'ironsmith',
  datasworn_version: '0.1.0',
  type: 'expansion',
  ruleset: 'classic',
  oracles: {}
}

for (const [category, oracles] of Object.entries(oraclesByCategory)) {
  const collection: Record<string, unknown> = {
    name: categoryNames[category],
    type: 'oracle_collection',
    _source: { ...sourceInfo },
    oracle_type: 'tables',
    contents: {}
  }

  for (const oracle of oracles) {
    const slug = slugify(oracle.Name)
    const table = oracle['Oracle Table']
    const diceMax = parseInt(oracle.d)

    // Convert cumulative chances to ranges
    const rows: Record<string, unknown>[] = []
    let prevChance = 0

    for (const row of table) {
      const min = prevChance + 1
      const max = row.Chance

      rows.push({
        roll: { min, max },
        text: row.Description
      })

      prevChance = row.Chance
    }

    const oracleEntry: Record<string, unknown> = {
      name: oracle.Name,
      type: 'oracle_rollable',
      oracle_type: 'table_text',
      _source: { ...sourceInfo },
      dice: `1d${diceMax}`,
      rows
    }

    ;(collection.contents as Record<string, unknown>)[slug] = oracleEntry
  }

  ;(output.oracles as Record<string, unknown>)[category] = collection
}

// Read existing ironsmith data and merge
const existingPath = path.join(__dirname, '../source_data/ironsmith/assets.yaml')
const existingContent = fs.readFileSync(existingPath, 'utf-8')
const existing = YAML.parse(existingContent)

// Merge oracles into existing
existing.oracles = output.oracles

// Write back
const yamlStr = YAML.stringify(existing, {
  lineWidth: 0,
  defaultStringType: 'QUOTE_DOUBLE',
  defaultKeyType: 'PLAIN'
})

fs.writeFileSync(existingPath, yamlStr)

console.log(`Converted ${data.Oracles.length} oracles to ${existingPath}`)
console.log('Oracle categories:')
for (const [cat, oracles] of Object.entries(oraclesByCategory)) {
  console.log(`  ${categoryNames[cat]}: ${oracles.length}`)
}
