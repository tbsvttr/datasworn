import { createApp } from './components/App'
import { loadAllRulesets } from './utils/loader'
import { state } from './state'

// Extend window for roll functions
declare global {
	interface Window {
		rollOracle: (tableId: string, dice: string) => void
		rollOracleColumns: (tableId: string) => void
		rollOdds: (button: HTMLButtonElement) => void
	}
}

// Parse dice notation like "1d100", "1d6", "2d10"
function parseDice(dice: string): { count: number; sides: number } {
	const match = dice.match(/(\d+)d(\d+)/i)
	if (match) {
		return { count: parseInt(match[1]), sides: parseInt(match[2]) }
	}
	return { count: 1, sides: 100 }
}

// Roll dice and return total
function rollDice(dice: string): number {
	const { count, sides } = parseDice(dice)
	let total = 0
	for (let i = 0; i < count; i++) {
		total += Math.floor(Math.random() * sides) + 1
	}
	return total
}

// Find matching row and highlight it
function highlightResult(tableId: string, roll: number): string | null {
	const table = document.getElementById(tableId)
	if (!table) return null

	const rows = table.querySelectorAll('tbody tr')
	let resultText: string | null = null

	rows.forEach((row) => {
		row.classList.remove('roll-highlight')
		const min = parseInt(row.getAttribute('data-min') || '0')
		const max = parseInt(row.getAttribute('data-max') || '0')

		if (roll >= min && roll <= max) {
			row.classList.add('roll-highlight')
			const resultCell = row.querySelector('td:last-child')
			resultText = resultCell?.textContent || null
		}
	})

	return resultText
}

// Global roll function for single-column oracles
window.rollOracle = (tableId: string, dice: string) => {
	const roll = rollDice(dice)
	const result = highlightResult(tableId, roll)

	const resultDiv = document.getElementById(`${tableId}-result`)
	if (resultDiv) {
		resultDiv.innerHTML = `<strong>Rolled ${roll}:</strong> ${result || 'No result'}`
		resultDiv.classList.add('show')
	}
}

// Global roll function for multi-column oracles (like Ask the Oracle)
window.rollOracleColumns = (tableId: string) => {
	const roll = rollDice('1d100')
	highlightResult(tableId, roll)

	const resultDiv = document.getElementById(`${tableId}-result`)
	if (resultDiv) {
		resultDiv.innerHTML = `<strong>Rolled ${roll}</strong>`
		resultDiv.classList.add('show')
	}
}

// Global roll function for odds-based oracles (Ask the Oracle)
window.rollOdds = (button: HTMLButtonElement) => {
	const rowsData = button.getAttribute('data-rows')
	if (!rowsData) return

	const rows = JSON.parse(rowsData) as Array<{ roll?: { min: number; max: number }; text?: string }>
	const roll = rollDice('1d100')

	// Find matching result
	let resultText = 'No result'
	for (const row of rows) {
		if (row.roll && roll >= row.roll.min && roll <= row.roll.max) {
			resultText = row.text || 'No result'
			break
		}
	}

	// Check for match (doubles like 11, 22, 33, etc.)
	const isMatch = roll >= 11 && roll <= 99 && roll % 11 === 0

	// Update result display
	const resultDiv = document.getElementById('odds-result')
	if (resultDiv) {
		const oddsName = button.querySelector('.odds-name')?.textContent || ''
		let html = `<strong>Rolled ${roll}</strong> (${oddsName}): <span class="odds-answer odds-${resultText.toLowerCase()}">${resultText}</span>`
		if (isMatch) {
			html += ` <span class="odds-match">Match! An extreme result or twist has occurred.</span>`
		}
		resultDiv.innerHTML = html
		resultDiv.classList.add('show')
	}

	// Highlight the clicked button
	const allButtons = document.querySelectorAll('.odds-button')
	allButtons.forEach((b) => b.classList.remove('selected'))
	button.classList.add('selected')
}

async function init() {
	const app = document.getElementById('app')
	if (!app) {
		console.error('App container not found')
		return
	}

	// Show loading state
	app.innerHTML = '<div class="loading">Loading rulesets...</div>'

	// Load data first
	try {
		const rulesets = await loadAllRulesets()
		// Clear loading message and create app
		app.innerHTML = ''
		createApp(app)
		state.setRulesets(rulesets)
		console.log(`Loaded ${rulesets.size} rulesets`)

		// Handle initial URL hash (for direct links)
		if (window.location.hash) {
			const id = window.location.hash.slice(1)
			state.navigateToId(id, false)
		}

		// Handle browser back/forward navigation
		window.addEventListener('popstate', (e) => {
			const id = e.state?.itemId || window.location.hash.slice(1)
			if (id) {
				state.navigateToId(id, false)
			}
		})
	} catch (e) {
		console.error('Failed to load rulesets:', e)
		app.innerHTML = `<div class="loading">Failed to load data. Make sure you're running from the datasworn root.</div>`
	}
}

init()
