export const NEVER_CACHE_HOSTS = new Set([
	'lnky.api.stanleymasinde.com',
	'raw.githubusercontent.com',
])

export function shouldCacheResponse(
	requestUrl: string,
	method: string,
	responseOk: boolean,
	pageOrigin: string,
): boolean {
	if (method !== 'GET' || !responseOk) {
		return false
	}

	let url: URL
	try {
		url = new URL(requestUrl)
	}
	catch {
		return false
	}

	if (NEVER_CACHE_HOSTS.has(url.hostname)) {
		return false
	}

	return url.origin === pageOrigin
}
