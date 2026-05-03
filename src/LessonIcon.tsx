type Props = {
  id: number
  action: string
  size?: number
}

export default function LessonIcon({ id, action, size = 24 }: Props) {
  const s = size
  const sw = 1.8
  const props = { width: s, height: s, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: sw, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

  // ロールプレイ (id:3): 会話バブル
  if (action === 'roleplay') {
    return (
      <svg {...props}>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <path d="M8 9h8" />
        <path d="M8 13h5" />
      </svg>
    )
  }

  // MECE (id:20): グリッド・分類
  if (id === 20) {
    return (
      <svg {...props}>
        <rect x="3" y="3" width="8" height="8" rx="1" />
        <rect x="13" y="3" width="8" height="8" rx="1" />
        <rect x="3" y="13" width="8" height="8" rx="1" />
        <rect x="13" y="13" width="8" height="8" rx="1" />
      </svg>
    )
  }

  // ロジックツリー (id:21): ツリー構造
  if (id === 21) {
    return (
      <svg {...props}>
        <circle cx="6" cy="12" r="3" />
        <line x1="9" y1="12" x2="14" y2="6" />
        <line x1="9" y1="12" x2="14" y2="12" />
        <line x1="9" y1="12" x2="14" y2="18" />
        <circle cx="17" cy="6" r="3" />
        <circle cx="17" cy="12" r="3" />
        <circle cx="17" cy="18" r="3" />
      </svg>
    )
  }

  // So What / Why So (id:22): 上下矢印
  if (id === 22) {
    return (
      <svg {...props}>
        <path d="M12 2v8" />
        <path d="m8 6 4-4 4 4" />
        <path d="M12 22v-8" />
        <path d="m16 18-4 4-4-4" />
        <line x1="4" y1="12" x2="20" y2="12" />
      </svg>
    )
  }

  // ピラミッド原則 (id:23): ピラミッド
  if (id === 23) {
    return (
      <svg {...props}>
        <path d="M12 2L2 22h20L12 2Z" />
        <line x1="6" y1="15" x2="18" y2="15" />
        <line x1="9" y1="9" x2="15" y2="9" />
      </svg>
    )
  }

  // ケーススタディ (id:24): ブリーフケース
  if (id === 24) {
    return (
      <svg {...props}>
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        <line x1="12" y1="12" x2="12" y2="12.01" />
      </svg>
    )
  }

  // 経営戦略 (320): 工場（テイラー＆フォード）
  if (id === 320) {
    return (
      <svg {...props}>
        <path d="M3 21V10l5 3V10l5 3V10l5 3v8z" />
        <line x1="3" y1="21" x2="21" y2="21" />
        <line x1="7" y1="17" x2="7" y2="18" />
        <line x1="12" y1="17" x2="12" y2="18" />
        <line x1="17" y1="17" x2="17" y2="18" />
      </svg>
    )
  }

  // アンゾフ (321): 2x2マトリクスに矢印
  if (id === 321) {
    return (
      <svg {...props}>
        <rect x="3" y="3" width="8" height="8" rx="1" />
        <rect x="13" y="3" width="8" height="8" rx="1" />
        <rect x="3" y="13" width="8" height="8" rx="1" />
        <rect x="13" y="13" width="8" height="8" rx="1" />
        <path d="M7 7l10 10" />
        <path d="m14 17 3 0 0-3" />
      </svg>
    )
  }

  // PPM (322): 4象限と円（事業バブル）
  if (id === 322) {
    return (
      <svg {...props}>
        <line x1="12" y1="3" x2="12" y2="21" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <circle cx="7" cy="7" r="2.5" />
        <circle cx="17" cy="7" r="1.5" />
        <circle cx="7" cy="17" r="1" />
        <circle cx="17" cy="17" r="2" />
      </svg>
    )
  }

  // 5フォース (323): 中心に向かう5本の矢印
  if (id === 323) {
    return (
      <svg {...props}>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v4" /><path d="m10 5 2-3 2 3" />
        <path d="M22 12h-4" /><path d="m19 10 3 2-3 2" />
        <path d="M12 22v-4" /><path d="m10 19 2 3 2-3" />
        <path d="M2 12h4" /><path d="m5 10-3 2 3 2" />
        <path d="m18 6-3 3" />
      </svg>
    )
  }

  // 3つの基本戦略 (324): 3つの並列な柱
  if (id === 324) {
    return (
      <svg {...props}>
        <rect x="3" y="6" width="4" height="14" rx="0.5" />
        <rect x="10" y="3" width="4" height="17" rx="0.5" />
        <rect x="17" y="9" width="4" height="11" rx="0.5" />
        <line x1="2" y1="20" x2="22" y2="20" />
      </svg>
    )
  }

  // RBV / VRIO (325): 4枚の重なるカード
  if (id === 325) {
    return (
      <svg {...props}>
        <rect x="3" y="6" width="11" height="13" rx="1.5" />
        <rect x="6" y="4" width="11" height="13" rx="1.5" />
        <rect x="9" y="2" width="11" height="13" rx="1.5" />
        <line x1="12" y1="6" x2="17" y2="6" />
        <line x1="12" y1="9" x2="17" y2="9" />
      </svg>
    )
  }

  // コアコンピタンス (326): 中心と放射状の枝
  if (id === 326) {
    return (
      <svg {...props}>
        <circle cx="12" cy="12" r="3.5" />
        <path d="M12 8.5V3" />
        <path d="M12 15.5V21" />
        <path d="M8.5 12H3" />
        <path d="M15.5 12H21" />
        <path d="m9.5 9.5-3-3" />
        <path d="m14.5 14.5 3 3" />
        <path d="m14.5 9.5 3-3" />
        <path d="m9.5 14.5-3 3" />
      </svg>
    )
  }

  // ブルーオーシャン (327): 波と航路
  if (id === 327) {
    return (
      <svg {...props}>
        <path d="M2 16c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2" />
        <path d="M2 20c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2" />
        <path d="M12 11V3" />
        <path d="M9 6h6" />
      </svg>
    )
  }

  // ダイナミック・ケイパビリティ (328): 循環する矢印
  if (id === 328) {
    return (
      <svg {...props}>
        <path d="M21 12a9 9 0 1 1-3-6.7" />
        <path d="m21 4-1 5-5-1" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    )
  }

  // プラットフォーム戦略 (329): 中心ハブとノード
  if (id === 329) {
    return (
      <svg {...props}>
        <circle cx="12" cy="12" r="3" />
        <circle cx="4" cy="5" r="1.8" />
        <circle cx="20" cy="5" r="1.8" />
        <circle cx="4" cy="19" r="1.8" />
        <circle cx="20" cy="19" r="1.8" />
        <line x1="6" y1="6" x2="10" y2="10.5" />
        <line x1="18" y1="6" x2="14" y2="10.5" />
        <line x1="6" y1="18" x2="10" y2="13.5" />
        <line x1="18" y1="18" x2="14" y2="13.5" />
      </svg>
    )
  }

  // デフォルト: ブック
  return (
    <svg {...props}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15Z" />
    </svg>
  )
}
