import { createApp } from './components/App'
import { loadAllRulesets } from './utils/loader'
import { state } from './state'

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
