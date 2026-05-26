import DOMPurify from 'dompurify'
import { marked } from 'marked'

marked.setOptions({
	gfm: true,
	breaks: true
})

export function renderMarkdown(text: string): string {
	if (!text) return ''

	const normalized = text.replace(/__([^_]+)__/g, '**$1**')
	const rendered = marked.parse(normalized) as string

	return DOMPurify.sanitize(rendered)
}

export function escapeHtml(text: string): string {
	const div = document.createElement('div')
	div.textContent = text
	return div.innerHTML
}
