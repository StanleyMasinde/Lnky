export type ShareQuery = Record<string, unknown>

const URL_IN_TEXT = /https?:\/\/[^\s<>"']+/i

function firstString(value: unknown): string | undefined {
	if (typeof value === 'string' && value.trim()) {
		return value.trim()
	}

	if (Array.isArray(value)) {
		const first = value.find((entry) => typeof entry === 'string' && entry.trim())
		if (typeof first === 'string') {
			return first.trim()
		}
	}
}

function coerceToHttpUrl(value: string): string | undefined {
	const trimmed = value.trim()
	const withoutProtocol = trimmed.replace(/^web\+lnky:/i, '')

	if (URL.canParse(withoutProtocol) && /^https?:/i.test(withoutProtocol)) {
		return new URL(withoutProtocol).toString()
	}

	const embedded = withoutProtocol.match(URL_IN_TEXT)
	if (embedded && URL.canParse(embedded[0])) {
		return new URL(embedded[0]).toString()
	}
}

/**
 * Android share-target often puts the URL in `text` (sometimes with a caption),
 * not in `url`. Prefer an explicit url, then text, then title.
 */
export function extractSharedUrl(query: ShareQuery): string | undefined {
	const candidates = [query.url, query.text, query.title]

	for (const candidate of candidates) {
		const value = firstString(candidate)
		if (!value) {
			continue
		}

		const url = coerceToHttpUrl(value)
		if (url) {
			return url
		}
	}
}
