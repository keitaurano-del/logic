// Rank illustrations — 16personalities-inspired minimal geometric style
// 10 levels: 哲学の卵 → ロゴスの神
// Each level has a distinct colour palette, geometric accessory, and personality

import type { ReactElement } from 'react'

interface Props {
  level: number
  size?: number
}

export function RankIllustration({ level, size = 160 }: Props): ReactElement {
  const clamped = Math.min(Math.max(Math.floor(level), 1), 10)
  const config = LEVEL_CONFIG[clamped]
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      style={{ display: 'block', flexShrink: 0 }}
      aria-hidden
    >
      <defs>
        <linearGradient id={`bg-${clamped}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={config.bg[0]} />
          <stop offset="100%" stopColor={config.bg[1]} />
        </linearGradient>
        <radialGradient id={`glow-${clamped}`} cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor={config.glow} stopOpacity="0.3" />
          <stop offset="100%" stopColor={config.glow} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`body-${clamped}`} x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor={config.outfit[0]} />
          <stop offset="100%" stopColor={config.outfit[1]} />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width="200" height="200" rx="32" fill={`url(#bg-${clamped})`} />

      {/* Subtle glow behind head */}
      <circle cx="100" cy="78" r="60" fill={`url(#glow-${clamped})`} />

      {/* Character */}
      {ILLUSTRATIONS[clamped]}
    </svg>
  )
}

/* ─────── Level colour configs ─────── */
type LevelConfig = {
  bg: [string, string]
  glow: string
  skin: string
  outfit: [string, string]
  hair: string
  accent: string
}

const LEVEL_CONFIG: Record<number, LevelConfig> = {
  1:  { bg: ['#FEF3C7', '#FDE68A'], glow: '#F59E0B', skin: '#F5D0A9', outfit: ['#FBBF24', '#F59E0B'], hair: '#92400E', accent: '#D97706' },
  2:  { bg: ['#DBEAFE', '#BFDBFE'], glow: '#3B82F6', skin: '#F5D0A9', outfit: ['#60A5FA', '#3B82F6'], hair: '#1E3A5F', accent: '#2563EB' },
  3:  { bg: ['#FCE7F3', '#FBCFE8'], glow: '#EC4899', skin: '#E8C4A0', outfit: ['#F9A8D4', '#EC4899'], hair: '#6B4423', accent: '#DB2777' },
  4:  { bg: ['#EDE9FE', '#DDD6FE'], glow: '#8B5CF6', skin: '#F5D0A9', outfit: ['#A78BFA', '#7C3AED'], hair: '#4A3728', accent: '#6D28D9' },
  5:  { bg: ['#D1FAE5', '#A7F3D0'], glow: '#10B981', skin: '#F5D0A9', outfit: ['#34D399', '#059669'], hair: '#3D2B1F', accent: '#047857' },
  6:  { bg: ['#E0E7FF', '#C7D2FE'], glow: '#6366F1', skin: '#F5D0A9', outfit: ['#818CF8', '#4F46E5'], hair: '#2C1810', accent: '#4338CA' },
  7:  { bg: ['#F1F5F9', '#E2E8F0'], glow: '#64748B', skin: '#F5D0A9', outfit: ['#94A3B8', '#475569'], hair: '#CBD5E1', accent: '#334155' },
  8:  { bg: ['#CCFBF1', '#99F6E4'], glow: '#14B8A6', skin: '#DEB887', outfit: ['#2DD4BF', '#0D9488'], hair: '#2C1810', accent: '#0F766E' },
  9:  { bg: ['#FEE2E2', '#FECACA'], glow: '#EF4444', skin: '#E8B88A', outfit: ['#1C1917', '#0F0A1E'], hair: '#1C1917', accent: '#DC2626' },
  10: { bg: ['#1E1B4B', '#0F0A1E'], glow: '#F59E0B', skin: '#FFFDE7', outfit: ['#312E81', '#1E1B4B'], hair: '#F59E0B', accent: '#818CF8' },
}

/* ─────── Shared body parts ─────── */
function baseCharacter(lv: number): ReactElement {
  const c = LEVEL_CONFIG[lv]
  return (
    <>
      {/* Body / outfit — rounded rectangle torso */}
      <path
        d="M72 120 Q72 108 84 108 L116 108 Q128 108 128 120 L132 172 Q132 180 124 180 L76 180 Q68 180 68 172 Z"
        fill={`url(#body-${lv})`}
      />
      {/* Neck */}
      <rect x="92" y="100" width="16" height="14" rx="4" fill={c.skin} />
      {/* Head — big round */}
      <circle cx="100" cy="72" r="36" fill={c.skin} />
      {/* Eyes */}
      <circle cx="88" cy="72" r="4.5" fill="#1E1B3A" />
      <circle cx="112" cy="72" r="4.5" fill="#1E1B3A" />
      <circle cx="90" cy="70.5" r="1.8" fill="white" />
      <circle cx="114" cy="70.5" r="1.8" fill="white" />
    </>
  )
}

/* ─────── 10 illustrations ─────── */
const ILLUSTRATIONS: Record<number, ReactElement> = {

  /* Lv 1: 哲学の卵 — curious beginner with a question mark */
  1: (
    <>
      {baseCharacter(1)}
      {/* Messy short hair */}
      <ellipse cx="100" cy="52" rx="34" ry="24" fill="#92400E" />
      <circle cx="82" cy="40" r="8" fill="#92400E" />
      <circle cx="100" cy="36" r="7" fill="#92400E" />
      <circle cx="118" cy="40" r="8" fill="#92400E" />
      {/* Raised eyebrows — curious */}
      <path d="M80 62 Q88 57 96 61" stroke="#92400E" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M104 61 Q112 57 120 62" stroke="#92400E" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Open smile */}
      <path d="M90 82 Q100 90 110 82" stroke="#1E1B3A" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Floating ? */}
      <text x="148" y="50" fontSize="24" fontWeight="800" fill="#D97706" opacity="0.6" fontFamily="Inter, sans-serif">?</text>
      {/* Small book in hand */}
      <rect x="126" y="132" width="14" height="18" rx="3" fill="#FEF9C3" stroke="#D97706" strokeWidth="1.5" />
    </>
  ),

  /* Lv 2: ソフィスト — eloquent speaker with speech bubble */
  2: (
    <>
      {baseCharacter(2)}
      {/* Neat hair */}
      <ellipse cx="100" cy="50" rx="36" ry="26" fill="#1E3A5F" />
      {/* Confident eyebrows */}
      <path d="M80 63 Q88 59 96 62" stroke="#1E3A5F" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M104 62 Q112 59 120 63" stroke="#1E3A5F" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Confident smirk */}
      <path d="M88 82 Q100 88 112 80" stroke="#1E1B3A" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Speech bubble */}
      <rect x="134" y="36" width="36" height="24" rx="12" fill="white" opacity="0.85" />
      <polygon points="138,60 142,56 146,60" fill="white" opacity="0.85" />
      <line x1="142" y1="45" x2="162" y2="45" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
      <line x1="142" y1="51" x2="156" y2="51" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
    </>
  ),

  /* Lv 3: ソクラテス — wise elder with question marks */
  3: (
    <>
      {baseCharacter(3)}
      {/* Bald top with side hair */}
      <ellipse cx="100" cy="50" rx="30" ry="18" fill="#E8C4A0" />
      <path d="M66 68 Q60 52 68 42" stroke="#6B4423" strokeWidth="6" strokeLinecap="round" fill="none" />
      <path d="M134 68 Q140 52 132 42" stroke="#6B4423" strokeWidth="6" strokeLinecap="round" fill="none" />
      {/* Bushy brows */}
      <path d="M78 62 Q88 56 96 61" stroke="#6B4423" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <path d="M104 61 Q112 56 122 62" stroke="#6B4423" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      {/* Round beard */}
      <ellipse cx="100" cy="98" rx="22" ry="16" fill="#9B7653" />
      {/* Wise smile */}
      <path d="M92 84 Q100 89 108 84" stroke="#1E1B3A" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Floating question marks */}
      <text x="140" y="42" fontSize="16" fontWeight="700" fill="#EC4899" opacity="0.5" fontFamily="Inter, sans-serif">?</text>
      <text x="152" y="58" fontSize="12" fontWeight="700" fill="#EC4899" opacity="0.35" fontFamily="Inter, sans-serif">?</text>
    </>
  ),

  /* Lv 4: プラトン — thinker with geometric shapes (triangle = form) */
  4: (
    <>
      {baseCharacter(4)}
      {/* Long wavy hair */}
      <ellipse cx="100" cy="48" rx="38" ry="28" fill="#4A3728" />
      <path d="M62 64 Q56 82 60 100" stroke="#4A3728" strokeWidth="12" strokeLinecap="round" fill="none" />
      <path d="M138 64 Q144 82 140 100" stroke="#4A3728" strokeWidth="12" strokeLinecap="round" fill="none" />
      {/* Strong brows */}
      <path d="M80 63 Q88 58 96 62" stroke="#4A3728" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M104 62 Q112 58 120 63" stroke="#4A3728" strokeWidth="3" strokeLinecap="round" fill="none" />
      {/* Beard */}
      <path d="M78 92 Q80 108 100 114 Q120 108 122 92" fill="#5C4030" />
      {/* Contemplative mouth */}
      <path d="M94 84 Q100 87 106 84" stroke="#1E1B3A" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      {/* Floating triangle — Platonic form */}
      <polygon points="156,30 170,56 142,56" fill="none" stroke="#8B5CF6" strokeWidth="2.5" opacity="0.5" />
      <circle cx="156" cy="43" r="4" fill="#8B5CF6" opacity="0.3" />
    </>
  ),

  /* Lv 5: アリストテレス — scholar with open book */
  5: (
    <>
      {baseCharacter(5)}
      {/* Full hair */}
      <ellipse cx="100" cy="48" rx="36" ry="26" fill="#3D2B1F" />
      {/* Focused brows */}
      <path d="M80 63 Q88 60 96 62" stroke="#3D2B1F" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M104 62 Q112 60 120 63" stroke="#3D2B1F" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Trimmed beard */}
      <ellipse cx="100" cy="96" rx="18" ry="12" fill="#6B4A2A" />
      {/* Knowing smile */}
      <path d="M92 84 Q100 88 108 84" stroke="#1E1B3A" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Open book */}
      <path d="M38 148 L66 142 L66 170 L38 176 Z" fill="#FEF9C3" stroke="#D97706" strokeWidth="1.5" />
      <path d="M66 142 L94 148 L94 176 L66 170 Z" fill="#FFFBEB" stroke="#D97706" strokeWidth="1.5" />
      <line x1="44" y1="155" x2="60" y2="152" stroke="#D97706" strokeWidth="1" opacity="0.6" />
      <line x1="44" y1="162" x2="60" y2="159" stroke="#D97706" strokeWidth="1" opacity="0.6" />
      {/* Pointing up */}
      <circle cx="148" cy="60" r="8" fill="#10B981" opacity="0.2" />
      <text x="144" y="65" fontSize="14" fill="#059669" opacity="0.6" fontFamily="Inter, sans-serif">↑</text>
    </>
  ),

  /* Lv 6: デカルト — thinker with coordinate axes */
  6: (
    <>
      {baseCharacter(6)}
      {/* 17c style long hair */}
      <ellipse cx="100" cy="48" rx="38" ry="28" fill="#2C1810" />
      <path d="M62 62 Q54 82 58 108" stroke="#2C1810" strokeWidth="14" strokeLinecap="round" fill="none" />
      <path d="M138 62 Q146 82 142 108" stroke="#2C1810" strokeWidth="14" strokeLinecap="round" fill="none" />
      {/* Mustache + goatee */}
      <path d="M88 82 Q94 78 100 80 Q106 78 112 82" stroke="#2C1810" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <ellipse cx="100" cy="92" rx="6" ry="5" fill="#2C1810" />
      {/* Slight frown — deep thought */}
      <path d="M94 84 Q100 83 106 84" stroke="#1E1B3A" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Coordinate axes */}
      <circle cx="156" cy="50" r="22" fill="#6366F1" opacity="0.1" />
      <line x1="156" y1="32" x2="156" y2="68" stroke="#6366F1" strokeWidth="2" opacity="0.6" />
      <line x1="138" y1="50" x2="174" y2="50" stroke="#6366F1" strokeWidth="2" opacity="0.6" />
      <circle cx="162" cy="42" r="3" fill="#6366F1" opacity="0.4" />
      <circle cx="148" cy="56" r="2" fill="#6366F1" opacity="0.3" />
    </>
  ),

  /* Lv 7: カント — formal with tricorn hat accent */
  7: (
    <>
      {baseCharacter(7)}
      {/* Powdered wig */}
      <ellipse cx="100" cy="46" rx="38" ry="28" fill="#CBD5E1" />
      <path d="M62 58 Q56 72 60 90" stroke="#CBD5E1" strokeWidth="12" strokeLinecap="round" fill="none" />
      <path d="M138 58 Q144 72 140 90" stroke="#CBD5E1" strokeWidth="12" strokeLinecap="round" fill="none" />
      {/* Stern thin brows */}
      <path d="M80 63 Q88 60 96 62" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M104 62 Q112 60 120 63" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Thin firm lips */}
      <path d="M92 82 Q100 84 108 82" stroke="#1E1B3A" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* White cravat */}
      <ellipse cx="100" cy="116" rx="14" ry="8" fill="white" />
      {/* Stars — "starry sky above" */}
      <circle cx="36" cy="30" r="2.5" fill="#64748B" opacity="0.5" />
      <circle cx="164" cy="24" r="2" fill="#64748B" opacity="0.4" />
      <circle cx="50" cy="16" r="1.5" fill="#64748B" opacity="0.3" />
      <circle cx="150" cy="40" r="1.5" fill="#64748B" opacity="0.3" />
    </>
  ),

  /* Lv 8: ヘーゲル — dialectician with synthesis arrows */
  8: (
    <>
      {baseCharacter(8)}
      {/* Hair + big sideburns */}
      <ellipse cx="100" cy="48" rx="34" ry="24" fill="#2C1810" />
      <ellipse cx="66" cy="78" rx="12" ry="18" fill="#2C1810" />
      <ellipse cx="134" cy="78" rx="12" ry="18" fill="#2C1810" />
      {/* Round spectacles */}
      <circle cx="88" cy="72" r="11" fill="none" stroke="#1C1917" strokeWidth="2.5" />
      <circle cx="112" cy="72" r="11" fill="none" stroke="#1C1917" strokeWidth="2.5" />
      <path d="M99 72 L101 72" stroke="#1C1917" strokeWidth="2.5" />
      {/* Slight smile */}
      <path d="M92 86 Q100 90 108 86" stroke="#1E1B3A" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      {/* Thesis → Antithesis → Synthesis */}
      <circle cx="148" cy="36" r="8" fill="#14B8A6" opacity="0.25" />
      <circle cx="168" cy="36" r="8" fill="#14B8A6" opacity="0.25" />
      <circle cx="158" cy="22" r="8" fill="#14B8A6" opacity="0.4" />
      <path d="M148 28 L155 24" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <path d="M168 28 L161 24" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
    </>
  ),

  /* Lv 9: ニーチェ — intense with lightning/fire */
  9: (
    <>
      {baseCharacter(9)}
      {/* Dark intense hair */}
      <ellipse cx="100" cy="46" rx="36" ry="26" fill="#1C1917" />
      {/* Heavy brows */}
      <path d="M78 60 Q88 54 96 59" stroke="#1C1917" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M104 59 Q112 54 122 60" stroke="#1C1917" strokeWidth="4" strokeLinecap="round" fill="none" />
      {/* The magnificent mustache */}
      <path d="M76 84 Q88 76 100 80 Q112 76 124 84 Q130 92 124 98 Q112 102 100 98 Q88 102 76 98 Q70 92 76 84 Z" fill="#1C1917" />
      {/* Intense look — no smile */}
      {/* Lightning bolt */}
      <path d="M152 26 L146 44 L154 42 L148 60" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.6" />
      {/* Red aura */}
      <circle cx="100" cy="72" r="42" fill="none" stroke="#EF4444" strokeWidth="1.5" opacity="0.15" />
    </>
  ),

  /* Lv 10: ロゴスの神 — transcendent with sacred geometry */
  10: (
    <>
      {/* Stars */}
      {[
        [30, 24], [170, 20], [18, 80], [182, 72], [24, 150], [176, 155],
        [50, 10], [155, 188], [92, 15], [140, 170],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={i % 3 === 0 ? 2 : 1.2} fill="white" opacity={0.3 + 0.25 * (i % 3)} />
      ))}
      {/* Sacred geometry — outer ring */}
      <circle cx="100" cy="78" r="52" fill="none" stroke="#818CF8" strokeWidth="1" opacity="0.3" />
      {/* Triangles */}
      <polygon points="100,30 146,100 54,100" fill="none" stroke="#818CF8" strokeWidth="1" opacity="0.2" />
      <polygon points="100,126 54,56 146,56" fill="none" stroke="#818CF8" strokeWidth="1" opacity="0.2" />
      {baseCharacter(10)}
      {/* Golden crown/halo */}
      <ellipse cx="100" cy="38" rx="30" ry="6" fill="none" stroke="#F59E0B" strokeWidth="2" opacity="0.7" />
      <ellipse cx="100" cy="38" rx="36" ry="8" fill="none" stroke="#F59E0B" strokeWidth="1" opacity="0.35" />
      {/* Golden hair */}
      <ellipse cx="100" cy="48" rx="34" ry="24" fill="#F59E0B" />
      {/* Re-draw face on top of hair */}
      <circle cx="100" cy="72" r="36" fill="#FFFDE7" />
      <circle cx="88" cy="72" r="4.5" fill="#4338CA" />
      <circle cx="112" cy="72" r="4.5" fill="#4338CA" />
      <circle cx="90" cy="70.5" r="1.8" fill="white" />
      <circle cx="114" cy="70.5" r="1.8" fill="white" />
      {/* Serene smile */}
      <path d="M92 84 Q100 90 108 84" stroke="#6D28D9" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Lambda */}
      <text x="100" y="168" textAnchor="middle" fontSize="22" fontWeight="bold" fill="#F59E0B" opacity="0.8" fontFamily="Georgia, serif">Λ</text>
    </>
  ),
}
