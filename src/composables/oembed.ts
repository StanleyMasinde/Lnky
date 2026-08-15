export type OEmbedProvider = 'twitter' | 'youtube' | 'reddit'

export interface OEmbedConfig {
	provider: OEmbedProvider
	endpoint: string
	scriptSrc?: string
	/** Fetch this endpoint directly. Do not wrap it in /proxy?url= */
	skipProxy?: boolean
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

const isRedditHost = (host: string) =>
	host === 'reddit.com'
	|| host.endsWith('.reddit.com')
	|| host === 'redd.it'
	|| host.endsWith('.redd.it')

export const isRedditHostUrl = (rawUrl: string) => {
	const url = parseUrl(rawUrl)
	return !!url && isRedditHost(hostnameOf(url))
}

const redditPostIdFromPath = (pathname: string) => {
	const comments = pathname.match(/\/comments\/([a-z0-9]+)/i)
	if (comments) return comments[1]
	const gallery = pathname.match(/\/gallery\/([a-z0-9]+)/i)
	if (gallery) return gallery[1]
	return null
}

export const isRedditShareUrl = (rawUrl: string) => {
	const url = parseUrl(rawUrl)
	if (!url) return false
	return isRedditHost(hostnameOf(url)) && /\/r\/[^/]+\/s\/[^/]+/.test(url.pathname)
}

export const isRedditUrl = (rawUrl: string) => {
	const url = parseUrl(rawUrl)
	if (!url) return false
	const host = hostnameOf(url)

	if (host === 'redd.it') {
		return url.pathname.length > 1
	}

	return isRedditHost(host)
}

// Reddit oEmbed rejects redd.it and /comments/{id} without a subreddit.
// /r/all/comments/{id} is accepted and returns the real post.
export const canonicalRedditUrl = (rawUrl: string) => {
	const url = parseUrl(rawUrl)
	if (!url) return null
	const host = hostnameOf(url)

	if (host === 'redd.it') {
		const id = url.pathname.replace(/^\//, '').split('/')[0]
		return id ? `https://www.reddit.com/r/all/comments/${id}` : null
	}

	if (!isRedditHost(host)) return null

	const withSub = url.pathname.match(/^\/r\/([^/]+)\/comments\/([a-z0-9]+)(?:\/([^/]*))?/i)
	if (withSub) {
		const slug = withSub[3] ? `/${withSub[3]}` : ''
		return `https://www.reddit.com/r/${withSub[1]}/comments/${withSub[2]}${slug}`
	}

	const id = redditPostIdFromPath(url.pathname)
	if (id) {
		return `https://www.reddit.com/r/all/comments/${id}`
	}

	return null
}

const expandShortUrl = async (shortUrl: string) => {
	const api = new URL('https://lnky.api.stanleymasinde.com/')
	api.searchParams.set('url', shortUrl)
	const res = await fetch(api, { redirect: 'follow', mode: 'cors' })
	if (!res.ok) return null
	const text = (await res.text()).trim()
	return URL.canParse(text) ? text : null
}

export const parseOEmbedResponse = (body: string): OEmbedResponse | null => {
	try {
		const data = JSON.parse(body) as OEmbedResponse
		if (!data || typeof data !== 'object') return null
		return data
	}
	catch {
		return null
	}
}

export const getOEmbedConfig = (rawUrl: string): OEmbedConfig | null => {
	const url = parseUrl(rawUrl)
	if (!url) return null

	if (isTweetUrl(rawUrl)) {
		const endpoint = new URL('https://publish.twitter.com/oembed')
		endpoint.searchParams.set('url', url.toString())
		endpoint.searchParams.set('omit_script', '1')
		endpoint.searchParams.set('dnt', 'true')
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

	if (isRedditHostUrl(rawUrl)) {
		const postUrl = canonicalRedditUrl(rawUrl) || url.toString()
		const endpoint = new URL('https://lnky.api.stanleymasinde.com/reddit')
		endpoint.searchParams.set('url', postUrl)
		return {
			provider: 'reddit',
			endpoint: endpoint.toString(),
			skipProxy: true,
		}
	}

	return null
}

export const resolveOEmbedConfig = async (rawUrl: string): Promise<OEmbedConfig | null> => {
	if (isRedditShareUrl(rawUrl) || (isRedditHostUrl(rawUrl) && !canonicalRedditUrl(rawUrl))) {
		const expanded = await expandShortUrl(rawUrl)
		if (expanded) {
			const fromExpanded = getOEmbedConfig(expanded)
			if (fromExpanded) return fromExpanded
		}
	}

	return getOEmbedConfig(rawUrl)
}

export const stripScripts = (html: string) => html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')

const TWITTER_WIDGET_CLASS = 'twitter-tweet'
const TWITTER_STATIC_CLASS = 'twitter-tweet-static'

export const toStaticTweetHtml = (html: string) =>
	stripScripts(html)
		.replace(new RegExp(`class="${TWITTER_WIDGET_CLASS}"`, 'g'), `class="${TWITTER_STATIC_CLASS}"`)
		.replace(new RegExp(`class='${TWITTER_WIDGET_CLASS}'`, 'g'), `class='${TWITTER_STATIC_CLASS}'`)

export const toLiveTweetHtml = (html: string) => {
	const cleaned = stripScripts(html)
	if (/data-dnt\s*=/.test(cleaned)) return cleaned
	return cleaned.replace(
		/<blockquote([^>]*\bclass=["']twitter-tweet["'])/i,
		'<blockquote data-dnt="true"$1',
	)
}
