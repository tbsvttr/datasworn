import { createSidebar } from './Sidebar'
import { createDetailPanel } from './Detail'
import { createRollHistoryPanel } from './RollHistory'

export function createApp(container: HTMLElement): void {
	createSidebar(container)
	createDetailPanel(container)
	createRollHistoryPanel(container)
}
