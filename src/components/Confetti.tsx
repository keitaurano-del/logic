// CSS-only confetti — no external dependencies

const COLORS = [
  '#3D5FC4', '#9EB3F0', '#EEF2FE',  // brand indigo family
  '#10B981', '#34D399',              // green
  '#F59E0B', '#FCD34D',              // gold
  '#F97316', '#FB923C',              // orange
  '#EC4899', '#A78BFA',              // pink / purple
  '#FFFFFF',
]

interface Piece {
  id: number
  color: string
  left: number
  delay: number
  duration: number
  size: number
  rotation: number
  isRect: boolean
}

const pieces: Piece[] = Array.from({ length: 52 }, (_, i) => ({
  id: i,
  color: COLORS[i % COLORS.length],
  left: (i * 1.92) % 100,           // spread evenly across width
  delay: (i * 0.03) % 1.2,
  duration: 1.6 + (i * 0.07) % 1.2,
  size: 6 + (i * 3) % 10,
  rotation: (i * 37) % 360,
  isRect: i % 3 !== 0,              // mix of squares and circles
}))

export function Confetti() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9998,
        overflow: 'hidden',
      }}
      aria-hidden
    >
      {pieces.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.left}%`,
            top: -20,
            width: p.size,
            height: p.isRect ? p.size * 0.55 : p.size,
            background: p.color,
            borderRadius: p.isRect ? 2 : '50%',
            opacity: 0.92,
            animation: `confetti-fall ${p.duration}s ${p.delay}s ease-in forwards`,
            transform: `rotate(${p.rotation}deg)`,
          }}
        />
      ))}
    </div>
  )
}
