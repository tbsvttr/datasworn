import { marked } from 'marked'

// Configure marked for safe rendering
marked.setOptions({
	gfm: true,
	breaks: true
})

export function renderMarkdown(text: string): string {
	if (!text) return ''

	// Convert Datasworn-style bold (__text__) to standard markdown (**text**)
	const normalized = text.replace(/__([^_]+)__/g, '**$1**')

	return marked.parse(normalized) as string
}

export function escapeHtml(text: string): string {
	const div = document.createElement('div')
	div.textContent = text
	return div.innerHTML
}
