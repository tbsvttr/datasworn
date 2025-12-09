import { state } from '../state'
import { getRulesetDisplayName } from '../utils/loader'
import { createTree } from './Tree'

export function createSidebar(container: HTMLElement): void {
	const sidebar = document.createElement('div')
	sidebar.className = 'sidebar'
	container.appendChild(sidebar)

	// Header with ruleset selector
	const header = document.createElement('div')
	header.className = 'sidebar-header'
	header.innerHTML = `
		<h1>Datasworn Viewer</h1>
		<select id="ruleset-select">
			<option value="">Loading...</option>
		</select>
	`
	sidebar.appendChild(header)

	// Set up select change handler
	const select = header.querySelector('#ruleset-select') as HTMLSelectElement
	select.addEventListener('change', () => {
		if (select.value) {
			state.selectRuleset(select.value)
		}
	})

	// Update select options when rulesets load
	state.subscribe((s) => {
		if (s.loading) return

		select.innerHTML = ''

		for (const [id, pkg] of s.rulesets) {
			const option = document.createElement('option')
			option.value = id
			option.textContent = getRulesetDisplayName(pkg)
			option.selected = id === s.currentRuleset
			select.appendChild(option)
		}
	})

	// Create tree container
	createTree(sidebar)
}
