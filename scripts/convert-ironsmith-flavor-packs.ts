import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import YAML from 'yaml'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const flavorPacks = [
  { name: 'japanese', title: 'Japanese Flavor Pack' },
  { name: 'indian', title: 'Indian Flavor Pack' },
  { name: 'african', title: 'African Flavor Pack' },
  { name: 'norse', title: 'Norse Flavor Pack' },
  { name: 'south-american', title: 'South American Flavor Pack' },
]

interface SourceAsset {
  Name: string
  Category: string
  Description?: string
  Foreword?: string
  Ability1?: string
  Ability2?: string
  Ability3?: string
  Input1?: string
  TrackLabel?: string
  TrackMax?: number
}

interface SourceData {
  Assets: SourceAsset[]
}

// Classic Ironsworn move category mapping
const moveCategories: Record<string, string> = {
  'undertake a journey': 'adventure/undertake_a_journey',
  'resupply': 'adventure/resupply',
  'gather information': 'adventure/gather_information',
  'secure an advantage': 'adventure/secure_an_advantage',
  'face danger': 'adventure/face_danger',
  'make camp': 'adventure/make_camp',
  'heal': 'adventure/heal',
  'enter the fray': 'combat/enter_the_fray',
  'strike': 'combat/strike',
  'clash': 'combat/clash',
  'end the fight': 'combat/end_the_fight',
  'battle': 'combat/battle',
  'endure harm': 'suffer/endure_harm',
  'companion endure harm': 'suffer/companion_endure_harm',
  'endure stress': 'suffer/endure_stress',
  'face death': 'suffer/face_death',
  'compel': 'relationship/compel',
  'sojourn': 'relationship/sojourn',
  'forge a bond': 'relationship/forge_a_bond',
  'aid your ally': 'relationship/aid_your_ally',
  'write your epilogue': 'relationship/write_your_epilogue',
  'fulfill your vow': 'quest/fulfill_your_vow',
  'swear an iron vow': 'quest/swear_an_iron_vow',
  'reach a milestone': 'quest/reach_a_milestone',
}

const delveMoveCategories: Record<string, string> = {
  'delve the depths': 'delve/delve_the_depths',
  'check your gear': 'delve/check_your_gear',
  'discover a site': 'delve/discover_a_site',
}

function convertMoveLinks(text: string): string {
  let result = text

  for (const [moveName, movePath] of Object.entries(moveCategories)) {
    const pattern = new RegExp(`\\b(${moveName})\\b`, 'gi')
    result = result.replace(pattern, (match) => {
      const displayName = match.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
      return `[${displayName}](datasworn:move:classic/${movePath})`
    })
  }

  for (const [moveName, movePath] of Object.entries(delveMoveCategories)) {
    const pattern = new RegExp(`\\b(${moveName})\\b`, 'gi')
    result = result.replace(pattern, (match) => {
      const displayName = match.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
      return `[${displayName}](datasworn:move:delve/${movePath})`
    })
  }

  return result
}

function convertHtmlToMarkdown(text: string): string {
  return text
    .replace(/<ul>\s*/g, '\n')
    .replace(/<\/ul>/g, '')
    .replace(/<li>/g, '  * ')
    .replace(/<\/li>/g, '')
    .replace(/\n\n+/g, '\n\n')
    .trim()
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
}

// Read existing ironsmith assets
const existingPath = path.join(__dirname, '../source_data/ironsmith/assets.yaml')
const existingContent = fs.readFileSync(existingPath, 'utf-8')
const existing = YAML.parse(existingContent)

const sourceInfo = {
  title: 'Ironsmith',
  date: '2021-10-21',
  url: 'https://www.drivethrurpg.com/product/351813/Ironsmith',
  license: 'https://creativecommons.org/licenses/by/4.0',
  authors: [{ name: 'Eric Bright' }]
}

let totalAssets = 0

for (const pack of flavorPacks) {
  const inputPath = `/Users/tvcc/Code/privat/ironsmith-compendiums/src/flavor-packs/${pack.name}/${pack.name}-assets.json`

  if (!fs.existsSync(inputPath)) {
    console.log(`Skipping ${pack.name} - file not found`)
    continue
  }

  const data: SourceData = JSON.parse(fs.readFileSync(inputPath, 'utf-8'))
  console.log(`Processing ${pack.name}: ${data.Assets.length} assets`)
  totalAssets += data.Assets.length

  // Create collection key from pack name
  const collectionKey = pack.name.replace(/-/g, '_') + '_flavor'

  const collection: Record<string, unknown> = {
    name: pack.title,
    type: 'asset_collection',
    _source: { ...sourceInfo },
    contents: {}
  }

  for (const asset of data.Assets) {
    const slug = slugify(asset.Name)
    const abilities: Record<string, unknown>[] = []

    if (asset.Ability1) {
      abilities.push({
        enabled: true,
        text: convertHtmlToMarkdown(convertMoveLinks(asset.Ability1))
      })
    }

    if (asset.Ability2) {
      abilities.push({
        text: convertHtmlToMarkdown(convertMoveLinks(asset.Ability2))
      })
    }

    if (asset.Ability3) {
      abilities.push({
        text: convertHtmlToMarkdown(convertMoveLinks(asset.Ability3))
      })
    }

    const assetEntry: Record<string, unknown> = {
      name: asset.Name,
      type: 'asset',
      category: asset.Category,
      _source: { ...sourceInfo },
      abilities
    }

    if (asset.Foreword) {
      assetEntry.requirement = asset.Foreword
    }

    if (asset.Description) {
      assetEntry.description = asset.Description
    }

    if (asset.TrackMax) {
      assetEntry.controls = {
        [asset.TrackLabel?.toLowerCase() || 'health']: {
          field_type: 'condition_meter',
          label: asset.TrackLabel?.toLowerCase() || 'health',
          max: asset.TrackMax,
          value: asset.TrackMax,
          min: 0
        }
      }
    }

    if (asset.Input1) {
      assetEntry.options = {
        [asset.Input1.toLowerCase()]: {
          field_type: 'text',
          label: asset.Input1.toLowerCase()
        }
      }
    }

    ;(collection.contents as Record<string, unknown>)[slug] = assetEntry
  }

  existing.assets[collectionKey] = collection
}

// Write back
const yamlStr = YAML.stringify(existing, {
  lineWidth: 0,
  defaultStringType: 'QUOTE_DOUBLE',
  defaultKeyType: 'PLAIN'
})

fs.writeFileSync(existingPath, yamlStr)
console.log(`\nAdded ${totalAssets} flavor pack assets to ironsmith`)
console.log('Collections added:')
for (const pack of flavorPacks) {
  console.log(`  ${pack.name}_flavor`)
}
