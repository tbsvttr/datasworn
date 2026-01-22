import { state } from '../state'
import { getRulesetDisplayName } from '../utils/loader'
import { searchItems, type SearchResult } from '../utils/search'
import { createTree, expandAllNodes, collapseAllNodes, setTreeFilter, type TreeFilter } from './Tree'
import { escapeHtml } from '../utils/html'
import { formatType } from '../utils/formatting'

function getTheme(): 'dark' | 'light' {
	return (localStorage.getItem('theme') as 'dark' | 'light') || 'dark'
}

function setTheme(theme: 'dark' | 'light'): void {
	localStorage.setItem('theme', theme)
	if (theme === 'light') {
		document.documentElement.setAttribute('data-theme', 'light')
	} else {
		document.documentElement.removeAttribute('data-theme')
	}
}

function getFilter(): TreeFilter {
	return (localStorage.getItem('treeFilter') as TreeFilter) || 'all'
}

function setFilter(filter: TreeFilter): void {
	localStorage.setItem('treeFilter', filter)
	setTreeFilter(filter)
}

// Initialize theme on load
setTheme(getTheme())

export function createSidebar(container: HTMLElement): void {
	const sidebar = document.createElement('div')
	sidebar.className = 'sidebar'
	container.appendChild(sidebar)

	// Header with ruleset selector and search
	const header = document.createElement('div')
	header.className = 'sidebar-header'
	header.innerHTML = `
		<h1>Datasworn Viewer</h1>
		<select id="ruleset-select">
			<option value="">Loading...</option>
		</select>
		<div class="search-container">
			<input type="text" id="search-input" placeholder="Search... (press /)" autocomplete="off" />
			<button id="search-clear" class="search-clear" aria-label="Clear search">×</button>
		</div>
		<div class="sidebar-toolbar">
			<button id="expand-all" class="toolbar-btn" title="Expand all">▼ Expand</button>
			<button id="collapse-all" class="toolbar-btn" title="Collapse all">▶ Collapse</button>
			<button id="theme-toggle" class="toolbar-btn" title="Toggle theme">☀ Light</button>
		</div>
		<div class="filter-toolbar">
			<button class="filter-btn active" data-filter="all" title="Show all">All</button>
			<button class="filter-btn" data-filter="moves" title="Show moves only">⚔️ Moves</button>
			<button class="filter-btn" data-filter="assets" title="Show assets only">🎴 Assets</button>
			<button class="filter-btn" data-filter="oracles" title="Show oracles only">🎲 Oracles</button>
		</div>
	`
	sidebar.appendChild(header)

	// Set up select change handler
	const select = header.querySelector('#ruleset-select') as HTMLSelectElement
	select.addEventListener('change', () => {
		if (select.value) {
			state.selectRuleset(select.value)
		}
	})

	// Search input
	const searchInput = header.querySelector('#search-input') as HTMLInputElement
	const searchClear = header.querySelector('#search-clear') as HTMLButtonElement

	// Create tree container
	const treeContainer = document.createElement('div')
	treeContainer.className = 'tree-container'
	sidebar.appendChild(treeContainer)

	// Create search results container (hidden by default)
	const searchResults = document.createElement('div')
	searchResults.className = 'search-results'
	searchResults.style.display = 'none'
	sidebar.appendChild(searchResults)

	// Tree is created inside tree container
	createTree(treeContainer)

	// Toolbar buttons
	const expandAllBtn = header.querySelector('#expand-all') as HTMLButtonElement
	const collapseAllBtn = header.querySelector('#collapse-all') as HTMLButtonElement
	const themeToggleBtn = header.querySelector('#theme-toggle') as HTMLButtonElement

	expandAllBtn.addEventListener('click', () => {
		expandAllNodes(treeContainer)
	})

	collapseAllBtn.addEventListener('click', () => {
		collapseAllNodes(treeContainer)
	})

	// Update theme button text based on current theme
	const updateThemeButton = () => {
		const isDark = getTheme() === 'dark'
		themeToggleBtn.textContent = isDark ? '☀ Light' : '🌙 Dark'
	}
	updateThemeButton()

	themeToggleBtn.addEventListener('click', () => {
		const newTheme = getTheme() === 'dark' ? 'light' : 'dark'
		setTheme(newTheme)
		updateThemeButton()
	})

	// Filter buttons
	const filterButtons = header.querySelectorAll('.filter-btn') as NodeListOf<HTMLButtonElement>

	const updateFilterButtons = (activeFilter: TreeFilter) => {
		filterButtons.forEach((btn) => {
			const btnFilter = btn.dataset.filter as TreeFilter
			btn.classList.toggle('active', btnFilter === activeFilter)
		})
	}

	// Initialize filter from localStorage
	const initialFilter = getFilter()
	updateFilterButtons(initialFilter)
	setFilter(initialFilter)

	filterButtons.forEach((btn) => {
		btn.addEventListener('click', () => {
			const filter = btn.dataset.filter as TreeFilter
			setFilter(filter)
			updateFilterButtons(filter)
		})
	})

	let searchTimeout: ReturnType<typeof setTimeout> | null = null

	searchInput.addEventListener('input', () => {
		const query = searchInput.value.trim()

		// Update clear button visibility
		searchClear.style.display = query ? 'block' : 'none'

		// Debounce search
		if (searchTimeout) clearTimeout(searchTimeout)
		searchTimeout = setTimeout(() => {
			performSearch(query, treeContainer, searchResults)
		}, 150)
	})

	searchClear.addEventListener('click', () => {
		searchInput.value = ''
		searchClear.style.display = 'none'
		treeContainer.style.display = 'block'
		searchResults.style.display = 'none'
		searchInput.focus()
	})

	// Keyboard shortcut: / to focus search
	document.addEventListener('keydown', (e) => {
		if (e.key === '/' && document.activeElement !== searchInput) {
			e.preventDefault()
			searchInput.focus()
			searchInput.select()
		}
		// Escape to clear search
		if (e.key === 'Escape' && document.activeElement === searchInput) {
			searchInput.value = ''
			searchClear.style.display = 'none'
			treeContainer.style.display = 'block'
			searchResults.style.display = 'none'
			searchInput.blur()
		}
	})

	// Handle clicking on search results
	searchResults.addEventListener('click', (e) => {
		const target = e.target as HTMLElement
		const resultItem = target.closest('.search-result-item') as HTMLElement | null
		if (resultItem) {
			const id = resultItem.dataset.id
			if (id) {
				state.navigateToId(id)
				// Clear search after navigation
				searchInput.value = ''
				searchClear.style.display = 'none'
				treeContainer.style.display = 'block'
				searchResults.style.display = 'none'
			}
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
}

function performSearch(
	query: string,
	treeContainer: HTMLElement,
	searchResults: HTMLElement
): void {
	if (!query) {
		treeContainer.style.display = 'block'
		searchResults.style.display = 'none'
		return
	}

	const ruleset = state.getCurrentRuleset()
	if (!ruleset) return

	const results = searchItems(ruleset, query)

	if (results.length === 0) {
		treeContainer.style.display = 'none'
		searchResults.style.display = 'block'
		searchResults.innerHTML = `<div class="search-no-results">No results for "${escapeHtml(query)}"</div>`
		return
	}

	treeContainer.style.display = 'none'
	searchResults.style.display = 'block'
	searchResults.innerHTML = renderSearchResults(results)
}

function renderSearchResults(results: SearchResult[]): string {
	let html = `<div class="search-results-count">${results.length} result${results.length === 1 ? '' : 's'}</div>`

	for (const result of results) {
		html += `
			<div class="search-result-item" data-id="${escapeHtml(result.id)}">
				<span class="search-result-type type-${result.type}">${formatType(result.type)}</span>
				<span class="search-result-name">${escapeHtml(result.name)}</span>
			</div>
		`
	}

	return html
}
