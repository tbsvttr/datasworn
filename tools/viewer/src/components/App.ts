import { createSidebar } from './Sidebar'
import { createDetailPanel } from './Detail'

export function createApp(container: HTMLElement): void {
	createSidebar(container)
	createDetailPanel(container)
}
