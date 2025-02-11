import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: '/',
			name: 'home',
			component: HomeView,
		},
		{
			path: '/about',
			name: 'about',
			component: () => import('../views/AboutView.vue'),
		},
		{
			path: '/saved-links',
			name: 'about',
			component: () => import('../views/SavedLinks.vue'),
		},
		{
			path: '/handle-link',
			name: 'handle-link',
			component: () => import('../views/HandleLink.vue'),
		},
	],
})

export default router
