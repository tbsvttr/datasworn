import { state, type Datasworn } from '../state'
import { renderMarkdown } from '../utils/markdown'

// Type guards for Datasworn types
function isMove(item: unknown): item is Datasworn.Move {
	return typeof item === 'object' && item !== null && (item as Record<string, unknown>).type === 'move'
}

function isAsset(item: unknown): item is Datasworn.Asset {
	return typeof item === 'object' && item !== null && (item as Record<string, unknown>).type === 'asset'
}

function isOracleRollable(item: unknown): item is Datasworn.OracleRollable {
	return typeof item === 'object' && item !== null && (item as Record<string, unknown>).type === 'oracle_rollable'
}

function isNpc(item: unknown): item is Datasworn.Npc {
	return typeof item === 'object' && item !== null && (item as Record<string, unknown>).type === 'npc'
}

function isAtlasEntry(item: unknown): item is Datasworn.AtlasEntry {
	return typeof item === 'object' && item !== null && (item as Record<string, unknown>).type === 'atlas_entry'
}

function isTruth(item: unknown): item is Datasworn.Truth {
	return typeof item === 'object' && item !== null && (item as Record<string, unknown>).type === 'truth'
}

function isCollection(item: unknown): item is Datasworn.MoveCategory | Datasworn.AssetCollection | Datasworn.OracleCollection | Datasworn.NpcCollection | Datasworn.AtlasCollection {
	if (typeof item !== 'object' || item === null) return false
	const type = (item as Record<string, unknown>).type
	return type === 'move_category' || type === 'asset_collection' || type === 'oracle_collection' || type === 'npc_collection' || type === 'atlas_collection'
}

export function createDetailPanel(container: HTMLElement): void {
	const panel = document.createElement('div')
	panel.className = 'detail-panel'
	container.appendChild(panel)

	// Handle clicks on datasworn links
	panel.addEventListener('click', (e) => {
		const target = e.target as HTMLElement
		if (target.tagName === 'A') {
			const href = target.getAttribute('href')
			if (href?.startsWith('datasworn:')) {
				e.preventDefault()
				const id = href.slice('datasworn:'.length)
				const found = state.navigateToId(id)
				if (!found) {
					console.warn('Could not find item:', id)
				}
			}
		}
	})

	state.subscribe((s) => {
		if (!s.selectedItem) {
			panel.innerHTML = `
				<div class="detail-empty">
					<p>Select an item from the tree to view details</p>
				</div>
			`
			return
		}

		panel.innerHTML = renderDetail(s.selectedItem, s.selectedPath || [])
	})
}

function renderDetail(item: unknown, path: string[]): string {
	if (typeof item !== 'object' || item === null) {
		return `<div class="json-view">${JSON.stringify(item, null, 2)}</div>`
	}

	const obj = item as Record<string, unknown>
	const name = (typeof obj.name === 'string' ? obj.name : null) || path[path.length - 1] || 'Item'
	const type = typeof obj.type === 'string' ? obj.type : undefined
	const id = typeof obj._id === 'string' ? obj._id : undefined

	let html = `<div class="detail-header">`

	// Type badge
	if (type) {
		html += `<span class="type-badge type-${type}">${formatLabel(type)}</span>`
	}

	html += `<h2>${escapeHtml(name)}</h2>`

	if (id) {
		html += `<code class="detail-id">${id}</code>`
	}

	html += `</div><div class="detail-content">`

	// Render based on type using type guards
	if (isMove(item)) {
		html += renderMove(item)
	} else if (isAsset(item)) {
		html += renderAsset(item)
	} else if (isOracleRollable(item)) {
		html += renderOracle(item)
	} else if (isNpc(item)) {
		html += renderNpc(item)
	} else if (isAtlasEntry(item)) {
		html += renderAtlasEntry(item)
	} else if (isTruth(item)) {
		html += renderTruth(item)
	} else if (isCollection(item)) {
		html += renderCollection(item)
	} else {
		html += renderGeneric(obj)
	}

	html += `</div>`

	// Add collapsible raw JSON view
	const jsonId = `json-${Math.random().toString(36).slice(2)}`
	html += `
		<div class="detail-section json-section">
			<div class="detail-section-title json-toggle" onclick="this.classList.toggle('expanded'); document.getElementById('${jsonId}').classList.toggle('collapsed')">Raw JSON</div>
			<div id="${jsonId}" class="json-view collapsed">${escapeHtml(JSON.stringify(obj, null, 2))}</div>
		</div>
	`

	return html
}

