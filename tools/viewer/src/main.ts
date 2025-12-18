/**
 * Main entry point for the Datasworn Viewer
 */

import { createApp } from './components/App'
import { loadAllRulesets } from './utils/loader'
import { state } from './state'
import { rollDice, isMatch, isInRange } from './utils/dice'
import { ROLL_DATA_ATTR } from './renderers/OracleRenderer'
import type { OracleRow } from './types'

/** Initialize the application */
async function init() {
	const app = document.getElementById('app')
	if (!app) {
		console.error('App container not found')
		return
	}

	// Show loading state
	app.innerHTML = '<div class="loading">Loading rulesets...</div>'

	try {
		const rulesets = await loadAllRulesets()
		app.innerHTML = ''
		createApp(app)
		state.setRulesets(rulesets)
		console.log(`Loaded ${rulesets.size} rulesets`)

		// Handle initial URL hash
		if (window.location.hash) {
			const id = window.location.hash.slice(1)
			state.navigateToId(id, false)
		}

		// Handle browser navigation
		window.addEventListener('popstate', (e) => {
			const id = e.state?.itemId || window.location.hash.slice(1)
			if (id) {
				state.navigateToId(id, false)
			}
		})

		// Set up global event delegation for roll buttons
		setupRollHandlers(app)
	} catch (e) {
		console.error('Failed to load rulesets:', e)
		app.innerHTML = `<div class="loading">Failed to load data. Make sure you're running from the datasworn root.</div>`
	}
}

/** Set up event delegation for all roll-related interactions */
function setupRollHandlers(container: HTMLElement): void {
	container.addEventListener('click', (e) => {
		const target = e.target as HTMLElement
		const button = target.closest('[' + ROLL_DATA_ATTR + ']') as HTMLElement | null

		if (!button) return

		const rollInfoStr = button.getAttribute(ROLL_DATA_ATTR)
		if (!rollInfoStr) return

		try {
			const rollInfo = JSON.parse(decodeURIComponent(rollInfoStr))
			handleRoll(rollInfo, button)
		} catch (err) {
			console.error('Failed to parse roll info:', err)
		}
	})

	// Legacy support for inline onclick handlers (odds buttons)
	// These use data-rows attribute directly
	container.addEventListener('click', (e) => {
		const target = e.target as HTMLElement
		const button = target.closest('.odds-button:not([' + ROLL_DATA_ATTR + '])') as HTMLButtonElement | null

		if (!button) return

		const rowsData = button.getAttribute('data-rows')
		if (!rowsData) return

		handleOddsRoll(button, rowsData)
	})
}

interface RollInfo {
	type: 'oracle' | 'odds'
	tableId: string
	dice?: string
	rows?: OracleRow[]
}

/** Handle a roll based on roll info */
function handleRoll(info: RollInfo, button: HTMLElement): void {
	if (info.type === 'oracle') {
		handleOracleRoll(info.tableId, info.dice || '1d100')
	} else if (info.type === 'odds' && info.rows) {
		handleOddsRollFromInfo(info, button)
	}
}

/** Handle rolling on a standard oracle table */
function handleOracleRoll(tableId: string, dice: string): void {
	const roll = rollDice(dice)
	const result = highlightResult(tableId, roll)

	const resultDiv = document.getElementById(`${tableId}-result`)
	if (resultDiv) {
		resultDiv.innerHTML = `<strong>Rolled ${roll}:</strong> ${result || 'No result'}`
		resultDiv.classList.add('show')
	}
}

/** Handle rolling odds from RollInfo */
function handleOddsRollFromInfo(info: RollInfo, button: HTMLElement): void {
	const roll = rollDice('1d100')
	const rows = info.rows || []

	// Find matching result
	let resultText = 'No result'
	for (const row of rows) {
		if (row.roll && isInRange(roll, row.roll)) {
			resultText = row.text || 'No result'
			break
		}
	}

	const matchResult = isMatch(roll)
	updateOddsResult(roll, resultText, matchResult, button)
}

/** Handle legacy odds roll (from data-rows attribute) */
function handleOddsRoll(button: HTMLButtonElement, rowsData: string): void {
	const rows = JSON.parse(rowsData) as OracleRow[]
	const roll = rollDice('1d100')

	// Find matching result
	let resultText = 'No result'
	for (const row of rows) {
		if (row.roll && isInRange(roll, row.roll)) {
			resultText = row.text || 'No result'
			break
		}
	}

	const matchResult = isMatch(roll)
	updateOddsResult(roll, resultText, matchResult, button)
}

/** Update the odds result display */
function updateOddsResult(roll: number, resultText: string, matchResult: boolean, button: HTMLElement): void {
	const resultDiv = document.getElementById('odds-result')
	if (resultDiv) {
		const oddsName = button.querySelector('.odds-name')?.textContent || ''
		let html = `<strong>Rolled ${roll}</strong> (${oddsName}): <span class="odds-answer odds-${resultText.toLowerCase()}">${resultText}</span>`
		if (matchResult) {
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

/** Find matching row and highlight it in the table */
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

// Legacy global functions for backwards compatibility with inline onclick handlers
declare global {
	interface Window {
		rollOracle: (tableId: string, dice: string) => void
		rollOracleColumns: (tableId: string) => void
		rollOdds: (button: HTMLButtonElement) => void
	}
}

window.rollOracle = handleOracleRoll
window.rollOracleColumns = (tableId: string) => handleOracleRoll(tableId, '1d100')
window.rollOdds = (button: HTMLButtonElement) => {
	const rowsData = button.getAttribute('data-rows')
	if (rowsData) handleOddsRoll(button, rowsData)
}

init()
