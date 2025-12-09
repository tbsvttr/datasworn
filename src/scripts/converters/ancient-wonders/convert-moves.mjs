import { readFileSync, writeFileSync } from 'fs'

// Read the extracted moves
const moves = JSON.parse(readFileSync('extracted/ancient-wonders-moves.json', 'utf-8'))

// Filter out folder items, keep only actual moves
const actualMoves = moves.filter(m => m.type === 'sfmove')

console.log(`Found ${actualMoves.length} moves`)

// Get folder IDs to names mapping
const folders = moves.filter(m => m.type === 'Item' && m.sorting)
const folderMap = {}
for (const f of folders) {
  folderMap[f._id] = f.name
}

// Group by folder/category
const byCategory = {}
for (const move of actualMoves) {
  const category = folderMap[move.folder] || 'General'
  if (!byCategory[category]) {
    byCategory[category] = []
  }
  byCategory[category].push(move)
}

console.log('Move categories found:')
for (const [cat, items] of Object.entries(byCategory)) {
  console.log(`  ${cat}: ${items.length} moves`)
}

// Convert to snake_case
function toSnakeCase(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
}

// Clean up move text
function cleanText(text) {
  if (!text) return ''
  return text
    .replace(/@Compendium\[[^\]]+\]\{([^}]+)\}/g, '[$1]') // Convert Foundry links
    .replace(/__([^_]+)__/g, '**$1**') // Bold
    .replace(/<p>/g, '')
    .replace(/<\/p>/g, '\n\n')
    .replace(/<ul>/g, '')
    .replace(/<\/ul>/g, '')
    .replace(/<li>/g, '  * ')
    .replace(/<\/li>/g, '\n')
    .replace(/\n\n+/g, '\n\n')
    .trim()
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
moves:
`

for (const [category, items] of Object.entries(byCategory)) {
  const collectionId = toSnakeCase(category)
  yamlOutput += `  ${collectionId}:
    name: ${category}
    type: move_category
    _source:
      <<: *Source
    contents:
`

  for (const move of items) {
    const moveId = toSnakeCase(move.name)
    const text = cleanText(move.system?.Text || '')
    const trigger = move.system?.Trigger?.Text || ''
    const strongHit = cleanText(move.system?.Outcomes?.['Strong Hit']?.Text || '')
    const weakHit = cleanText(move.system?.Outcomes?.['Weak Hit']?.Text || '')
    const miss = cleanText(move.system?.Outcomes?.Miss?.Text || '')

    // Determine roll type
    const rollType = move.system?.['Progress Move'] ? 'progress_roll' : 'action_roll'

    yamlOutput += `      ${moveId}:
        name: "${move.name}"
        type: move
        roll_type: ${rollType}
        _source:
          <<: *Source
        text: |-
          ${text.split('\n').join('\n          ')}
        trigger:
          text: "${trigger}"
        outcomes:
          strong_hit:
            text: |-
              ${strongHit.split('\n').join('\n              ')}
          weak_hit:
            text: |-
              ${weakHit.split('\n').join('\n              ')}
          miss:
            text: |-
              ${miss.split('\n').join('\n              ')}
`
  }
}

writeFileSync('converted-moves.yaml', yamlOutput)
console.log('\nWrote converted-moves.yaml')
