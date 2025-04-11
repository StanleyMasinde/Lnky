import { version } from './package.json'
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		vue(),
	],
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
		},
	},
	build: {
		target: 'esNext',
		rollupOptions: {
			input: {
				main: 'index.html',
				sw: 'src/sw.ts',
			},
			output: {
				entryFileNames: (asset) => {
					if (asset.name === 'sw') return 'sw.js' // optional rename
					return '[name]-[hash].js'
				},
			},
		},
	},
	define: {
		__APP_VERSION__: JSON.stringify(version),
	},
})
