import { describe, expect, it } from 'vitest'
import {
  MAX_LEVEL,
  MAX_XP,
  getCurrentLevel,
  getXpProgress,
  getTitleKeyForLevel,
  getBadgeImagePath,
  getTitleI18nKey,
  TITLE_TIERS,
} from '../screens/homeHelpers'

describe('homeHelpers — Level system', () => {
  describe('getCurrentLevel', () => {
    it('returns level 1 for 0 XP', () => {
      const lv = getCurrentLevel(0)
      expect(lv.level).toBe(1)
      expect(lv.minXp).toBe(0)
    })

    it('returns level 2 at exactly 101 XP', () => {
      const lv = getCurrentLevel(101)
      expect(lv.level).toBe(2)
    })

    it('stays at level 1 just below the level 2 threshold', () => {
      const lv = getCurrentLevel(100)
      expect(lv.level).toBe(1)
    })

    it('returns MAX_LEVEL at MAX_XP exactly', () => {
      const lv = getCurrentLevel(MAX_XP)
      expect(lv.level).toBe(MAX_LEVEL)
    })

    it('clamps overflow XP to MAX_LEVEL', () => {
      const lv = getCurrentLevel(MAX_XP + 9_999_999)
      expect(lv.level).toBe(MAX_LEVEL)
    })

    it('clamps negative XP to level 1', () => {
      const lv = getCurrentLevel(-500)
      expect(lv.level).toBe(1)
    })
  })

  describe('getXpProgress', () => {
    it('returns 0% at the floor of a level', () => {
      // Lv2 boundary = 101
      const p = getXpProgress(101)
      expect(p.pct).toBe(0)
      expect(p.current).toBe(0)
      expect(p.needed).toBe(101)
    })

    it('returns ~50% halfway through a level', () => {
      // Lv1 (0-100) の真ん中
      const p = getXpProgress(50)
      expect(p.pct).toBeGreaterThanOrEqual(49)
      expect(p.pct).toBeLessThanOrEqual(51)
    })

    it('returns 100% at MAX_LEVEL', () => {
      const p = getXpProgress(MAX_XP)
      expect(p.pct).toBe(100)
      expect(p.needed).toBe(0)
    })

    it('returns pct that fits 0..100', () => {
      const p = getXpProgress(75)
      expect(p.pct).toBeGreaterThanOrEqual(0)
      expect(p.pct).toBeLessThanOrEqual(100)
    })
  })
})

describe('homeHelpers — Title / Badge system', () => {
  describe('getTitleKeyForLevel', () => {
    it('returns novice-1 at level 1', () => {
      expect(getTitleKeyForLevel(1)).toBe('novice-1')
    })

    it('returns apex at level 100', () => {
      expect(getTitleKeyForLevel(100)).toBe('apex')
    })

    it('returns zenith at MAX_LEVEL', () => {
      expect(getTitleKeyForLevel(MAX_LEVEL)).toBe('zenith')
    })

    it('returns the correct tier key for tier boundaries', () => {
      expect(getTitleKeyForLevel(20)).toBe('logician-1')
      expect(getTitleKeyForLevel(40)).toBe('knight-1')
      expect(getTitleKeyForLevel(60)).toBe('mage-1')
      expect(getTitleKeyForLevel(80)).toBe('sage-1')
      expect(getTitleKeyForLevel(101)).toBe('apex-2')
    })

    it('every level from 1 to MAX_LEVEL resolves to a defined tier', () => {
      for (let lv = 1; lv <= MAX_LEVEL; lv++) {
        const key = getTitleKeyForLevel(lv)
        expect(TITLE_TIERS.some((t) => t.key === key)).toBe(true)
      }
    })
  })

  describe('getBadgeImagePath', () => {
    it('returns the v3 badges path for a known key', () => {
      expect(getBadgeImagePath('novice-1')).toBe('/images/v3/badges/badge-novice-1.png')
      expect(getBadgeImagePath('apex')).toBe('/images/v3/badges/badge-apex.png')
      expect(getBadgeImagePath('zenith')).toBe('/images/v3/badges/badge-zenith.png')
    })

    it('returns a unique path for every defined title tier', () => {
      const paths = TITLE_TIERS.map((t) => getBadgeImagePath(t.key))
      const unique = new Set(paths)
      expect(unique.size).toBe(paths.length)
    })
  })

  describe('getTitleI18nKey', () => {
    it('converts kebab to underscore for i18n keys', () => {
      expect(getTitleI18nKey('novice-1')).toBe('profile.title.novice_1')
      expect(getTitleI18nKey('enlightened-3')).toBe('profile.title.enlightened_3')
      expect(getTitleI18nKey('apex')).toBe('profile.title.apex')
    })
  })
})
