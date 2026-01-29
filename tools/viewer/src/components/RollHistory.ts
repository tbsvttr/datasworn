import { state, type RollHistoryEntry } from '../state'
import { escapeHtml } from '../utils/html'

export function createRollHistoryPanel(container: HTMLElement): void {
	const panel = document.createElement('div')
	panel.className = 'roll-history-panel'
	panel.innerHTML = `
		<div class="roll-history-header">
			<h3>Roll History</h3>
			<button class="roll-history-clear" title="Clear history">Clear</button>
			<button class="roll-history-toggle" title="Toggle panel">−</button>
		</div>
		<div class="roll-history-content"></div>
	`
	container.appendChild(panel)

	const content = panel.querySelector('.roll-history-content') as HTMLElement
	const clearBtn = panel.querySelector('.roll-history-clear') as HTMLButtonElement
	const toggleBtn = panel.querySelector('.roll-history-toggle') as HTMLButtonElement

	// Toggle panel collapse
	let collapsed = localStorage.getItem('rollHistoryCollapsed') === 'true'
	if (collapsed) {
		panel.classList.add('collapsed')
		toggleBtn.textContent = '+'
	}

	toggleBtn.addEventListener('click', () => {
		collapsed = !collapsed
		panel.classList.toggle('collapsed', collapsed)
		toggleBtn.textContent = collapsed ? '+' : '−'
		localStorage.setItem('rollHistoryCollapsed', String(collapsed))
	})

	// Clear history
	clearBtn.addEventListener('click', () => {
		state.clearRollHistory()
	})

	// Update on state change
	state.subscribe((s) => {
		content.innerHTML = renderRollHistory(s.rollHistory)
	})
}

function renderRollHistory(history: RollHistoryEntry[]): string {
	if (history.length === 0) {
		return '<div class="roll-history-empty">No rolls yet</div>'
	}

	let html = ''
	for (const entry of history) {
		const time = entry.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
		const oracleName = entry.oracleName ? escapeHtml(entry.oracleName) : 'Oracle'

		html += `
			<div class="roll-history-entry">
				<span class="roll-history-time">${time}</span>
				<span class="roll-history-oracle">${oracleName}</span>
				<span class="roll-history-dice">${escapeHtml(entry.dice)}: <strong>${entry.roll}</strong></span>
				<span class="roll-history-result">${escapeHtml(entry.result)}</span>
			</div>
		`
	}

	return html
}
