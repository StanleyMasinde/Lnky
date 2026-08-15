import { describe, expect, it } from 'vitest'
import { parseShortenerList } from '../shortDomains'

describe('parseShortenerList', () => {
	it('keeps valid hostnames and drops comments', () => {
		expect(parseShortenerList([
			't.co',
			'# comment',
			' bit.ly ',
			'',
			'not a domain',
		].join('\n'))).toEqual(['t.co', 'bit.ly'])
	})
})
