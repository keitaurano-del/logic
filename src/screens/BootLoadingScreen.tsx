import { t } from '../i18n'

const SURFACE = '#1A1F2E'

export function BootLoadingScreen() {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        inset: 0,
        background: SURFACE,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        padding: 'env(safe-area-inset-top, 0) 24px env(safe-area-inset-bottom, 0)',
        zIndex: 9999,
      }}
    >
      <img
        src="/launcher-icon.png"
        alt="Logic"
        width={120}
        height={120}
        style={{
          borderRadius: 24,
          boxShadow: '0 12px 32px rgba(0,0,0,0.32)',
          animation: 'logicBootPulse 1.8s ease-in-out infinite',
        }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <svg
          aria-hidden="true"
          width="32"
          height="32"
          viewBox="0 0 32 32"
          style={{ animation: 'logicBootSpin 1.2s linear infinite' }}
        >
          {/* Full thin track so the shape always reads as a circle */}
          <circle
            cx="16"
            cy="16"
            r="13"
            fill="none"
            stroke="rgba(255,255,255,0.22)"
            strokeWidth="3"
          />
          {/* Highlighted arc that rotates around the circle */}
          <circle
            cx="16"
            cy="16"
            r="13"
            fill="none"
            stroke="rgba(255,255,255,0.92)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="22 60"
            transform="rotate(-90 16 16)"
          />
        </svg>
        <p
          style={{
            margin: 0,
            color: 'rgba(255,255,255,0.78)',
            fontSize: 14,
            fontWeight: 500,
            letterSpacing: '0.02em',
            fontFamily: "'Noto Sans JP', sans-serif",
          }}
        >
          {t('boot.loading')}
        </p>
      </div>
      <style>{`
        @keyframes logicBootSpin {
          to { transform: rotate(360deg); }
        }
        @keyframes logicBootPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(0.97); opacity: 0.92; }
        }
      `}</style>
    </div>
  )
}