function renderMove(move: Datasworn.Move): string {
	let html = ''

	// Get embedded oracles for template resolution
	const oracles = move.oracles as Record<string, Datasworn.EmbeddedOracleRollable> | undefined

	// Roll type badge
	if (move.roll_type) {
		html += `<div class="roll-type-badge">${formatLabel(move.roll_type)}</div>`
	}

	// Trigger in a card
	if (move.trigger?.text) {
		html += `
			<div class="card trigger-card">
				<div class="card-header">When you...</div>
				<div class="card-body">${renderMarkdownWithOracles(move.trigger.text, oracles)}</div>
			</div>
		`
	}

	// Stats for action rolls
	if (move.roll_type === 'action_roll' && 'trigger' in move && move.trigger) {
		const trigger = move.trigger as Datasworn.TriggerActionRoll
		if (trigger.conditions) {
			const stats = new Set<string>()
			for (const cond of trigger.conditions) {
				if (cond.roll_options) {
					for (const opt of cond.roll_options) {
						if (opt.using === 'stat' && 'stat' in opt) {
							stats.add(opt.stat)
						}
					}
				}
			}
			if (stats.size > 0) {
				html += `<div class="stat-pills">`
				for (const stat of stats) {
					html += `<span class="stat-pill">${stat}</span>`
				}
				html += `</div>`
			}
		}
	}

	// Main text
	if (move.text) {
		html += `<div class="move-text">${renderMarkdownWithOracles(move.text, oracles)}</div>`
	}

	// Outcomes
	if ('outcomes' in move && move.outcomes) {
		const outcomes = move.outcomes
		html += `<div class="outcomes">`

		const outcomeOrder = ['strong_hit', 'weak_hit', 'miss'] as const
		for (const key of outcomeOrder) {
			const outcome = outcomes[key]
			if (outcome?.text) {
				html += `
					<div class="outcome-card outcome-${key}">
						<div class="outcome-header">${formatOutcome(key)}</div>
						<div class="outcome-body">${renderMarkdownWithOracles(outcome.text, oracles)}</div>
					</div>
				`
			}
		}

		html += `</div>`
	}

	return html
}

function renderMarkdownWithOracles(text: string, oracles?: Record<string, unknown>): string {
	if (!text) return ''

	// Replace {{table>...}} templates with actual oracle tables
	let processed = text.replace(/\{\{table>([^}]+)\}\}/g, (_, ref) => {
		// ref is like "move.oracle_rollable:classic/suffer/endure_harm.endure_harm"
		// Extract the oracle key (last segment after the last dot)
		const oracleKey = ref.split('.').pop()

		if (oracles && oracleKey && oracles[oracleKey]) {
			return renderEmbeddedOracle(oracles[oracleKey] as Record<string, unknown>)
		}

		// Fallback: show as a link to the oracle
		return `<em>[Oracle table: ${ref}]</em>`
	})

	// Replace {{table_columns>...}} templates with multi-column oracle tables
	processed = processed.replace(/\{\{table_columns>([^}]+)\}\}/g, (_, ref) => {
		// ref is like "move:classic/fate/ask_the_oracle"
		// This means we should render all embedded oracles from this move as columns
		if (oracles && Object.keys(oracles).length > 0) {
			return renderOracleColumns(oracles as Record<string, Record<string, unknown>>)
		}
		return `<em>[Oracle columns: ${ref}]</em>`
	})

	return renderMarkdown(processed)
}

