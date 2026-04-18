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

  // デフォルト: ブック
  return (
    <svg {...props}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15Z" />
    </svg>
  )
}
