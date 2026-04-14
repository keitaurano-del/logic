// Philosopher rank illustrations — 16personalities-inspired portrait style
// 10 levels: 哲学の卵 → ロゴスの神

import type { ReactElement } from 'react'

interface Props {
  level: number
  size?: number
}

export function RankIllustration({ level, size = 160 }: Props): ReactElement {
  const clamped = Math.min(Math.max(Math.floor(level), 1), 10)
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      style={{ display: 'block', flexShrink: 0 }}
      aria-hidden
    >
      {ILLUSTRATIONS[clamped]}
    </svg>
  )
}

/* ─────────────────────────────────────────────
   Shared helpers (skin, hair, toga colours)
───────────────────────────────────────────── */
const SKIN  = '#F0C088'
const SKIN2 = '#D9A06A'
const DARK  = '#2C1810'
const HAIR  = '#3D2B1F'

/* ─────────────────────────────────────────────
   10 illustrations, 200×200 viewBox each
───────────────────────────────────────────── */
const ILLUSTRATIONS: Record<number, ReactElement> = {

  /* ── Lv 1: 哲学の卵（見習い哲学者）── */
  1: (
    <>
      <rect width="200" height="200" rx="24" fill="#FEF3C7"/>
      {/* messy hair — young student */}
      <ellipse cx="100" cy="62" rx="38" ry="36" fill={HAIR}/>
      {/* hair tufts sticking up */}
      <ellipse cx="84"  cy="32" rx="8"  ry="12" fill={HAIR}/>
      <ellipse cx="100" cy="28" rx="7"  ry="11" fill={HAIR}/>
      <ellipse cx="116" cy="32" rx="8"  ry="12" fill={HAIR}/>
      {/* face */}
      <ellipse cx="100" cy="74" rx="33" ry="36" fill={SKIN}/>
      <ellipse cx="67"  cy="76" rx="7"  ry="10" fill={SKIN}/>
      <ellipse cx="133" cy="76" rx="7"  ry="10" fill={SKIN}/>
      {/* wide curious eyes */}
      <circle cx="86"  cy="67" r="7"   fill={DARK}/>
      <circle cx="114" cy="67" r="7"   fill={DARK}/>
      <circle cx="88.5" cy="65" r="3"  fill="white"/>
      <circle cx="116.5" cy="65" r="3" fill="white"/>
      {/* raised eyebrows — curious */}
      <path d="M78 57 Q86 52 94 56" stroke={HAIR} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M106 56 Q114 52 122 57" stroke={HAIR} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      {/* cheerful smile */}
      <path d="M86 86 Q100 98 114 86" stroke={DARK} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      {/* blush */}
      <ellipse cx="74"  cy="79" rx="8" ry="5" fill="#FCA5A5" opacity="0.5"/>
      <ellipse cx="126" cy="79" rx="8" ry="5" fill="#FCA5A5" opacity="0.5"/>
      {/* simple light toga */}
      <path d="M58 116 Q72 108 100 112 Q128 108 142 116 L146 200 L54 200 Z" fill="#FFFDE7" stroke="#FCD34D" strokeWidth="1.5"/>
      {/* small scroll in hand — eager beginner */}
      <rect x="130" y="128" width="16" height="24" rx="4" fill="#FEF9C3" stroke="#F59E0B" strokeWidth="1.5"/>
      <line x1="134" y1="136" x2="142" y2="136" stroke="#F59E0B" strokeWidth="1"/>
      <line x1="134" y1="141" x2="142" y2="141" stroke="#F59E0B" strokeWidth="1"/>
    </>
  ),

  /* ── Lv 2: ソフィスト ── */
  2: (
    <>
      <rect width="200" height="200" rx="24" fill="#DBEAFE"/>
      {/* hair */}
      <ellipse cx="100" cy="62" rx="40" ry="44" fill={HAIR}/>
      {/* face */}
      <ellipse cx="100" cy="74" rx="33" ry="37" fill={SKIN}/>
      <ellipse cx="67"  cy="76" rx="7"  ry="10" fill={SKIN}/>
      <ellipse cx="133" cy="76" rx="7"  ry="10" fill={SKIN}/>
      {/* eyes */}
      <ellipse cx="87"  cy="67" rx="5.5" ry="6" fill={DARK}/>
      <ellipse cx="113" cy="67" rx="5.5" ry="6" fill={DARK}/>
      <circle  cx="89"  cy="65" r="2" fill="white"/>
      <circle  cx="115" cy="65" r="2" fill="white"/>
      {/* raised eyebrows */}
      <path d="M80 59 Q87 55 94 58" stroke={HAIR} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M106 58 Q113 55 120 59" stroke={HAIR} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      {/* open mouth */}
      <path d="M87 87 Q100 95 113 87" stroke={DARK} strokeWidth="2" fill="none"/>
      <ellipse cx="100" cy="90" rx="11" ry="7" fill="#B91C1C"/>
      {/* toga */}
      <path d="M55 118 Q72 110 100 114 Q128 110 145 118 L150 200 L50 200 Z" fill="#EFF6FF" stroke="#BFDBFE" strokeWidth="1.5"/>
      {/* arm + scroll */}
      <path d="M134 108 L146 74" stroke={SKIN} strokeWidth="9" strokeLinecap="round"/>
      <rect x="148" y="52" width="20" height="32" rx="5" fill="#FEF9C3" stroke="#D97706" strokeWidth="2"/>
      <line x1="153" y1="62" x2="163" y2="62" stroke="#D97706" strokeWidth="1.5"/>
      <line x1="153" y1="68" x2="163" y2="68" stroke="#D97706" strokeWidth="1.5"/>
      <line x1="153" y1="74" x2="163" y2="74" stroke="#D97706" strokeWidth="1.5"/>
    </>
  ),

  /* ── Lv 3: ソクラテス ── */
  3: (
    <>
      <rect width="200" height="200" rx="24" fill="#FEE2E2"/>
      {/* bald head */}
      <circle cx="100" cy="72" r="42" fill="#E0A870"/>
      {/* tiny side stubble */}
      <path d="M58 80 Q55 65 62 55" stroke="#6B4423" strokeWidth="5" strokeLinecap="round" fill="none"/>
      <path d="M142 80 Q145 65 138 55" stroke="#6B4423" strokeWidth="5" strokeLinecap="round" fill="none"/>
      <ellipse cx="58"  cy="78" rx="7" ry="11" fill="#E0A870"/>
      <ellipse cx="142" cy="78" rx="7" ry="11" fill="#E0A870"/>
      {/* eyes */}
      <ellipse cx="86"  cy="65" rx="5"  ry="5.5" fill={DARK}/>
      <ellipse cx="114" cy="65" rx="5"  ry="5.5" fill={DARK}/>
      <circle  cx="88"  cy="63" r="2"   fill="white"/>
      <circle  cx="116" cy="63" r="2"   fill="white"/>
      {/* bushy eyebrows */}
      <path d="M78 57 Q86 53 94 56" stroke="#6B4423" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
      <path d="M106 56 Q114 53 122 57" stroke="#6B4423" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
      {/* HUGE beard */}
      <path d="M61 94 Q56 116 65 138 Q80 162 100 164 Q120 162 135 138 Q144 116 139 94 Q121 102 100 100 Q79 102 61 94 Z" fill="#9B7653"/>
      <path d="M72 108 Q78 124 85 136" stroke="#7A5C3A" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.55"/>
      <path d="M100 103 L100 146"       stroke="#7A5C3A" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.55"/>
      <path d="M128 108 Q122 124 115 136" stroke="#7A5C3A" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.55"/>
      {/* toga */}
      <path d="M54 148 Q68 140 100 144 Q132 140 146 148 L150 200 L50 200 Z" fill="#F5F5F5" stroke="#E5E5E5" strokeWidth="1.5"/>
      {/* index finger raised */}
      <path d="M144 132 L148 106 L152 100 L156 104 L153 132" fill={SKIN} stroke={SKIN2} strokeWidth="1.5"/>
    </>
  ),

  /* ── Lv 4: プラトン ── */
  4: (
    <>
      <rect width="200" height="200" rx="24" fill="#EDE9FE"/>
      {/* long wavy hair */}
      <ellipse cx="100" cy="60" rx="44" ry="46" fill="#4A3728"/>
      <path d="M56 74 Q48 96 58 116" stroke="#4A3728" strokeWidth="15" strokeLinecap="round" fill="none"/>
      <path d="M144 74 Q152 96 142 116" stroke="#4A3728" strokeWidth="15" strokeLinecap="round" fill="none"/>
      {/* face */}
      <ellipse cx="100" cy="74" rx="36" ry="40" fill={SKIN}/>
      <ellipse cx="64"  cy="76" rx="7" ry="11" fill={SKIN}/>
      <ellipse cx="136" cy="76" rx="7" ry="11" fill={SKIN}/>
      {/* eyes */}
      <ellipse cx="86"  cy="66" rx="5.5" ry="6" fill={DARK}/>
      <ellipse cx="114" cy="66" rx="5.5" ry="6" fill={DARK}/>
      <circle  cx="88.5" cy="64" r="2" fill="white"/>
      <circle  cx="116.5" cy="64" r="2" fill="white"/>
      {/* strong brows */}
      <path d="M78 58 Q86 54 94 57" stroke="#4A3728" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M106 57 Q114 54 122 58" stroke="#4A3728" strokeWidth="3" strokeLinecap="round" fill="none"/>
      {/* full beard */}
      <path d="M64 98 Q60 118 70 138 Q84 162 100 164 Q116 162 130 138 Q140 118 136 98 Q118 106 100 104 Q82 106 64 98 Z" fill="#5C4030"/>
      <path d="M78 112 Q82 128 88 142" stroke="#4A3728" strokeWidth="1.5" fill="none" opacity="0.5"/>
      <path d="M100 106 L100 148"       stroke="#4A3728" strokeWidth="1.5" fill="none" opacity="0.5"/>
      <path d="M122 112 Q118 128 112 142" stroke="#4A3728" strokeWidth="1.5" fill="none" opacity="0.5"/>
      {/* BROAD shoulders toga */}
      <path d="M25 158 Q55 142 100 148 Q145 142 175 158 L180 200 L20 200 Z" fill="#DDD6FE" stroke="#C4B5FD" strokeWidth="2"/>
      {/* scroll */}
      <rect x="18" y="158" width="22" height="34" rx="5" fill="#FEF9C3" stroke="#D97706" strokeWidth="2"/>
      <line x1="24" y1="168" x2="34" y2="168" stroke="#D97706" strokeWidth="1.5"/>
      <line x1="24" y1="174" x2="34" y2="174" stroke="#D97706" strokeWidth="1.5"/>
      <line x1="24" y1="180" x2="34" y2="180" stroke="#D97706" strokeWidth="1.5"/>
    </>
  ),

  /* ── Lv 5: アリストテレス ── */
  5: (
    <>
      <rect width="200" height="200" rx="24" fill="#DCFCE7"/>
      {/* hair */}
      <ellipse cx="100" cy="62" rx="38" ry="40" fill={HAIR}/>
      {/* face */}
      <ellipse cx="100" cy="74" rx="33" ry="37" fill={SKIN}/>
      <ellipse cx="67"  cy="76" rx="7"  ry="10" fill={SKIN}/>
      <ellipse cx="133" cy="76" rx="7"  ry="10" fill={SKIN}/>
      {/* eyes — focused */}
      <ellipse cx="87"  cy="67" rx="5"  ry="5.5" fill={DARK}/>
      <ellipse cx="113" cy="67" rx="5"  ry="5.5" fill={DARK}/>
      <circle  cx="89"  cy="65" r="2"   fill="white"/>
      <circle  cx="115" cy="65" r="2"   fill="white"/>
      <path d="M80 59 Q87 56 94 58" stroke={HAIR} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M106 58 Q113 56 120 59" stroke={HAIR} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      {/* neat trimmed beard */}
      <path d="M70 98 Q68 116 76 132 Q88 150 100 152 Q112 150 124 132 Q132 116 130 98 Q115 105 100 104 Q85 105 70 98 Z" fill="#6B4A2A"/>
      {/* toga + robe */}
      <path d="M44 152 Q68 144 100 148 Q132 144 156 152 L160 200 L40 200 Z" fill="#ECFDF5" stroke="#BBF7D0" strokeWidth="1.5"/>
      {/* open book */}
      <rect x="40" y="156" width="54" height="40" rx="3" fill="#FEF3C7" stroke="#D97706" strokeWidth="2"/>
      <rect x="106" y="156" width="54" height="40" rx="3" fill="#FFFBEB" stroke="#D97706" strokeWidth="2"/>
      <line x1="48"  y1="167" x2="86"  y2="167" stroke="#D97706" strokeWidth="1"/>
      <line x1="48"  y1="174" x2="86"  y2="174" stroke="#D97706" strokeWidth="1"/>
      <line x1="48"  y1="181" x2="86"  y2="181" stroke="#D97706" strokeWidth="1"/>
      <line x1="114" y1="167" x2="152" y2="167" stroke="#D97706" strokeWidth="1"/>
      <line x1="114" y1="174" x2="152" y2="174" stroke="#D97706" strokeWidth="1"/>
      <line x1="114" y1="181" x2="152" y2="181" stroke="#D97706" strokeWidth="1"/>
      {/* pointing finger */}
      <path d="M152 148 L166 126 L170 120 L174 124 L162 148" fill={SKIN} stroke={SKIN2} strokeWidth="1.5"/>
    </>
  ),

  /* ── Lv 6: デカルト ── */
  6: (
    <>
      <rect width="200" height="200" rx="24" fill="#DBEAFE"/>
      {/* long curly 17c hair */}
      <path d="M58 70 Q50 102 54 144" stroke={HAIR} strokeWidth="18" strokeLinecap="round" fill="none"/>
      <path d="M142 70 Q150 102 146 144" stroke={HAIR} strokeWidth="18" strokeLinecap="round" fill="none"/>
      <ellipse cx="100" cy="62" rx="42" ry="46" fill={HAIR}/>
      {/* face */}
      <ellipse cx="100" cy="74" rx="34" ry="38" fill={SKIN}/>
      <ellipse cx="66"  cy="74" rx="7"  ry="10" fill={SKIN}/>
      <ellipse cx="134" cy="74" rx="7"  ry="10" fill={SKIN}/>
      {/* eyes */}
      <ellipse cx="87"  cy="66" rx="5.5" ry="6" fill={DARK}/>
      <ellipse cx="113" cy="66" rx="5.5" ry="6" fill={DARK}/>
      <circle  cx="89.5" cy="64" r="2" fill="white"/>
      <circle  cx="115.5" cy="64" r="2" fill="white"/>
      {/* thin mustache + goatee */}
      <path d="M86 84 Q93 80 100 81 Q107 80 114 84" stroke={DARK} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <ellipse cx="100" cy="94" rx="7" ry="6" fill={HAIR}/>
      {/* RUFFLED COLLAR — centrepiece */}
      <path d="M48 118 Q64 106 80 114 Q90 106 100 114 Q110 106 120 114 Q136 106 152 118"
            stroke="white" strokeWidth="14" strokeLinecap="round" fill="none"/>
      <path d="M48 118 Q64 106 80 114 Q90 106 100 114 Q110 106 120 114 Q136 106 152 118"
            stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" fill="none"/>
      {/* coat */}
      <path d="M54 130 Q72 120 100 124 Q128 120 146 130 L150 200 L50 200 Z" fill="#1E3A5F"/>
      {/* quill */}
      <path d="M153 92 L128 148" stroke="#D4A84B" strokeWidth="3" strokeLinecap="round"/>
      <path d="M153 92 Q160 80 166 70 Q157 82 153 92 Z" fill="#FFFDE7" stroke="#D97706" strokeWidth="1"/>
      {/* coordinate axes (small) */}
      <circle cx="34" cy="52" r="19" fill="#1D4ED8" opacity="0.12"/>
      <line x1="34" y1="36" x2="34" y2="68" stroke="#3B82F6" strokeWidth="1.5" opacity="0.7"/>
      <line x1="18" y1="52" x2="50" y2="52" stroke="#3B82F6" strokeWidth="1.5" opacity="0.7"/>
      <text x="46" y="48" fontSize="9" fill="#3B82F6" opacity="0.8" fontFamily="sans-serif">x</text>
      <text x="36" y="34" fontSize="9" fill="#3B82F6" opacity="0.8" fontFamily="sans-serif">y</text>
    </>
  ),

  /* ── Lv 7: カント ── */
  7: (
    <>
      <rect width="200" height="200" rx="24" fill="#F1F5F9"/>
      {/* tricorn hat */}
      <path d="M52 66 Q100 28 148 66 L140 76 L100 52 L60 76 Z" fill="#1E293B"/>
      <path d="M52 66 L60 76 L140 76 L148 66" fill="#0F172A"/>
      {/* powdered wig wisps */}
      <path d="M60 76 Q56 90 58 108" stroke="#CBD5E1" strokeWidth="11" strokeLinecap="round" fill="none"/>
      <path d="M140 76 Q144 90 142 108" stroke="#CBD5E1" strokeWidth="11" strokeLinecap="round" fill="none"/>
      {/* face */}
      <ellipse cx="100" cy="84" rx="32" ry="36" fill={SKIN}/>
      <ellipse cx="68"  cy="84" rx="7"  ry="10" fill={SKIN}/>
      <ellipse cx="132" cy="84" rx="7"  ry="10" fill={SKIN}/>
      {/* stern eyes */}
      <ellipse cx="87"  cy="78" rx="5"  ry="5.5" fill={DARK}/>
      <ellipse cx="113" cy="78" rx="5"  ry="5.5" fill={DARK}/>
      <circle  cx="89"  cy="76" r="2"   fill="white"/>
      <circle  cx="115" cy="76" r="2"   fill="white"/>
      <path d="M80 70 Q87 67 94 69" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M106 69 Q113 67 120 70" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      {/* thin lips */}
      <path d="M90 96 Q100 99 110 96" stroke={DARK} strokeWidth="2" strokeLinecap="round" fill="none"/>
      {/* formal coat */}
      <path d="M48 130 Q68 120 100 124 Q132 120 152 130 L155 200 L45 200 Z" fill="#334155"/>
      {/* lapels */}
      <path d="M100 124 L84 138 L78 130 L100 120" fill="#475569"/>
      <path d="M100 124 L116 138 L122 130 L100 120" fill="#475569"/>
      {/* white cravat */}
      <ellipse cx="100" cy="128" rx="13" ry="8" fill="white"/>
      {/* coat buttons */}
      <circle cx="100" cy="144" r="3.5" fill="#94A3B8"/>
      <circle cx="100" cy="157" r="3.5" fill="#94A3B8"/>
      <circle cx="100" cy="170" r="3.5" fill="#94A3B8"/>
    </>
  ),

  /* ── Lv 8: ヘーゲル ── */
  8: (
    <>
      <rect width="200" height="200" rx="24" fill="#CCFBF1"/>
      {/* sparse top + big side whiskers */}
      <ellipse cx="100" cy="62" rx="34" ry="34" fill="#2C1810"/>
      <ellipse cx="64"  cy="90" rx="15" ry="22" fill="#2C1810"/>
      <ellipse cx="136" cy="90" rx="15" ry="22" fill="#2C1810"/>
      {/* face */}
      <ellipse cx="100" cy="80" rx="34" ry="38" fill="#DEB887"/>
      <ellipse cx="66"  cy="80" rx="8"  ry="11" fill="#DEB887"/>
      <ellipse cx="134" cy="80" rx="8"  ry="11" fill="#DEB887"/>
      {/* ROUND SPECTACLES */}
      <circle cx="86"  cy="74" r="13" fill="none" stroke="#1C1917" strokeWidth="3"/>
      <circle cx="114" cy="74" r="13" fill="none" stroke="#1C1917" strokeWidth="3"/>
      <circle cx="86"  cy="74" r="11" fill="#D1FAE5" opacity="0.4"/>
      <circle cx="114" cy="74" r="11" fill="#D1FAE5" opacity="0.4"/>
      <path d="M99 74 L101 74" stroke="#1C1917" strokeWidth="3"/>
      <path d="M73 70 L58 69"  stroke="#1C1917" strokeWidth="2.5"/>
      <path d="M127 70 L142 69" stroke="#1C1917" strokeWidth="2.5"/>
      {/* eyes behind glasses */}
      <circle cx="86"  cy="74" r="5" fill="#2C1810"/>
      <circle cx="114" cy="74" r="5" fill="#2C1810"/>
      <circle cx="88"  cy="72" r="2" fill="white"/>
      <circle cx="116" cy="72" r="2" fill="white"/>
      {/* stern mouth */}
      <path d="M88 97 Q100 101 112 97" stroke="#8B6347" strokeWidth="2" strokeLinecap="round" fill="none"/>
      {/* formal coat */}
      <path d="M46 132 Q68 122 100 126 Q132 122 154 132 L157 200 L43 200 Z" fill="#134E4A"/>
      {/* white cravat */}
      <path d="M93 126 L100 144 L107 126" fill="white" stroke="#D1D5DB" strokeWidth="1"/>
      {/* arm pointing up — dialectical synthesis */}
      <path d="M148 124 L158 96 L162 88 L167 92 L158 122" fill="#DEB887" stroke="#C9A97A" strokeWidth="1.5"/>
      <path d="M162 78 L162 60 M157 68 L162 60 L167 68" stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    </>
  ),

  /* ── Lv 9: ニーチェ ── */
  9: (
    <>
      <rect width="200" height="200" rx="24" fill="#FEE2E2"/>
      {/* short dark hair */}
      <ellipse cx="100" cy="60" rx="38" ry="36" fill="#1C1917"/>
      {/* face */}
      <ellipse cx="100" cy="70" rx="35" ry="40" fill="#E8B88A"/>
      <ellipse cx="65"  cy="76" rx="7"  ry="11" fill="#E8B88A"/>
      <ellipse cx="135" cy="76" rx="7"  ry="11" fill="#E8B88A"/>
      {/* intense deep-set eyes */}
      <ellipse cx="86"  cy="64" rx="7"  ry="6.5" fill="#1C1917"/>
      <ellipse cx="114" cy="64" rx="7"  ry="6.5" fill="#1C1917"/>
      <circle  cx="89"  cy="62" r="2.5" fill="white"/>
      <circle  cx="117" cy="62" r="2.5" fill="white"/>
      {/* HEAVY brow ridges */}
      <path d="M76 54 Q86 49 96 53" stroke="#1C1917" strokeWidth="4.5" strokeLinecap="round" fill="none"/>
      <path d="M104 53 Q114 49 124 54" stroke="#1C1917" strokeWidth="4.5" strokeLinecap="round" fill="none"/>
      {/* THE MAGNIFICENT MUSTACHE */}
      <path d="M65 86 Q75 77 92 82 Q100 84 108 82 Q125 77 135 86 Q144 98 135 108 Q122 116 108 109 Q100 105 92 109 Q78 116 65 108 Q56 98 65 86 Z" fill="#1C1917"/>
      {/* mustache highlights */}
      <path d="M70 91 Q78 85 90 89" stroke="#374151" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.45"/>
      <path d="M110 89 Q122 85 130 91" stroke="#374151" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.45"/>
      {/* dramatic dark cape */}
      <path d="M28 142 Q46 126 100 132 Q154 126 172 142 L186 200 L14 200 Z" fill="#1C1917"/>
      <path d="M100 132 L78 152 L70 142 L100 128" fill="#111827"/>
      <path d="M100 132 L122 152 L130 142 L100 128" fill="#111827"/>
      {/* red passion brooch */}
      <circle cx="100" cy="140" r="6" fill="#DC2626"/>
      <circle cx="100" cy="140" r="3" fill="#F87171"/>
    </>
  ),

  /* ── Lv 10: ロゴスの神 ── */
  10: (
    <>
      <rect width="200" height="200" rx="24" fill="#0F0A1E"/>
      {/* stars */}
      {[
        [28,28],[172,22],[14,82],[186,68],[22,152],[178,158],[52,8],[160,192],[90,18],[142,175],
      ].map(([cx,cy],i) => (
        <circle key={i} cx={cx} cy={cy} r={i%3===0?1.5:1} fill="white" opacity={0.4+0.3*(i%3)}/>
      ))}
      {/* radiant glow */}
      <circle cx="100" cy="80" r="62" fill="#F59E0B" opacity="0.10"/>
      <circle cx="100" cy="80" r="46" fill="#F59E0B" opacity="0.10"/>
      <circle cx="100" cy="80" r="30" fill="#F59E0B" opacity="0.10"/>
      {/* light rays */}
      <line x1="100" y1="18" x2="100" y2="8"  stroke="#F59E0B" strokeWidth="2" opacity="0.5"/>
      <line x1="136" y1="44" x2="150" y2="30" stroke="#F59E0B" strokeWidth="2" opacity="0.5"/>
      <line x1="148" y1="80" x2="170" y2="78" stroke="#F59E0B" strokeWidth="2" opacity="0.5"/>
      <line x1="64"  y1="44" x2="50"  y2="30" stroke="#F59E0B" strokeWidth="2" opacity="0.5"/>
      <line x1="52"  y1="80" x2="30"  y2="78" stroke="#F59E0B" strokeWidth="2" opacity="0.5"/>
      {/* sacred geometry */}
      <circle cx="100" cy="78" r="50" fill="none" stroke="#818CF8" strokeWidth="1" opacity="0.35"/>
      <polygon points="100,34 138,102 62,102" fill="none" stroke="#818CF8" strokeWidth="1" opacity="0.28"/>
      <polygon points="100,122 62,54 138,54" fill="none" stroke="#818CF8" strokeWidth="1" opacity="0.28"/>
      {/* glowing hair/halo */}
      <ellipse cx="100" cy="60" rx="38" ry="40" fill="#F59E0B" opacity="0.85"/>
      <ellipse cx="100" cy="60" rx="30" ry="32" fill="#FEF9C3"/>
      {/* ethereal face */}
      <ellipse cx="100" cy="74" rx="28" ry="32" fill="#FFFDE7"/>
      <ellipse cx="72"  cy="76" rx="6"  ry="9"  fill="#FFFDE7"/>
      <ellipse cx="128" cy="76" rx="6"  ry="9"  fill="#FFFDE7"/>
      {/* glowing eyes */}
      <circle cx="88"  cy="68" r="7" fill="#4338CA"/>
      <circle cx="112" cy="68" r="7" fill="#4338CA"/>
      <circle cx="88"  cy="68" r="4.5" fill="#818CF8"/>
      <circle cx="112" cy="68" r="4.5" fill="#818CF8"/>
      <circle cx="90"  cy="66" r="2" fill="white"/>
      <circle cx="114" cy="66" r="2" fill="white"/>
      {/* serene smile */}
      <path d="M90 88 Q100 96 110 88" stroke="#6D28D9" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      {/* divine robe */}
      <path d="M40 128 Q62 116 100 120 Q138 116 160 128 L172 200 L28 200 Z" fill="#312E81"/>
      <path d="M40 128 Q62 116 100 120 Q138 116 160 128" stroke="#F59E0B" strokeWidth="2.5" fill="none"/>
      {/* Λ (Logos) symbol */}
      <text x="100" y="172" textAnchor="middle" fontSize="28" fontWeight="bold" fill="#F59E0B" opacity="0.9" fontFamily="Georgia, serif">Λ</text>
    </>
  ),
}
