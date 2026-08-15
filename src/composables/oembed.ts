export type OEmbedProvider = 'twitter' | 'youtube' | 'reddit'

export interface OEmbedConfig {
	provider: OEmbedProvider
	endpoint: string
	scriptSrc?: string
}

export interface OEmbedResponse {
	url?: string
	title?: string
	html?: string
	width?: number | null
	height?: number | null
	type?: string
	thumbnail_url?: string
	author_name?: string
	provider_name?: string
	provider_url?: string
	version?: string
}

const parseUrl = (rawUrl: string) => {
	try {
		return new URL(rawUrl)
	}
	catch {
		return null
	}
}

const hostnameOf = (url: URL) => url.hostname.replace(/^www\./, '').toLowerCase()

export const isTweetUrl = (rawUrl: string) => {
	const url = parseUrl(rawUrl)
	if (!url) return false
	const host = hostnameOf(url)
	return (host === 'twitter.com' || host === 'x.com') && /\/status\/\d+/.test(url.pathname)
}

export const isYouTubeUrl = (rawUrl: string) => {
	const url = parseUrl(rawUrl)
	if (!url) return false
	const host = hostnameOf(url)

	if (host === 'youtu.be') {
		return url.pathname.length > 1
	}

	const youtubeHosts = new Set([
		'youtube.com',
		'm.youtube.com',
		'music.youtube.com',
		'youtube-nocookie.com',
	])

	if (!youtubeHosts.has(host)) return false

	return /\/(watch|shorts|embed|live|v)\b/.test(url.pathname)
}

export const isRedditUrl = (rawUrl: string) => {
	const url = parseUrl(rawUrl)
	if (!url) return false
	const host = hostnameOf(url)

	if (host === 'redd.it') {
		return url.pathname.length > 1
	}

	if (host !== 'reddit.com' && !host.endsWith('.reddit.com')) {
		return false
	}

	return (
		/\/r\/[^/]+\/comments\//.test(url.pathname)
		|| /\/r\/[^/]+\/s\//.test(url.pathname)
		|| /\/comments\//.test(url.pathname)
		|| /\/user\/[^/]+\/comments\//.test(url.pathname)
	)
}

export const getOEmbedConfig = (rawUrl: string): OEmbedConfig | null => {
	const url = parseUrl(rawUrl)
	if (!url) return null

	if (isTweetUrl(rawUrl)) {
		const endpoint = new URL('https://publish.twitter.com/oembed')
		endpoint.searchParams.set('url', url.toString())
		return {
			provider: 'twitter',
			endpoint: endpoint.toString(),
			scriptSrc: 'https://platform.twitter.com/widgets.js',
		}
	}

	if (isYouTubeUrl(rawUrl)) {
		const endpoint = new URL('https://www.youtube.com/oembed')
		endpoint.searchParams.set('url', url.toString())
		endpoint.searchParams.set('format', 'json')
		return {
			provider: 'youtube',
			endpoint: endpoint.toString(),
		}
	}

	if (isRedditUrl(rawUrl)) {
		const endpoint = new URL('https://www.reddit.com/oembed')
		endpoint.searchParams.set('url', url.toString())
		return {
			provider: 'reddit',
			endpoint: endpoint.toString(),
			scriptSrc: 'https://embed.reddit.com/widgets.js',
		}
	}

	return null
}

export const stripScripts = (html: string) => html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
