import { ClassicLevel } from 'classic-level'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

const packs = [
  'ancient-wonders-assets',
  'ancient-wonders-moves',
  'ancient-wonders-oracles'
]

mkdirSync('extracted', { recursive: true })

for (const packName of packs) {
  console.log(`\nExtracting ${packName}...`)
  const db = new ClassicLevel(join('packs', packName), { valueEncoding: 'json' })

  const items = []
  for await (const [key, value] of db.iterator()) {
    items.push(value)
    console.log(`  - ${value.name || value._id || key}`)
  }

  await db.close()

  writeFileSync(
    join('extracted', `${packName}.json`),
    JSON.stringify(items, null, 2)
  )
  console.log(`Wrote ${items.length} items to extracted/${packName}.json`)
}

console.log('\nDone!')