function renderOracleColumns(oracles: Record<string, Record<string, unknown>>): string {
	const oracleEntries = Object.entries(oracles)
	if (oracleEntries.length === 0) return ''

	// Build a multi-column table where each oracle is a column
	let html = `</p><div class="embedded-oracle-table oracle-columns"><table><thead><tr><th class="roll-col">Roll</th>`

	// Add column headers for each oracle
	for (const [, oracle] of oracleEntries) {
		const name = oracle.name as string || 'Result'
		html += `<th>${escapeHtml(name)}</th>`
	}
	html += `</tr></thead><tbody>`

	// Find the maximum number of rows across all oracles
	const maxRows = Math.max(...oracleEntries.map(([, o]) => {
		const rows = o.rows as Array<Record<string, unknown>> | undefined
		return rows?.length || 0
	}))

	// Build rows
	for (let i = 0; i < maxRows; i++) {
		html += `<tr>`

		// Use the first oracle's roll range for the roll column
		const firstOracle = oracleEntries[0][1]
		const firstRows = firstOracle.rows as Array<Record<string, unknown>> | undefined
		const firstRow = firstRows?.[i]
		const roll = firstRow?.roll as Record<string, number> | undefined
		let rollStr = ''
		if (roll) {
			rollStr = roll.min === roll.max ? `${roll.min}` : `${roll.min}–${roll.max}`
		}
		html += `<td class="roll-cell">${rollStr}</td>`

		// Add cell for each oracle
		for (const [, oracle] of oracleEntries) {
			const rows = oracle.rows as Array<Record<string, unknown>> | undefined
			const row = rows?.[i]
			const text = row?.text as string || ''
			html += `<td>${escapeHtml(text)}</td>`
		}

		html += `</tr>`
	}

	html += `</tbody></table></div><p>`
	return html
}

function renderEmbeddedOracle(oracle: Record<string, unknown>): string {
	const rows = oracle.rows as Array<Record<string, unknown>> | undefined
	if (!rows || rows.length === 0) return ''

	let html = `</p><div class="embedded-oracle-table"><table><thead><tr><th class="roll-col">Roll</th><th>Result</th></tr></thead><tbody>`

	for (const row of rows) {
		const roll = row.roll as Record<string, number> | undefined
		const text = row.text as string

		let rollStr = ''
		if (roll) {
			rollStr = roll.min === roll.max ? `${roll.min}` : `${roll.min}–${roll.max}`
		}

		// Render text as markdown for links
		const renderedText = text ? renderMarkdown(text) : ''

		html += `<tr><td class="roll-cell">${rollStr}</td><td>${renderedText}</td></tr>`
	}

	html += `</tbody></table></div><p>`
	return html
}

function renderAsset(asset: Datasworn.Asset): string {
	let html = '<div class="asset-card">'

	// Category
	if (asset.category) {
		html += `<div class="asset-category">${escapeHtml(asset.category)}</div>`
	}

	// Requirement
	if (asset.requirement) {
		html += `<div class="asset-requirement">${renderMarkdown(asset.requirement)}</div>`
	}

	// Options (inputs)
	if (asset.options && Object.keys(asset.options).length > 0) {
		html += `<div class="asset-options">`
		for (const [key, option] of Object.entries(asset.options)) {
			const label = option.label || formatLabel(key)
			html += `<div class="asset-option"><span class="option-label">${escapeHtml(label)}:</span> <span class="option-field">___________</span></div>`
		}
		html += `</div>`
	}

	// Abilities
	if (asset.abilities && asset.abilities.length > 0) {
		html += `<div class="asset-abilities">`

		for (const ability of asset.abilities) {
			html += `
				<div class="ability ${ability.enabled ? 'ability-enabled' : ''}">
					<div class="ability-checkbox">${ability.enabled ? '◆' : '◇'}</div>
					<div class="ability-content">
						${ability.name ? `<strong>${escapeHtml(ability.name)}:</strong> ` : ''}
						${ability.text ? renderMarkdown(ability.text) : ''}
					</div>
				</div>
			`
		}

		html += `</div>`
	}

	// Health/integrity track
	if (asset.controls) {
		for (const [key, control] of Object.entries(asset.controls)) {
			if (control.field_type === 'condition_meter') {
				const max = control.max || 5
				const label = control.label || formatLabel(key)
				html += `
					<div class="asset-meter">
						<span class="meter-label">${escapeHtml(label)}</span>
						<div class="meter-track">
							${Array.from({ length: max }, (_, i) => `<div class="meter-box">${max - i}</div>`).join('')}
						</div>
					</div>
				`
			}
		}
	}

	html += '</div>'
	return html
}

