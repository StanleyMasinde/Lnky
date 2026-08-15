export const INSTALL_HINT_KEY = 'lnky.dismissedInstallHint'

export function isStandaloneDisplay(
	mediaMatches: boolean,
	iosStandalone: boolean,
): boolean {
	return mediaMatches || iosStandalone
}

export function isIosDevice(userAgent: string, platform: string, maxTouchPoints: number): boolean {
	return /iphone|ipad|ipod/i.test(userAgent)
		|| (platform === 'MacIntel' && maxTouchPoints > 1)
}

export function shouldAutoPromptInstall(
	search: string,
	installed: boolean,
	dismissed: boolean,
): boolean {
	if (installed || dismissed) {
		return false
	}

	const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
	return !params.has('url') && !params.has('text') && !params.has('title')
}
