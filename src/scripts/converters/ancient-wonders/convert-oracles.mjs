import { readFileSync, writeFileSync } from 'fs'

// Read the extracted oracles
const data = JSON.parse(readFileSync('extracted/ancient-wonders-oracles.json', 'utf-8'))

// Build result ID map
const resultMap = {}
const textItems = data.filter(d => d.type === 'text')
for (const item of textItems) {
  resultMap[item._id] = {
    range: item.range,
    text: item.description || item.name || '',
    name: item.name || ''
  }
}
console.log(`Found ${textItems.length} table results`)

// Get tables with results
const tables = data.filter(d => d.results && Array.isArray(d.results) && d.results.length > 0)
console.log(`Found ${tables.length} tables with results`)

// Build folder map
const allItems = data.filter(d => d.name && d._id)
const folderMap = {}
for (const item of allItems) {
  if (item.folder) {
    if (!folderMap[item.folder]) {
      folderMap[item.folder] = []
    }
    folderMap[item.folder].push(item)
  }
}

// Find root-level folders
const folderItems = data.filter(d => d.type === 'RollTable' && d.folder === null && !d.results)
console.log(`Found ${folderItems.length} root folders:`, folderItems.map(f => f.name))

// Convert to snake_case
function toSnakeCase(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .substring(0, 50) // Limit length
}

// Track used keys per category to avoid duplicates
const usedKeys = {}

// Clean up text
function cleanText(text) {
  if (!text) return ''
  return text
    .replace(/@Compendium\[[^\]]+\]\{([^}]+)\}/g, '[$1]')
    .replace(/@UUID\[[^\]]+\]\{([^}]+)\}/g, '[$1]')
    .replace(/<p>/g, '')
    .replace(/<\/p>/g, '\n\n')
    .replace(/<strong>/g, '**')
    .replace(/<\/strong>/g, '**')
    .replace(/<em>/g, '_')
    .replace(/<\/em>/g, '_')
    .replace(/<ul>/g, '')
    .replace(/<\/ul>/g, '')
    .replace(/<li>/g, '  * ')
    .replace(/<\/li>/g, '\n')
    .replace(/\n\n+/g, '\n\n')
    .trim()
}

// Build YAML for a single table
function buildTableYaml(table, indent = '      ', category = 'default') {
  let id = toSnakeCase(table.name)

  // Ensure unique key within category
  if (!usedKeys[category]) usedKeys[category] = new Set()
  let uniqueId = id
  let counter = 2
  while (usedKeys[category].has(uniqueId)) {
    uniqueId = `${id}_${counter}`
    counter++
  }
  usedKeys[category].add(uniqueId)
  id = uniqueId

  const rows = []

  for (const resultId of table.results) {
    const result = resultMap[resultId]
    if (!result) continue

    rows.push({
      min: result.range[0],
      max: result.range[1],
      text: cleanText(result.text)
    })
  }

  if (rows.length === 0) return null

  // Sort rows by min value
  rows.sort((a, b) => a.min - b.min)

  // Remove duplicate/overlapping rows and fix gaps
  const cleanedRows = []
  let expectedMin = 1
  for (const row of rows) {
    if (row.min < expectedMin) {
      // Skip overlapping row
      continue
    }
    // Adjust min to expected
    row.min = expectedMin
    // Make sure max is at least min
    if (row.max < row.min) row.max = row.min
    cleanedRows.push(row)
    expectedMin = row.max + 1
  }

  // Use cleaned rows
  rows.length = 0
  rows.push(...cleanedRows)

  // Fix gaps in roll ranges
  for (let i = 0; i < rows.length - 1; i++) {
    const current = rows[i]
    const next = rows[i + 1]
    if (current.max < next.min - 1) {
      // There's a gap, extend current row to fill it
      current.max = next.min - 1
    }
  }

  let yaml = `${indent}${id}:\n`
  yaml += `${indent}  name: "${table.name.replace(/"/g, '\\"')}"\n`
  yaml += `${indent}  oracle_type: table_text\n`
  yaml += `${indent}  type: oracle_rollable\n`

  if (table.description) {
    const desc = cleanText(table.description)
    if (desc) {
      yaml += `${indent}  summary: |-\n`
      yaml += desc.split('\n').map(l => `${indent}    ${l}`).join('\n') + '\n'
    }
  }

  yaml += `${indent}  _source:\n`
  yaml += `${indent}    <<: *Source\n`
  yaml += `${indent}  rows:\n`

  for (const row of rows) {
    yaml += `${indent}    - roll: { min: ${row.min}, max: ${row.max} }\n`
    if (row.text.includes('\n')) {
      yaml += `${indent}      text: |-\n`
      yaml += row.text.split('\n').map(l => `${indent}        ${l}`).join('\n') + '\n'
    } else {
      yaml += `${indent}      text: "${row.text.replace(/"/g, '\\"')}"\n`
    }
  }

  return yaml
}

