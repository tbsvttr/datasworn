import { defineConfig } from 'vite'
import { resolve, dirname } from 'path'
import { readFileSync, existsSync, cpSync, mkdirSync } from 'fs'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Use /datasworn/ base path for GitHub Pages, ./ for local dev
const isGitHubPages = process.env.GITHUB_PAGES === 'true'

export default defineConfig({
	root: '.',
	base: isGitHubPages ? '/datasworn/' : './',
	server: {
		port: 3000,
		open: true,
		fs: {
			allow: ['../..']
		}
	},
	plugins: [
		{
			name: 'serve-datasworn',
			configureServer(server) {
				// Dev server: serve JSON from parent directory
				server.middlewares.use((req, res, next) => {
					if (req.url?.startsWith('/datasworn/')) {
						const relativePath = req.url.replace('/datasworn/', '')
						const filePath = resolve(__dirname, '..', '..', 'datasworn', relativePath)
						if (existsSync(filePath) && filePath.endsWith('.json')) {
							const content = readFileSync(filePath, 'utf-8')
							res.setHeader('Content-Type', 'application/json')
							res.end(content)
							return
						}
					}
					next()
				})
			},
			closeBundle() {
				// Build: copy JSON files to dist
				const dataswornSrc = resolve(__dirname, '..', '..', 'datasworn')
				const dataswornDest = resolve(__dirname, 'dist', 'datasworn')

				if (existsSync(dataswornSrc)) {
					mkdirSync(dataswornDest, { recursive: true })
					cpSync(dataswornSrc, dataswornDest, { recursive: true })
					console.log('Copied datasworn JSON files to dist/')
				}
			}
		}
	],
	build: {
		outDir: 'dist',
		emptyOutDir: true
	}
})
