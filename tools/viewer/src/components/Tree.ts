import { state } from '../state'

interface TreeNodeData {
	key: string
	label: string
	type?: string
	value: unknown
	children?: TreeNodeData[]
}

const CATEGORY_ORDER = ['moves', 'assets', 'oracles', 'rules', 'truths', 'atlas', 'npcs']
const ICONS: Record<string, string> = {
	moves: '⚔️',
	assets: '🎴',
	oracles: '🎲',
	rules: '📋',
	truths: '📜',
	atlas: '🗺️',
	npcs: '👤',
	move_category: '📁',
	move: '⚔️',
	asset_collection: '📁',
	asset: '🎴',
	oracle_collection: '📁',
	oracle_rollable: '🎲',
	default: '📄'
}

export function createTree(container: HTMLElement): void {
	const treeContainer = document.createElement('div')
	treeContainer.className = 'tree-container'
	container.appendChild(treeContainer)

	let currentRulesetId: string | null = null

	// Listen for navigation events to expand tree to the target path
	window.addEventListener('datasworn-navigate', ((e: CustomEvent<{ path: string[] }>) => {
		const path = e.detail.path
		expandAndSelectPath(treeContainer, path)
	}) as EventListener)

	state.subscribe((s) => {
		// Only rebuild tree when ruleset changes, not on every state change
		if (s.currentRuleset === currentRulesetId) {
			return
		}
		currentRulesetId = s.currentRuleset

		const ruleset = state.getCurrentRuleset()
		if (!ruleset) {
			treeContainer.innerHTML = '<div class="loading">Select a ruleset</div>'
			return
		}

		treeContainer.innerHTML = ''
		const nodes = buildTreeNodes(ruleset)
		for (const node of nodes) {
			treeContainer.appendChild(createTreeNode(node, [node.key]))
		}
	})
}

function expandAndSelectPath(container: HTMLElement, path: string[]): void {
	// Clear previous selection
	container.querySelectorAll('.tree-node-header.selected').forEach((el) => {
		el.classList.remove('selected')
	})

	// Walk the path and expand each level
	let currentContainer: Element = container

	for (let i = 0; i < path.length; i++) {
		const key = path[i]
		const isLast = i === path.length - 1

		// Find the node with this key at the current level
		const nodes = currentContainer.querySelectorAll(':scope > .tree-node')
		for (const node of nodes) {
			const header = node.querySelector(':scope > .tree-node-header')
			const nodeKey = (node as HTMLElement).dataset.key

			if (nodeKey === key) {
				if (isLast) {
					// Select this node
					header?.classList.add('selected')
					header?.scrollIntoView({ behavior: 'smooth', block: 'center' })
				} else {
					// Expand this node
					const toggle = header?.querySelector('.tree-toggle')
					const children = node.querySelector(':scope > .tree-children')
					if (toggle && children) {
						toggle.classList.add('expanded')
						children.classList.remove('collapsed')
						currentContainer = children
					}
				}
				break
			}
		}
	}
}

function buildTreeNodes(data: Record<string, unknown>): TreeNodeData[] {
	const nodes: TreeNodeData[] = []

	// Add categories in order
	for (const key of CATEGORY_ORDER) {
		if (data[key] && typeof data[key] === 'object') {
			nodes.push({
				key,
				label: formatLabel(key),
				type: key,
				value: data[key],
				children: buildChildNodes(data[key] as Record<string, unknown>)
			})
		}
	}

	return nodes
}

function buildChildNodes(data: Record<string, unknown>): TreeNodeData[] {
	const nodes: TreeNodeData[] = []

	for (const [key, value] of Object.entries(data)) {
		if (key.startsWith('_')) continue
		if (typeof value !== 'object' || value === null) continue

		const obj = value as Record<string, unknown>
		const type = typeof obj.type === 'string' ? obj.type : undefined
		const name = typeof obj.name === 'string' ? obj.name : formatLabel(key)

		const node: TreeNodeData = {
			key,
			label: name,
			type,
			value
		}

		// Check for nested content
		const contents = obj.contents as Record<string, unknown> | undefined
		const collections = obj.collections as Record<string, unknown> | undefined

		const children: TreeNodeData[] = []

		if (contents && typeof contents === 'object') {
			children.push(...buildChildNodes(contents))
		}

		if (collections && typeof collections === 'object') {
			children.push(...buildChildNodes(collections))
		}

		if (children.length > 0) {
			node.children = children
		}

		nodes.push(node)
	}

	return nodes
}

function createTreeNode(node: TreeNodeData, path: string[]): HTMLElement {
	const el = document.createElement('div')
	el.className = 'tree-node'
	el.dataset.key = node.key

	const hasChildren = node.children && node.children.length > 0

	// Header
	const header = document.createElement('div')
	header.className = 'tree-node-header'
	header.innerHTML = `
		<span class="tree-toggle ${hasChildren ? '' : 'empty'}">${hasChildren ? '▶' : ''}</span>
		<span class="tree-icon">${getIcon(node.type || node.key)}</span>
		<span class="tree-label">${node.label}</span>
		${node.type ? `<span class="tree-type">${node.type}</span>` : ''}
	`

	header.addEventListener('click', (e) => {
		e.stopPropagation()

		// Toggle expansion
		if (hasChildren) {
			const toggle = header.querySelector('.tree-toggle')
			const children = el.querySelector('.tree-children')
			if (toggle && children) {
				toggle.classList.toggle('expanded')
				children.classList.toggle('collapsed')
			}
		}

		// Select item
		state.selectItem(path, node.value)

		// Update selected state
		document.querySelectorAll('.tree-node-header.selected').forEach((el) => {
			el.classList.remove('selected')
		})
		header.classList.add('selected')
	})

	el.appendChild(header)

	// Children
	if (hasChildren) {
		const childrenContainer = document.createElement('div')
		childrenContainer.className = 'tree-children collapsed'

		for (const child of node.children!) {
			childrenContainer.appendChild(createTreeNode(child, [...path, child.key]))
		}

		el.appendChild(childrenContainer)
	}

	return el
}

function formatLabel(key: string): string {
	return key
		.replace(/_/g, ' ')
		.replace(/\b\w/g, (c) => c.toUpperCase())
}

function getIcon(type: string): string {
	return ICONS[type] || ICONS.default
}