function renderOracle(oracle: Datasworn.OracleRollable): string {
	let html = ''

	// Summary (check if property exists since not all oracle types have it)
	const summary = (oracle as { summary?: string }).summary
	if (summary) {
		html += `<div class="oracle-summary">${renderMarkdown(summary)}</div>`
	}

	// Dice info
	if (oracle.dice) {
		html += `<div class="dice-badge">${oracle.dice}</div>`
	}

	// Rows (table)
	if (oracle.rows && oracle.rows.length > 0) {
		html += `<div class="oracle-table"><table><thead><tr><th class="roll-col">Roll</th><th>Result</th></tr></thead><tbody>`

		for (const row of oracle.rows) {
			let rollStr = ''
			if (row.roll) {
				rollStr = row.roll.min === row.roll.max ? `${row.roll.min}` : `${row.roll.min}–${row.roll.max}`
			}

			const text = 'text' in row ? row.text : undefined
			const text2 = 'text2' in row ? (row as { text2?: string }).text2 : undefined

			html += `<tr><td class="roll-cell">${rollStr}</td><td>${text ? renderMarkdown(text) : ''}${text2 ? `<div class="oracle-text2">${renderMarkdown(text2)}</div>` : ''}</td></tr>`
		}

		html += `</tbody></table></div>`
	}

	return html
}

function renderNpc(npc: Datasworn.Npc): string {
	let html = '<div class="npc-card">'

	// Nature
	if (npc.nature) {
		html += `<div class="npc-nature">${escapeHtml(npc.nature)}</div>`
	}

	// Summary
	if (npc.summary) {
		html += `<div class="npc-summary">${renderMarkdown(npc.summary)}</div>`
	}

	// Description
	if (npc.description) {
		html += `<div class="npc-description">${renderMarkdown(npc.description)}</div>`
	}

	// Features
	if (npc.features && npc.features.length > 0) {
		html += `<div class="npc-section"><div class="npc-section-title">Features</div><ul class="npc-list">`
		for (const f of npc.features) {
			html += `<li>${renderMarkdown(f)}</li>`
		}
		html += `</ul></div>`
	}

	// Drives
	if (npc.drives && npc.drives.length > 0) {
		html += `<div class="npc-section"><div class="npc-section-title">Drives</div><ul class="npc-list">`
		for (const d of npc.drives) {
			html += `<li>${renderMarkdown(d)}</li>`
		}
		html += `</ul></div>`
	}

	// Tactics
	if (npc.tactics && npc.tactics.length > 0) {
		html += `<div class="npc-section"><div class="npc-section-title">Tactics</div><ul class="npc-list">`
		for (const t of npc.tactics) {
			html += `<li>${renderMarkdown(t)}</li>`
		}
		html += `</ul></div>`
	}

	// Rank
	if (npc.rank !== undefined) {
		const rankLabels: Record<number, string> = {
			1: 'Troublesome',
			2: 'Dangerous',
			3: 'Formidable',
			4: 'Extreme',
			5: 'Epic'
		}
		const rankLabel = rankLabels[npc.rank] || `Rank ${npc.rank}`
		html += `<div class="npc-rank"><strong>Rank:</strong> ${rankLabel}</div>`
	}

	html += '</div>'
	return html
}

function renderAtlasEntry(entry: Datasworn.AtlasEntry): string {
	let html = '<div class="atlas-card">'

	if (entry.summary) {
		html += `<div class="atlas-summary">${renderMarkdown(entry.summary)}</div>`
	}

	if (entry.description) {
		html += `<div class="atlas-description">${renderMarkdown(entry.description)}</div>`
	}

	if (entry.features && entry.features.length > 0) {
		html += `<div class="atlas-section"><div class="atlas-section-title">Features</div><ul class="atlas-list">`
		for (const f of entry.features) {
			html += `<li>${renderMarkdown(f)}</li>`
		}
		html += `</ul></div>`
	}

	html += '</div>'
	return html
}

function renderTruth(truth: Datasworn.Truth): string {
	let html = '<div class="truth-card">'

	// Summary may not exist on all Truth types
	const summary = (truth as { summary?: string }).summary
	if (summary) {
		html += `<div class="truth-summary">${renderMarkdown(summary)}</div>`
	}

	// Options
	if (truth.options && truth.options.length > 0) {
		html += `<div class="truth-options">`
		for (let i = 0; i < truth.options.length; i++) {
			const opt = truth.options[i]
			html += `
				<div class="truth-option">
					<div class="truth-option-header">
						<span class="truth-option-number">${i + 1}</span>
						${opt.summary ? `<span class="truth-option-summary">${escapeHtml(opt.summary)}</span>` : ''}
					</div>
					${opt.description ? `<div class="truth-option-desc">${renderMarkdown(opt.description)}</div>` : ''}
					${opt.quest_starter ? `<div class="truth-quest"><strong>Quest Starter:</strong> ${renderMarkdown(opt.quest_starter)}</div>` : ''}
				</div>
			`
		}
		html += `</div>`
	}

	html += '</div>'
	return html
}

