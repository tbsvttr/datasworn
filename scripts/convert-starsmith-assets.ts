import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import YAML from 'yaml'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Read the source JSON
const inputPath = '/Users/tvcc/Code/privat/starsmith-compendiums/src/assets/StarsmithAssets.json'
const outputPath = path.join(__dirname, '../source_data/starsmith/assets.yaml')

interface SourceAsset {
  Name: string
  Category: string
  Source: string
  Author: string
  Date: string
  License: string
  Ability1?: string
  Ability2?: string
  Ability3?: string
  TrackLabel?: string
  TrackMax?: number
  TrackCondition?: string
  Input?: string
}

interface SourceData {
  Assets: SourceAsset[]
}

// Convert move references like [Move Name](Moves/Category/Move_Name) to datasworn format
function convertMoveLinks(text: string): string {
  // Convert Foundry-style links to Datasworn format
  // [Resupply](Moves/Recover/Resupply) -> [Resupply](datasworn:move:starforged/recover/resupply)
  return text.replace(
    /\[([^\]]+)\]\(Moves\/([^)]+)\)/g,
    (match, name, movePath) => {
      const dataswornPath = movePath.toLowerCase().replace(/_/g, '_')
      return `[${name}](datasworn:move:starforged/${dataswornPath.toLowerCase()})`
    }
  )
}

// Convert HTML to markdown
function convertHtmlToMarkdown(text: string): string {
  return text
    .replace(/<ul>\n?/g, '\n')
    .replace(/<\/ul>/g, '')
    .replace(/<li>/g, '  * ')
    .replace(/<\/li>/g, '')
    .replace(/\n\n+/g, '\n\n')
    .trim()
}

// Generate a slug from an asset name
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
}

// Map categories to their collection names
const categoryMap: Record<string, string> = {
  'Module': 'module',
  'Path': 'path',
  'Companion': 'companion',
  'Deed': 'deed',
  'Support Vehicle': 'support_vehicle'
}

// Category colors from Starforged
const categoryColors: Record<string, string> = {
  'module': '#7f5a90',
  'path': '#3a7f90',
  'companion': '#4d7a5f',
  'deed': '#8f5a3a',
  'support_vehicle': '#5a6a8f'
}

const data: SourceData = JSON.parse(fs.readFileSync(inputPath, 'utf-8'))

// Group assets by category
const assetsByCategory: Record<string, SourceAsset[]> = {}
for (const asset of data.Assets) {
  const cat = categoryMap[asset.Category] || asset.Category.toLowerCase().replace(/ /g, '_')
  if (!assetsByCategory[cat]) {
    assetsByCategory[cat] = []
  }
  assetsByCategory[cat].push(asset)
}

// Build the YAML structure
const output: Record<string, unknown> = {
  _id: 'starsmith',
  datasworn_version: '0.1.0',
  type: 'expansion',
  ruleset: 'starforged',
  assets: {}
}

// Source info
const sourceInfo = {
  title: 'Starsmith: Assets',
  date: '2023-03-09',
  url: 'https://playeveryrole.com/starsmith-products/',
  license: 'https://creativecommons.org/licenses/by-sa/4.0',
  authors: [{ name: 'Eric Bright' }]
}

// Process each category
for (const [category, assets] of Object.entries(assetsByCategory)) {
  const categoryName = category
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  const collection: Record<string, unknown> = {
    name: `${categoryName} Assets`,
    type: 'asset_collection',
    _source: { ...sourceInfo },
    contents: {}
  }

  if (categoryColors[category]) {
    collection.color = categoryColors[category]
  }

  for (const asset of assets) {
    const slug = slugify(asset.Name)
    const abilities: Record<string, unknown>[] = []

    // First ability is always enabled
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

    // Add controls for tracks
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

      // Add condition if present
      if (asset.TrackCondition) {
        (assetEntry.controls as Record<string, unknown>)[asset.TrackCondition.toLowerCase()] = {
          label: asset.TrackCondition.toLowerCase(),
          field_type: 'card_flip',
          disables_asset: true
        }
      }
    } else if (asset.TrackCondition) {
      // Just a condition without a meter (like "Charged")
      assetEntry.controls = {
        [asset.TrackCondition.toLowerCase()]: {
          label: asset.TrackCondition.toLowerCase(),
          field_type: 'checkbox'
        }
      }
    }

    // Add input field if present (goes in options:, not controls:)
    if (asset.Input) {
      assetEntry.options = {
        [asset.Input.toLowerCase().replace(/,/g, '_')]: {
          field_type: 'text',
          label: asset.Input.toLowerCase()
        }
      }
    }

    // Add shared: true for module assets
    if (category === 'module') {
      assetEntry.shared = true
    }

    ;(collection.contents as Record<string, unknown>)[slug] = assetEntry
  }

  ;(output.assets as Record<string, unknown>)[category] = collection
}

// Write the YAML
const yamlStr = YAML.stringify(output, {
  lineWidth: 0,
  defaultStringType: 'QUOTE_DOUBLE',
  defaultKeyType: 'PLAIN'
})

// Ensure the directory exists
const outputDir = path.dirname(outputPath)
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

fs.writeFileSync(outputPath, yamlStr)
console.log(`Converted ${data.Assets.length} assets to ${outputPath}`)
console.log('Assets by category:')
for (const [cat, assets] of Object.entries(assetsByCategory)) {
  console.log(`  ${cat}: ${assets.length}`)
}
