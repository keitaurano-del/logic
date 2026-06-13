import { describe, it, expect } from 'vitest'
import {
  buildDeviationShareContent,
  buildStreakShareContent,
  buildProfileShareContent,
  SHARE_URL,
} from '../platform/shareMessages'

// 簡易 t(): {placeholder} を params で置換するだけ。i18n 本体に依存せず純粋ロジックを検証する。
const t = (key: string, params?: Record<string, string | number>): string => {
  const templates: Record<string, string> = {
    'share.appName': 'Logic',
    'share.deviation': '偏差値{deviation}を取りました！',
    'share.streak': '{days}日連続学習を達成！',
    'share.profile': 'Lv.{level}・{xp}XPまで到達！',
  }
  let s = templates[key] ?? key
  if (params) for (const [k, v] of Object.entries(params)) s = s.replace(`{${k}}`, String(v))
  return s
}

describe('shareMessages — 成果シェア文言生成（LR-42）', () => {
  it('偏差値シェア: 偏差値を文言に含め URL を付与する', () => {
    const c = buildDeviationShareContent(t, 62)
    expect(c.title).toBe('Logic')
    expect(c.text).toContain('62')
    expect(c.url).toBe(SHARE_URL)
  })

  it('ストリークシェア: 日数を文言に含める', () => {
    const c = buildStreakShareContent(t, 7)
    expect(c.text).toContain('7')
    expect(c.url).toBe(SHARE_URL)
  })

  it('プロフィールシェア: レベルと XP（カンマ区切り）を含める', () => {
    const c = buildProfileShareContent(t, 12, 3200)
    expect(c.text).toContain('12')
    // toLocaleString でカンマ区切り（環境差で空白許容のため数字だけ確認）
    expect(c.text).toMatch(/3[,\s]?200/)
  })

  it('文言は安さ訴求ではなく到達価値（成果値）を含む', () => {
    expect(buildDeviationShareContent(t, 70).text).toContain('70')
    expect(buildStreakShareContent(t, 30).text).toContain('30')
  })
})
