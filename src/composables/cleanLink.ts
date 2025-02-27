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
		const response = await fetch(shortUrl, { redirect: 'manual', method: 'GET' })
		return response.url
	}
	catch (e) {
		console.log(e)
	}
}

const removeTrackers = (dirtyLink: string) => {
	const url = new URL(dirtyLink)

	const allParams = Object.values(trackingPatterns).flat()
	const currentParams = url.searchParams

	currentParams.forEach((param) => {
		if (allParams.includes(param)) {
			currentParams.delete(param)
		}
	})

	return url
}

export async function useCleanLink(link: string) {
	let url = link
	const domain = new URL(url).hostname
	if (shortDomains.includes(domain)) {
		url = await expandUrl(link)
		console.log('haha', url)
	}

	return removeTrackers(url)
}
