/**
 * CompletionBadge - レッスンの完了回数を視覚化する小さなコンポーネント。
 *
 * 仕様:
 *  - count = 0: 何も描画しない (null を返す)
 *  - count = 1: チェックマーク + フル塗りつぶしの円 (通常の「完了」表示、--accent)
 *  - count = 2: 半分塗りつぶし (リング状) + 数字「2」 (習熟色 --mastery)
 *  - count = 3+: フル塗りつぶし + 数字「3」「4」… (上限 9+) (習熟色 --mastery)
 *
 * 配色 (T-Y):
 *  - count = 1 は従来どおりテーマアクセント (--accent / --accent-fg) に追従。
 *  - count >= 2 は「習熟 (mastery)」として固定ゴールド系トークン (--mastery / --mastery-fg)
 *    に切り替える。明カード / 暗カードで 2 値出し分け (tokens.css 側で定義)。
 *  - 色だけに頼らず形状でも二重符号化する: mastery バッジには細い金縁リング
 *    (--mastery) を常時付与し、1 回バッジ (縁なし) と弁別できるようにする
 *    (色覚多様性・暖色テーマ対策)。
 */
import { t } from '../i18n'

interface Props {
  count: number
  size?: number
}

function formatCount(count: number): string {
  if (count >= 10) return '9+'
  return String(count)
}

export function CompletionBadge({ count, size = 28 }: Props) {
  if (count <= 0) return null

  const fontSize = Math.max(10, Math.round(size * 0.42))
  const ringStroke = Math.max(2, Math.round(size * 0.12))
  // 二重符号化用の金縁リング幅 (count>=2 のみ)
  const masteryRing = Math.max(1.5, Math.round(size * 0.07))

  // 1 回目はチェックマーク (既存の done バッジと同等の見え方、テーマアクセント追従)。
  if (count === 1) {
    return (
      <div
        aria-label={t('completed.timesDone', { n: 1 })}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: 'var(--accent)',
          color: 'var(--accent-fg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <svg
          width={size * 0.43}
          height={size * 0.43}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
    )
  }

  // 2 回目: 半分リング (左半分のみ塗る) + 数字「2」(習熟色 + 金縁リングで二重符号化)
  if (count === 2) {
    return (
      <div
        aria-label={t('completed.timesDone', { n: 2 })}
        title={t('completed.timesDone', { n: 2 })}
        style={{
          position: 'relative',
          width: size,
          height: size,
          flexShrink: 0,
          borderRadius: '50%',
          // 二重符号化: 常時の金縁リング (色だけに頼らない形状差)
          boxShadow: `0 0 0 ${masteryRing}px var(--mastery)`,
        }}
      >
        {/* 背景の薄いリング */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: `color-mix(in srgb, var(--mastery) 15%, transparent)`,
          }}
        />
        {/* 半分だけ塗る (左半分が mastery、右半分が透明) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: `conic-gradient(from 180deg, var(--mastery) 0deg 180deg, transparent 180deg 360deg)`,
          }}
        />
        {/* 中心の数字 (背景は card 色で抜く) */}
        <div
          style={{
            position: 'absolute',
            inset: ringStroke,
            borderRadius: '50%',
            background: 'var(--bg-card)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize,
            fontWeight: 800,
            color: 'var(--mastery)',
            lineHeight: 1,
            letterSpacing: '-0.02em',
          }}
        >
          2
        </div>
      </div>
    )
  }

  // 3 回以上: フル塗りつぶし + 数字 (習熟色 + 金縁リングで二重符号化)
  const label = formatCount(count)
  return (
    <div
      aria-label={t('completed.timesDone', { n: count })}
      title={t('completed.timesDone', { n: count })}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'var(--mastery)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        fontSize,
        fontWeight: 800,
        color: 'var(--mastery-fg)',
        lineHeight: 1,
        letterSpacing: '-0.02em',
        // 二重符号化: 常時の金縁リング
        boxShadow: `0 0 0 ${masteryRing}px color-mix(in srgb, var(--mastery) 55%, transparent)`,
      }}
    >
      {label}
    </div>
  )
}
