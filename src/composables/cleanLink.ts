const trackingPatterns = {
	Facebook: ['fbclid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'],
	Google: ['gclid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'],
	YouTube: ['si', 'feature', 'app', 't'],
	Twitter: ['ref_src', 's', 't'],
	Instagram: ['igshid', 'utm_source', 'utm_medium', 'utm_campaign'],
	TikTok: ['_r', '_t', 'refer'],
	LinkedIn: ['trk', 'utm_source', 'utm_medium', 'utm_campaign'],
	Amazon: ['tag', 'ascsubtag', 'ref', 'pf_rd_p', 'pf_rd_r'],
	Microsoft: ['msclkid'],
	Reddit: ['utm_source', 'utm_medium', 'utm_campaign'],
	Pinterest: ['epik', 'utm_source', 'utm_medium', 'utm_campaign'],
	Snapchat: ['sc_ref', 'utm_source', 'utm_medium'],
	WhatsApp: ['utm_source', 'utm_medium', 'utm_campaign'],
}

const shortDomains = [
	'l.facebook.com', 'fb.watch', 'm.me',
	'goo.gl',
	'youtu.be',
	't.co',
	'instagram.com/reel', 'instagram.com/stories',
	'vm.tiktok.com',
	'lnkd.in',
	'amzn.to',
	'binged.it',
	'rdt.co',
	'pin.it',
	'story.snapchat.com',
	'wa.me',
]

const expandUrl = async (shortUrl: string) => {
	try {
		const response = await fetch(`https://lnky.api.stanleymasinde.com/?url=${shortUrl}`, {
			redirect: 'follow',
			method: 'GET',
			mode: 'cors',
		})

		return await response.text()
	}
	catch (e) {
		console.log(e)
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