type CollectionType = Datasworn.MoveCategory | Datasworn.AssetCollection | Datasworn.OracleCollection | Datasworn.NpcCollection | Datasworn.AtlasCollection

function renderCollection(collection: CollectionType): string {
	let html = '<div class="collection-card">'

	// Summary (may not exist on all collection types)
	const summary = (collection as { summary?: string }).summary
	if (summary) {
		html += `<div class="collection-summary">${renderMarkdown(summary)}</div>`
	}

	// Description
	if (collection.description) {
		html += `<div class="collection-description">${renderMarkdown(collection.description)}</div>`
	}

	// Contents
	if ('contents' in collection && collection.contents) {
		const items = Object.values(collection.contents)
		html += `<div class="collection-section"><div class="collection-section-title">Contents (${items.length})</div><div class="collection-grid">`
		for (const item of items) {
			const itemName = item.name || item._id || 'Unknown'
			const itemType = item.type
			html += `<div class="collection-item"><span class="item-name">${escapeHtml(itemName)}</span>${itemType ? `<span class="item-type">${itemType}</span>` : ''}</div>`
		}
		html += `</div></div>`
	}

	// Sub-collections
	if ('collections' in collection && collection.collections) {
		const items = Object.values(collection.collections)
		html += `<div class="collection-section"><div class="collection-section-title">Sub-collections (${items.length})</div><div class="collection-grid">`
		for (const item of items) {
			const itemName = item.name || item._id || 'Unknown'
			html += `<div class="collection-item collection-folder"><span class="item-name">${escapeHtml(itemName)}</span></div>`
		}
		html += `</div></div>`
	}

	html += '</div>'
	return html
}

function renderGeneric(obj: Record<string, unknown>): string {
	let html = '<div class="generic-card">'

	const textFields = ['summary', 'description', 'text']
	let hasTextContent = false
	for (const field of textFields) {
		if (obj[field] && typeof obj[field] === 'string') {
			html += `<div class="generic-field">${renderMarkdown(obj[field] as string)}</div>`
			hasTextContent = true
		}
	}

	const contents = obj.contents as Record<string, unknown> | undefined
	if (contents) {
		const count = Object.keys(contents).length
		html += `<div class="generic-meta"><strong>Contents:</strong> ${count} items</div>`
	}

	const collections = obj.collections as Record<string, unknown> | undefined
	if (collections) {
		const count = Object.keys(collections).length
		html += `<div class="generic-meta"><strong>Collections:</strong> ${count} items</div>`
	}

	// If no text content and no contents/collections, check if this is a container of items
	if (!hasTextContent && !contents && !collections) {
		const childItems = Object.entries(obj).filter(([key, value]) => {
			if (key.startsWith('_') || key === 'type' || key === 'name') return false
			return value && typeof value === 'object' && !Array.isArray(value)
		})

		if (childItems.length > 0) {
			html += `<div class="collection-section"><div class="collection-section-title">Contains ${childItems.length} items</div><div class="collection-grid">`
			for (const [key, value] of childItems) {
				const item = value as Record<string, unknown>
				const itemName = (typeof item.name === 'string' ? item.name : null)
					|| (typeof item.label === 'string' ? item.label : null)
					|| (typeof item._id === 'string' ? item._id : null)
					|| formatLabel(key)
				const itemType = typeof item.type === 'string' ? item.type : undefined
				html += `<div class="collection-item"><span class="item-name">${escapeHtml(itemName)}</span>${itemType ? `<span class="item-type">${formatLabel(itemType)}</span>` : ''}</div>`
			}
			html += `</div></div>`
		}
	}

	html += '</div>'
	return html
}

function formatLabel(key: string): string {
	return key
		.replace(/_/g, ' ')
		.replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatOutcome(key: string): string {
	const labels: Record<string, string> = {
		strong_hit: 'Strong Hit',
		weak_hit: 'Weak Hit',
		miss: 'Miss'
	}
	return labels[key] || formatLabel(key)
}

function escapeHtml(text: string): string {
	const div = document.createElement('div')
	div.textContent = text
	return div.innerHTML
}
