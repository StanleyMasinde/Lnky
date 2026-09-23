// Dismissing the system share sheet rejects with AbortError. That is
// intentional, not a failure — it must never reach the error banner.
export function isShareDismissal(err: unknown): boolean {
	return err instanceof DOMException && err.name === 'AbortError'
}
