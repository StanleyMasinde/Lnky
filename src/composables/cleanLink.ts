import { useIsLoading } from './state'

const trackingPatterns = {
	Facebook: ['fbclid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'],
	Google: ['gclid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'entry', 'g_ep', 'ucbcb'],
	YouTube: ['si', 'feature', 'app', 't'],
	Twitter: ['ref_src', 's', 't'],
	Instagram: ['igshid', 'utm_source', 'utm_medium', 'utm_campaign'],
	TikTok: ['_r', '_t', 'refer', 'is_from_webapp', 'sender_device'],
	LinkedIn: ['trk', 'utm_source', 'utm_medium', 'utm_campaign', 'rcm'],
	Amazon: ['tag', 'ascsubtag', 'ref', 'pf_rd_p', 'pf_rd_r', 'social_share', 'ref_', 'starsLeft', 'psc'],
	Microsoft: ['msclkid'],
	Reddit: ['utm_source', 'utm_medium', 'utm_campaign', 'impressionid', 'utm_name', 'p'],
	Pinterest: ['epik', 'utm_source', 'utm_medium', 'utm_campaign', 'invite_code', 'sfo'],
	Snapchat: ['sc_ref', 'utm_source', 'utm_medium'],
	WhatsApp: ['utm_source', 'utm_medium', 'utm_campaign'],
	Bing: ['msclkid'],
	Yahoo: ['soc_src', 'soc_trk'],
	Adobe: ['cid', 'aid'],
	HubSpot: ['__hssc', '__hstc', 'hsCtaTracking', 'hsLang', 'hsmi', 'hsenc'],
	Marketo: ['mkt_tok'],
	MailChimp: ['mc_cid', 'mc_eid'],
	CampaignMonitor: ['cm_mmca', 'cm_mmca1', 'cm_mmca2'],
	Pardot: ['piwik_campaign', 'piwik_kwd'],
	Eloqua: ['elqTrackId', 'elqTrack', 'elqaid', 'elqat'],
	UTM: ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'],
	General: ['ref', 'src', 'aff_id', 'affiliate_id', 'campaign', 'adgroup', 'ad', 'creative', 'keyword', 'matchtype', 'network', 'placement', 'target', 'device', 'devicemodel', 'gclid', 'dclid', 'fbclid', 'msclkid', 'twclid', 'igshid', 'scid', 'sclid', 'yclid'],
}

const shortDomains: string[] = []
// Fetch short Links from IDB
const fetchLinksReq = new Promise((resolve, reject) => {
	const idbRequest = window.indexedDB.open('linksDb')
	idbRequest.onsuccess = (event) => {
		const database: IDBDatabase = (event.target as IDBOpenDBRequest).result

		const tx = database.transaction('shortLinks', 'readonly')
		const linksStore = tx.objectStore('shortLinks')
		const linksCursor = linksStore.openCursor()

		linksCursor.onsuccess = (event) => {
			const cursor = (event.target as IDBRequest).result as IDBCursorWithValue

			if (cursor) {
				console.log(cursor)

				shortDomains.unshift(cursor.value.domain)

				cursor.continue()
			}

			resolve('OK')
		}

		linksCursor.onerror = (err) => {
			reject(err)
		}
	}
})

const expandUrl = async (shortUrl: string) => {
	try {
		useIsLoading().value = true
		const response = await fetch(`https://lnky.api.stanleymasinde.com/?url=${shortUrl}`, {
			redirect: 'follow',
			method: 'GET',
			mode: 'cors',
		})

		return await response.text()
	}
	finally {
		useIsLoading().value = false
	}
}

// Remove all the tracking query params
const removeTrackers = (dirtyLink: string) => {
	const urlObject = new URL(dirtyLink)
	const searchParams = new URLSearchParams(urlObject.search)

	Object.values(trackingPatterns).flat().forEach((trackingParam) => {
		searchParams.delete(trackingParam)
	})

	urlObject.search = searchParams.toString()

	return urlObject.toString()
}

export const useCleanLink = async (link: string) => {
	await fetchLinksReq

	let url: string = link
	const domain = new URL(url).hostname
	if (shortDomains.includes(domain)) {
		const expanded = await expandUrl(link)
		if (expanded) {
			url = expanded
		}
	}

	// Special case for meta apps like facebook use a forward slash /share for this.
	// For now, I'll keep it simple. I can add the logic in the block above but I don't want to
	// bloat it since it will grow later.
	if (url.includes('facebook') || url.includes('instagram')) {
		const expanded = await expandUrl(link)
		if (expanded) {
			url = expanded
		}
	}

	return removeTrackers(url)
}
