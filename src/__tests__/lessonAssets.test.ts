import { describe, expect, it } from 'vitest'
import { resolveAssetUrl, isRemoteAssetsActive } from '../lessonAssets'

describe('lessonAssets / resolveAssetUrl', () => {
  const LOCAL = '/images/v3/lesson-20.png'
  const BASE = 'https://yctlelmlwjwlcpcxvmgx.supabase.co/storage/v1/object/public/lesson-images'

  describe('flag OFF (default = bundled fallback)', () => {
    it('returns localPath unchanged when remote flag is undefined', () => {
      expect(resolveAssetUrl(LOCAL, {})).toBe(LOCAL)
    })

    it('returns localPath unchanged when remote flag is off, even with baseUrl set', () => {
      expect(resolveAssetUrl(LOCAL, { remoteEnabled: 'off', baseUrl: BASE })).toBe(LOCAL)
    })

    it('treats falsey-ish strings as OFF', () => {
      for (const raw of ['false', '0', 'no', '', 'maybe']) {
        expect(resolveAssetUrl(LOCAL, { remoteEnabled: raw, baseUrl: BASE })).toBe(LOCAL)
      }
    })
  })

  describe('flag ON + baseUrl set → remote URL', () => {
    it("builds remote URL from base + file name when flag is 'on'", () => {
      expect(resolveAssetUrl(LOCAL, { remoteEnabled: 'on', baseUrl: BASE })).toBe(
        `${BASE}/lesson-20.png`,
      )
    })

    it('accepts on-aliases (true / 1 / yes, case-insensitive)', () => {
      for (const raw of ['on', 'ON', 'true', 'TRUE', '1', 'yes', 'YES']) {
        expect(resolveAssetUrl(LOCAL, { remoteEnabled: raw, baseUrl: BASE })).toBe(
          `${BASE}/lesson-20.png`,
        )
      }
    })

    it('handles a trailing slash on baseUrl without doubling', () => {
      expect(resolveAssetUrl(LOCAL, { remoteEnabled: 'on', baseUrl: `${BASE}/` })).toBe(
        `${BASE}/lesson-20.png`,
      )
    })

    it('extracts only the file name from a nested local path', () => {
      const nested = '/images/v3/badges/badge-zenith.png'
      expect(resolveAssetUrl(nested, { remoteEnabled: 'on', baseUrl: BASE })).toBe(
        `${BASE}/badge-zenith.png`,
      )
    })

    it('strips query/hash from the local path when deriving the file name', () => {
      const withQuery = '/images/v3/course-logic-01.png?v=4#frag'
      expect(resolveAssetUrl(withQuery, { remoteEnabled: 'on', baseUrl: BASE })).toBe(
        `${BASE}/course-logic-01.png`,
      )
    })
  })

  describe('flag ON but baseUrl missing → bundled fallback', () => {
    it('returns localPath when baseUrl is undefined', () => {
      expect(resolveAssetUrl(LOCAL, { remoteEnabled: 'on' })).toBe(LOCAL)
    })

    it('returns localPath when baseUrl is empty/whitespace', () => {
      expect(resolveAssetUrl(LOCAL, { remoteEnabled: 'on', baseUrl: '   ' })).toBe(LOCAL)
    })
  })

  describe('non-PNG assets stay bundled (webp/svg pass-through)', () => {
    it('returns webp localPath unchanged even when flag is on (roadmap thumbs stay bundled)', () => {
      const webp = '/images/v3/lesson-20.webp'
      expect(resolveAssetUrl(webp, { remoteEnabled: 'on', baseUrl: BASE })).toBe(webp)
    })

    it('returns webp with query unchanged when flag is on', () => {
      const webp = '/images/v3/course-thinking.webp?v=4'
      expect(resolveAssetUrl(webp, { remoteEnabled: 'on', baseUrl: BASE })).toBe(webp)
    })

    it('returns svg localPath unchanged when flag is on', () => {
      const svg = '/images/v3/diagram.svg'
      expect(resolveAssetUrl(svg, { remoteEnabled: 'on', baseUrl: BASE })).toBe(svg)
    })

    it('is case-insensitive on the .png extension', () => {
      expect(resolveAssetUrl('/images/v3/lesson-20.PNG', { remoteEnabled: 'on', baseUrl: BASE })).toBe(
        `${BASE}/lesson-20.PNG`,
      )
    })
  })

  describe('edge cases', () => {
    it('returns empty input unchanged', () => {
      expect(resolveAssetUrl('', { remoteEnabled: 'on', baseUrl: BASE })).toBe('')
    })
  })
})

describe('lessonAssets / isRemoteAssetsActive', () => {
  const BASE = 'https://example.test/bucket'

  it('is false when flag is off', () => {
    expect(isRemoteAssetsActive({ remoteEnabled: 'off', baseUrl: BASE })).toBe(false)
  })

  it('is false when flag is on but baseUrl missing', () => {
    expect(isRemoteAssetsActive({ remoteEnabled: 'on' })).toBe(false)
  })

  it('is true when flag is on and baseUrl set', () => {
    expect(isRemoteAssetsActive({ remoteEnabled: 'on', baseUrl: BASE })).toBe(true)
  })
})
