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

  // 模擬試験 (id:99): クロスヘア・ターゲット
  if (action === 'mock-exam') {
    return (
      <svg {...props}>
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    )
  }

  // 仕訳入力ドリル (id:14): テキスト入力カーソル
  if (action === 'journal-input') {
    return (
      <svg {...props}>
        <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
        <path d="m15 5 4 4" />
      </svg>
    )
  }

  // 精算表穴埋め (id:15): グリッドテーブル
  if (action === 'worksheet') {
    return (
      <svg {...props}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="3" y1="15" x2="21" y2="15" />
        <line x1="9" y1="3" x2="9" y2="21" />
      </svg>
    )
  }

  // 簿記3級 入門 (id:6): 本・開いた本
  if (id === 6) {
    return (
      <svg {...props}>
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    )
  }

  // 簿記3級 決算 (id:7): チャート・財務諸表
  if (id === 7) {
    return (
      <svg {...props}>
        <path d="M3 3v18h18" />
        <path d="m7 16 4-8 4 4 6-8" />
      </svg>
    )
  }

  // 簿記2級 商業 (id:8): ビル・ビジネス
  if (id === 8) {
    return (
      <svg {...props}>
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <path d="M9 22v-4h6v4" />
        <path d="M8 6h.01M12 6h.01M16 6h.01" />
        <path d="M8 10h.01M12 10h.01M16 10h.01" />
        <path d="M8 14h.01M12 14h.01M16 14h.01" />
      </svg>
    )
  }

  // 簿記2級 工業 (id:9): 歯車・工場
  if (id === 9) {
    return (
      <svg {...props}>
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    )
  }

  // 仕訳問題50問 (id:11): チェックリスト
  if (id === 11) {
    return (
      <svg {...props}>
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="m9 15 2 2 4-4" />
        <path d="M16 5V3" />
        <path d="M21 8h-5V3l5 5Z" />
      </svg>
    )
  }

  // 勘定記入・補助簿 (id:12): ファイル・帳簿
  if (id === 12) {
    return (
      <svg {...props}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="8" y1="13" x2="16" y2="13" />
        <line x1="8" y1="17" x2="12" y2="17" />
      </svg>
    )
  }

  // 決算・精算表ドリル (id:13): 電卓
  if (id === 13) {
    return (
      <svg {...props}>
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <line x1="8" y1="6" x2="16" y2="6" />
        <line x1="8" y1="10" x2="8" y2="10.01" />
        <line x1="12" y1="10" x2="12" y2="10.01" />
        <line x1="16" y1="10" x2="16" y2="10.01" />
        <line x1="8" y1="14" x2="8" y2="14.01" />
        <line x1="12" y1="14" x2="12" y2="14.01" />
        <line x1="16" y1="14" x2="16" y2="14.01" />
        <line x1="8" y1="18" x2="8" y2="18.01" />
        <line x1="12" y1="18" x2="16" y2="18" />
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

  // PM基礎 (id:30): クリップボード
  if (id === 30) {
    return (
      <svg {...props}>
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" />
        <path d="M9 12h6M9 16h4" />
      </svg>
    )
  }

  // プロセス群 (id:31): フロー図
  if (id === 31) {
    return (
      <svg {...props}>
        <rect x="2" y="4" width="6" height="6" rx="1" />
        <rect x="16" y="4" width="6" height="6" rx="1" />
        <rect x="9" y="14" width="6" height="6" rx="1" />
        <path d="M8 7h8M12 10v4" />
      </svg>
    )
  }

  // 知識エリア (id:32): 本+星
  if (id === 32) {
    return (
      <svg {...props}>
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        <circle cx="18" cy="4" r="2" fill="currentColor" opacity="0.3" />
      </svg>
    )
  }

  // ツールと技法 (id:33): レンチ
  if (id === 33) {
    return (
      <svg {...props}>
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    )
  }

  // PMBOK総合演習 (id:34): 卒業帽
  if (id === 34) {
    return (
      <svg {...props}>
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5" />
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
