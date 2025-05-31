import tailwindcss from "@tailwindcss/vite";
import { version } from './package.json'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: '2025-05-15',
	devtools: { enabled: true },

	modules: [
		'@nuxt/eslint',
		'@nuxt/icon',
		'@nuxt/scripts',
		'@nuxt/test-utils'
	],

	css: ['~/assets/css/main.css'],

	vite: {
		plugins: [
			tailwindcss(),
		],
		define: {
			__APP_VERSION__: JSON.stringify(version),
		}
	}
})
