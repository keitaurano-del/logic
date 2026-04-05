import './DragonEvolution.css'

type Props = {
  level: number
  size?: number
}

export default function DragonEvolution({ level, size = 80 }: Props) {
  const stage = Math.min(level, 6)
  return (
    <div className={`dragon-evo stage-${stage}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 120 120" width={size} height={size}>
        <defs>
          <radialGradient id="shine" cx="35%" cy="30%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.25)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
          <linearGradient id="g-blue" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#5B8DEF" />
            <stop offset="100%" stopColor="#3B5FBF" />
          </linearGradient>
          <linearGradient id="g-purple" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#9B7FEE" />
            <stop offset="100%" stopColor="#6B4FCC" />
          </linearGradient>
          <linearGradient id="g-indigo" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4B6FDF" />
            <stop offset="100%" stopColor="#2840A8" />
          </linearGradient>
          <linearGradient id="g-dark" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2A3BA8" />
            <stop offset="100%" stopColor="#151A60" />
          </linearGradient>
          <linearGradient id="g-king" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1E2888" />
            <stop offset="100%" stopColor="#0A0E40" />
          </linearGradient>
          <linearGradient id="g-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#FFA000" />
          </linearGradient>
        </defs>
        {stage === 1 && <Egg />}
        {stage === 2 && <Baby />}
        {stage === 3 && <Young />}
        {stage === 4 && <Teen />}
        {stage === 5 && <Adult />}
        {stage === 6 && <King />}
      </svg>
    </div>
  )
}

/* Lv1: 卵 — 光沢感のある卵、ヒビから光 */
function Egg() {
  return (
    <g>
      <ellipse cx="60" cy="65" rx="26" ry="34" fill="#7B8FC8" />
      <ellipse cx="60" cy="65" rx="26" ry="34" fill="url(#shine)" />
      <path d="M45 52 Q52 44 65 50" fill="none" stroke="#9AA8D8" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
      <path d="M48 62 Q56 55 68 60" fill="none" stroke="#9AA8D8" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      {/* ヒビ+光 */}
      <path d="M50 40 L54 48 L48 52 L53 56" fill="none" stroke="#5A6AA0" strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="52" cy="48" rx="4" ry="3" fill="#FFE082" opacity="0.6" />
      {/* キラキラ */}
      <circle cx="72" cy="48" r="1.5" fill="#fff" opacity="0.7" />
      <circle cx="46" cy="72" r="1" fill="#fff" opacity="0.5" />
    </g>
  )
}

/* Lv2: 赤ちゃん竜 — 丸くて目がキラキラ */
function Baby() {
  return (
    <g>
      {/* 体 */}
      <ellipse cx="60" cy="72" rx="22" ry="18" fill="url(#g-purple)" />
      <ellipse cx="60" cy="74" rx="14" ry="10" fill="#B8A8F8" opacity="0.3" />
      {/* 頭 */}
      <circle cx="60" cy="48" r="22" fill="url(#g-purple)" />
      <circle cx="60" cy="48" r="22" fill="url(#shine)" />
      {/* 目 */}
      <ellipse cx="51" cy="46" rx="6" ry="7" fill="#fff" />
      <ellipse cx="69" cy="46" rx="6" ry="7" fill="#fff" />
      <ellipse cx="52" cy="47" rx="4" ry="5" fill="#2D1B69" />
      <ellipse cx="70" cy="47" rx="4" ry="5" fill="#2D1B69" />
      <circle cx="54" cy="44" r="2" fill="#fff" />
      <circle cx="72" cy="44" r="2" fill="#fff" />
      {/* 口 */}
      <path d="M55 56 Q60 60 65 56" fill="none" stroke="#6B4FCC" strokeWidth="2" strokeLinecap="round" />
      {/* 小角 */}
      <ellipse cx="46" cy="30" rx="4" ry="5" fill="#C4B0FF" transform="rotate(-15 46 30)" />
      <ellipse cx="74" cy="30" rx="4" ry="5" fill="#C4B0FF" transform="rotate(15 74 30)" />
      {/* 翼 */}
      <path d="M38 60 Q26 50 30 66 Q32 72 38 68" fill="#A890EE" opacity="0.7" />
      <path d="M82 60 Q94 50 90 66 Q88 72 82 68" fill="#A890EE" opacity="0.7" />
      {/* 足 */}
      <ellipse cx="48" cy="90" rx="7" ry="5" fill="#6B4FCC" />
      <ellipse cx="72" cy="90" rx="7" ry="5" fill="#6B4FCC" />
      {/* しっぽ */}
      <path d="M60 88 Q72 96 82 90" fill="none" stroke="#8B6FE0" strokeWidth="4" strokeLinecap="round" />
    </g>
  )
}

/* Lv3: 子竜 — スリムに、翼発達 */
function Young() {
  return (
    <g>
      {/* 体 */}
      <path d="M42 62 Q38 48 60 44 Q82 48 78 62 Q80 86 60 94 Q40 86 42 62" fill="url(#g-blue)" />
      <ellipse cx="60" cy="70" rx="12" ry="16" fill="#7BA0F0" opacity="0.25" />
      {/* 頭 */}
      <path d="M42 38 Q40 20 60 16 Q80 20 78 38 Q78 50 60 52 Q42 50 42 38" fill="url(#g-blue)" />
      <path d="M42 38 Q40 20 60 16 Q80 20 78 38 Q78 50 60 52 Q42 50 42 38" fill="url(#shine)" />
      {/* 目 */}
      <ellipse cx="52" cy="34" rx="5" ry="5.5" fill="#fff" />
      <ellipse cx="68" cy="34" rx="5" ry="5.5" fill="#fff" />
      <circle cx="53" cy="35" r="3.5" fill="#0D0640" />
      <circle cx="69" cy="35" r="3.5" fill="#0D0640" />
      <circle cx="55" cy="33" r="1.5" fill="#fff" />
      <circle cx="71" cy="33" r="1.5" fill="#fff" />
      {/* 鼻 */}
      <circle cx="57" cy="42" r="1.2" fill="#3B5FBF" />
      <circle cx="63" cy="42" r="1.2" fill="#3B5FBF" />
      {/* 角 */}
      <path d="M46 20 L40 8 L52 18" fill="#8BAAEF" />
      <path d="M74 20 L80 8 L68 18" fill="#8BAAEF" />
      {/* 翼 */}
      <path d="M40 52 Q18 34 24 58 Q20 70 32 70 Q36 64 40 58" fill="#6B90E8" opacity="0.8" />
      <path d="M80 52 Q102 34 96 58 Q100 70 88 70 Q84 64 80 58" fill="#6B90E8" opacity="0.8" />
      {/* 翼の筋 */}
      <path d="M24 58 Q30 48 36 44" fill="none" stroke="#8BAAEF" strokeWidth="1" opacity="0.5" />
      <path d="M96 58 Q90 48 84 44" fill="none" stroke="#8BAAEF" strokeWidth="1" opacity="0.5" />
      {/* 足 */}
      <path d="M48 92 L42 104 L50 100 L54 104 L52 92" fill="#3B5FBF" />
      <path d="M68 92 L66 104 L70 100 L78 104 L72 92" fill="#3B5FBF" />
      {/* しっぽ */}
      <path d="M60 94 Q76 104 88 96 Q94 90 92 84" fill="none" stroke="#4B70D0" strokeWidth="4" strokeLinecap="round" />
    </g>
  )
}

/* Lv4: 若竜 — 力強い、鋭い目 */
function Teen() {
  return (
    <g>
      {/* 体 */}
      <path d="M40 58 Q34 42 60 36 Q86 42 80 58 Q84 82 60 94 Q36 82 40 58" fill="url(#g-indigo)" />
      <path d="M48 54 Q48 44 60 40 Q72 44 72 54 Q72 76 60 82 Q48 76 48 54" fill="#5580DD" opacity="0.3" />
      {/* 頭 */}
      <path d="M38 32 Q36 10 60 6 Q84 10 82 32 Q82 46 60 50 Q38 46 38 32" fill="url(#g-indigo)" />
      <path d="M38 32 Q36 10 60 6 Q84 10 82 32" fill="url(#shine)" />
      {/* 目 */}
      <path d="M48 28 L58 26 L58 34 L48 32Z" fill="#60DDFF" />
      <path d="M72 28 L62 26 L62 34 L72 32Z" fill="#60DDFF" />
      <circle cx="55" cy="30" r="2" fill="#040820" />
      <circle cx="65" cy="30" r="2" fill="#040820" />
      {/* 角 */}
      <path d="M44 14 L34 -2 L50 10" fill="#6080E0" />
      <path d="M76 14 L86 -2 L70 10" fill="#6080E0" />
      <path d="M60 8 L60 -4 L64 6" fill="#6080E0" />
      {/* 翼 */}
      <path d="M36 46 Q6 18 14 52 Q8 68 26 70 Q32 62 36 54" fill="#3858CC" opacity="0.85" />
      <path d="M84 46 Q114 18 106 52 Q112 68 94 70 Q88 62 84 54" fill="#3858CC" opacity="0.85" />
      <path d="M14 52 Q22 38 30 30" fill="none" stroke="#5580DD" strokeWidth="1" opacity="0.5" />
      <path d="M106 52 Q98 38 90 30" fill="none" stroke="#5580DD" strokeWidth="1" opacity="0.5" />
      {/* 腕 */}
      <path d="M38 58 Q28 64 26 74 L34 70" fill="#1E3090" />
      <path d="M82 58 Q92 64 94 74 L86 70" fill="#1E3090" />
      {/* 足 */}
      <path d="M46 92 L40 106 L46 102 L52 106 L52 92" fill="#1E3090" />
      <path d="M68 92 L68 106 L74 102 L80 106 L74 92" fill="#1E3090" />
      {/* しっぽ */}
      <path d="M60 94 Q80 106 96 94 Q104 84 100 76" fill="none" stroke="#2840A8" strokeWidth="5" strokeLinecap="round" />
      <path d="M100 76 L106 70 L98 74" fill="#FF5252" />
    </g>
  )
}

/* Lv5: 成竜 — 堂々とした姿 */
function Adult() {
  return (
    <g>
      {/* 体 */}
      <path d="M38 54 Q30 36 60 28 Q90 36 82 54 Q86 80 60 94 Q34 80 38 54" fill="url(#g-dark)" />
      <path d="M46 48 Q46 38 60 34 Q74 38 74 48 Q74 74 60 82 Q46 74 46 48" fill="#4060D0" opacity="0.25" />
      {/* 頭 */}
      <path d="M36 28 Q34 4 60 0 Q86 4 84 28 Q84 44 60 48 Q36 44 36 28" fill="url(#g-dark)" />
      <path d="M36 28 Q34 4 60 0" fill="url(#shine)" />
      {/* 目 */}
      <path d="M44 24 L56 20 L56 30 L44 26Z" fill="#00E5FF" />
      <path d="M76 24 L64 20 L64 30 L76 26Z" fill="#00E5FF" />
      <circle cx="53" cy="25" r="2" fill="#000820" />
      <circle cx="67" cy="25" r="2" fill="#000820" />
      {/* 角 */}
      <path d="M42 8 L28 -12 L48 4" fill="#4060D0" />
      <path d="M78 8 L92 -12 L72 4" fill="#4060D0" />
      <path d="M60 4 L60 -10 L64 2" fill="#4060D0" />
      {/* 翼 */}
      <path d="M34 42 Q-2 8 8 46 Q0 66 22 68 Q28 58 34 50" fill="#2A4CB8" opacity="0.9" />
      <path d="M86 42 Q122 8 112 46 Q120 66 98 68 Q92 58 86 50" fill="#2A4CB8" opacity="0.9" />
      <path d="M8 46 Q18 30 28 22" fill="none" stroke="#4B6FDF" strokeWidth="1.2" opacity="0.4" />
      <path d="M8 46 Q14 40 20 38" fill="none" stroke="#4B6FDF" strokeWidth="0.8" opacity="0.3" />
      <path d="M112 46 Q102 30 92 22" fill="none" stroke="#4B6FDF" strokeWidth="1.2" opacity="0.4" />
      {/* 腕 */}
      <path d="M36 56 Q24 62 20 74 L28 70 L32 64" fill="#151A60" />
      <path d="M84 56 Q96 62 100 74 L92 70 L88 64" fill="#151A60" />
      {/* 足 */}
      <path d="M44 90 L36 108 L42 104 L48 108 L50 90" fill="#151A60" />
      <path d="M76 90 L72 108 L78 104 L84 108 L80 90" fill="#151A60" />
      {/* しっぽ */}
      <path d="M60 94 Q82 108 100 96 Q110 84 108 74" fill="none" stroke="#1A2870" strokeWidth="6" strokeLinecap="round" />
      <path d="M108 74 L114 66 L106 70 L112 62" fill="#FF3333" />
    </g>
  )
}

/* Lv6: 龍王 — 金角、オーラ */
function King() {
  return (
    <g>
      {/* オーラ */}
      <circle cx="60" cy="55" r="55" fill="none" stroke="url(#g-gold)" strokeWidth="1" opacity="0.2" />
      <circle cx="60" cy="55" r="48" fill="none" stroke="#4B8AFF" strokeWidth="0.5" opacity="0.15" />
      {/* 体 */}
      <path d="M36 52 Q28 32 60 24 Q92 32 84 52 Q88 78 60 92 Q32 78 36 52" fill="url(#g-king)" />
      <path d="M44 46 Q44 36 60 30 Q76 36 76 46 Q76 72 60 80 Q44 72 44 46" fill="#2040B0" opacity="0.2" />
      {/* 頭 */}
      <path d="M34 26 Q32 0 60 -6 Q88 0 86 26 Q86 42 60 46 Q34 42 34 26" fill="url(#g-king)" />
      <path d="M34 26 Q32 0 60 -6" fill="url(#shine)" />
      {/* 目 */}
      <path d="M42 22 L56 18 L56 28 L42 24Z" fill="#00E5FF" />
      <path d="M78 22 L64 18 L64 28 L78 24Z" fill="#00E5FF" />
      <path d="M42 22 L56 18 L56 28 L42 24Z" fill="#fff" opacity="0.2" />
      <path d="M78 22 L64 18 L64 28 L78 24Z" fill="#fff" opacity="0.2" />
      {/* 金角 */}
      <path d="M40 6 L24 -18 L46 0" fill="url(#g-gold)" />
      <path d="M80 6 L96 -18 L74 0" fill="url(#g-gold)" />
      <path d="M60 -2 L60 -18 L66 -4" fill="url(#g-gold)" />
      <path d="M48 2 L40 -10 L54 0" fill="#FFC000" />
      <path d="M72 2 L80 -10 L66 0" fill="#FFC000" />
      {/* 翼 */}
      <path d="M32 40 Q-6 2 4 44 Q-6 66 18 68 Q26 56 32 48" fill="#162070" opacity="0.9" />
      <path d="M88 40 Q126 2 116 44 Q126 66 102 68 Q94 56 88 48" fill="#162070" opacity="0.9" />
      <path d="M4 44 Q16 26 26 16" fill="none" stroke="#4B8AFF" strokeWidth="1" opacity="0.3" />
      <path d="M4 44 Q12 38 18 34" fill="none" stroke="#4B8AFF" strokeWidth="0.8" opacity="0.2" />
      <path d="M116 44 Q104 26 94 16" fill="none" stroke="#4B8AFF" strokeWidth="1" opacity="0.3" />
      {/* 腕 */}
      <path d="M34 54 Q20 60 16 72 L26 68 L30 60" fill="#0A0E40" />
      <path d="M86 54 Q100 60 104 72 L94 68 L90 60" fill="#0A0E40" />
      {/* 足 */}
      <path d="M42 88 L34 106 L40 102 L46 106 L48 88" fill="#0A0E40" />
      <path d="M78 88 L74 106 L80 102 L86 106 L82 88" fill="#0A0E40" />
      {/* しっぽ */}
      <path d="M60 92 Q84 108 102 94 Q112 82 110 70" fill="none" stroke="#0E1450" strokeWidth="6" strokeLinecap="round" />
      <path d="M110 70 L116 60 L108 66 L114 56 L106 64" fill="url(#g-gold)" />
      {/* 金パーティクル */}
      <circle cx="28" cy="14" r="1.5" fill="#FFD700" opacity="0.5" />
      <circle cx="92" cy="10" r="1.2" fill="#FFD700" opacity="0.4" />
      <circle cx="16" cy="48" r="1" fill="#FFD700" opacity="0.3" />
      <circle cx="104" cy="44" r="1.3" fill="#FFD700" opacity="0.4" />
    </g>
  )
}
