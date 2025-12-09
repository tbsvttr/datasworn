import { defineConfig } from 'vite'
import { resolve, dirname } from 'path'
import { readFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
	root: '.',
	base: './',
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
			}
		}
	],
	build: {
		outDir: 'dist',
		emptyOutDir: true
	}
})