// Group tables by category based on folder/name patterns
const categories = {
  'Core Oracles': [],
  'Planets Expanded': [],
  'Solar Systems': [],
  'Splinters': [],
  'Items': [],
  'Celestial Brains': [],
  'Alien Megastructures': [],
  'Alien Megacities': [],
  'Denizens': [],
  'Other': []
}

for (const table of tables) {
  const name = table.name.toLowerCase()

  if (name.includes('splinter')) {
    categories['Splinters'].push(table)
  } else if (name.includes('planet') || table.folder === 'GvsmSMYbvgjEYSQc' || name.includes('world')) {
    categories['Planets Expanded'].push(table)
  } else if (name.includes('solar') || name.includes('star') || name.includes('orbit')) {
    categories['Solar Systems'].push(table)
  } else if (name.includes('item') || name.includes('weapon') || name.includes('tool') || name.includes('apparel')) {
    categories['Items'].push(table)
  } else if (name.includes('celestial brain') || name.includes('question')) {
    categories['Celestial Brains'].push(table)
  } else if (name.includes('megastructure') || name.includes('gigafound') || name.includes('stellar')) {
    categories['Alien Megastructures'].push(table)
  } else if (name.includes('megacit')) {
    categories['Alien Megacities'].push(table)
  } else if (name.includes('denizen') || name.includes('creature') || name.includes('phenomena')) {
    categories['Denizens'].push(table)
  } else if (name.includes('core') || name.includes('action') || name.includes('theme') || name.includes('descriptor')) {
    categories['Core Oracles'].push(table)
  } else {
    categories['Other'].push(table)
  }
}

// Print category counts
console.log('\nCategory counts:')
for (const [cat, items] of Object.entries(categories)) {
  if (items.length > 0) {
    console.log(`  ${cat}: ${items.length} tables`)
  }
}

// Build YAML output - just the first few categories to start
let yamlOutput = `_id: ancient_wonders
datasworn_version: "0.1.0"
type: expansion
ruleset: starforged
oracles:
`

const categoryColors = {
  'Splinters': '#9b59b6',
  'Items': '#e67e22',
  'Planets Expanded': '#3498db',
  'Solar Systems': '#f1c40f',
  'Celestial Brains': '#1abc9c',
  'Alien Megastructures': '#8e44ad',
  'Alien Megacities': '#e74c3c',
  'Denizens': '#27ae60',
  'Core Oracles': '#2c3e50',
  'Other': '#7f8c8d'
}

for (const [category, items] of Object.entries(categories)) {
  if (items.length === 0) continue

  const catId = toSnakeCase(category)
  const color = categoryColors[category] || '#7f8c8d'

  yamlOutput += `  ${catId}:\n`
  yamlOutput += `    name: "${category}"\n`
  yamlOutput += `    type: oracle_collection\n`
  yamlOutput += `    oracle_type: tables\n`
  yamlOutput += `    color: '${color}'\n`
  yamlOutput += `    _source:\n`
  yamlOutput += `      <<: &Source\n`
  yamlOutput += `        title: 'Ancient Wonders'\n`
  yamlOutput += `        license: https://creativecommons.org/licenses/by-nc-sa/4.0\n`
  yamlOutput += `        url: https://www.drivethrurpg.com/en/product/505365/ancient-wonders\n`
  yamlOutput += `        date: 2024-01-01\n`
  yamlOutput += `        authors:\n`
  yamlOutput += `          - name: Ludic Pen\n`
  yamlOutput += `    contents:\n`

  for (const table of items) {
    const tableYaml = buildTableYaml(table, '      ', catId)
    if (tableYaml) {
      yamlOutput += tableYaml
    }
  }
}

writeFileSync('converted-oracles.yaml', yamlOutput)
console.log('\nWrote converted-oracles.yaml')
console.log(`Output size: ${(yamlOutput.length / 1024).toFixed(1)} KB`)
