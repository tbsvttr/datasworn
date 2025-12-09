import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

// Read the extracted assets
const assets = JSON.parse(readFileSync('extracted/ancient-wonders-assets.json', 'utf-8'))

// Filter out folder items, keep only actual assets
const actualAssets = assets.filter(a => a.type === 'asset')

// Group by category
const byCategory = {}
for (const asset of actualAssets) {
  const category = asset.system?.category || 'Unknown'
  if (!byCategory[category]) {
    byCategory[category] = []
  }
  byCategory[category].push(asset)
}

console.log('Asset categories found:')
for (const [cat, items] of Object.entries(byCategory)) {
  console.log(`  ${cat}: ${items.length} assets`)
}

// Convert HTML to markdown (basic)
function htmlToMarkdown(html) {
  if (!html) return ''
  return html
    .replace(/<p>/g, '')
    .replace(/<\/p>/g, '\n\n')
    .replace(/<strong>/g, '**')
    .replace(/<\/strong>/g, '**')
    .replace(/<em>/g, '_')
    .replace(/<\/em>/g, '_')
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/@Compendium\[[^\]]+\]\{([^}]+)\}/g, '$1') // Remove Foundry compendium links
    .replace(/\n\n+/g, '\n\n')
    .trim()
}

// Convert to Datasworn YAML format
function toSnakeCase(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
}

function convertAsset(asset) {
  const abilities = (asset.system?.abilities || []).map((ab, idx) => ({
    enabled: idx === 0 ? ab.enabled : undefined,
    text: htmlToMarkdown(ab.description)
  }))

  const result = {
    name: asset.name,
    type: 'asset',
    abilities
  }

  // Add track/meter if present
  if (asset.system?.track?.enabled) {
    result.controls = {
      [toSnakeCase(asset.system.track.name)]: {
        label: asset.system.track.name.toLowerCase(),
        field_type: 'condition_meter',
        max: asset.system.track.max,
        value: asset.system.track.value
      }
    }
  }

  // Add fields as options
  if (asset.system?.fields?.length > 0) {
    result.options = {}
    for (const field of asset.system.fields) {
      result.options[toSnakeCase(field.name)] = {
        label: field.name.toLowerCase(),
        field_type: 'text'
      }
    }
  }

  return result
}

// Build YAML output
let yamlOutput = `_id: ancient_wonders
datasworn_version: "0.1.0"
type: expansion
ruleset: starforged
<<: &Source
  date: 2024-01-01
  title: 'Ancient Wonders'
  url: https://www.drivethrurpg.com/en/product/505365/ancient-wonders
  license: https://creativecommons.org/licenses/by-nc-sa/4.0
  authors:
    - name: Ludic Pen
assets:
`

for (const [category, items] of Object.entries(byCategory)) {
  const collectionId = toSnakeCase(category)
  yamlOutput += `  ${collectionId}:
    name: ${category}
    type: asset_collection
    _source:
      <<: *Source
    contents:
`

  for (const asset of items) {
    const converted = convertAsset(asset)
    const assetId = toSnakeCase(asset.name)

    yamlOutput += `      ${assetId}:
        name: "${converted.name}"
        type: asset
        category: ${category}
        _source:
          <<: *Source
        abilities:
`
    for (let i = 0; i < converted.abilities.length; i++) {
      const ab = converted.abilities[i]
      if (i === 0) {
        yamlOutput += `        - enabled: true
          text: |-
            ${ab.text.split('\n').join('\n            ')}
`
      } else {
        yamlOutput += `        - text: |-
            ${ab.text.split('\n').join('\n            ')}
`
      }
    }
  }
}

writeFileSync('converted-assets.yaml', yamlOutput)
console.log('\nWrote converted-assets.yaml')

// Also output JSON for inspection
writeFileSync('assets-by-category.json', JSON.stringify(byCategory, null, 2))
console.log('Wrote assets-by-category.json')
