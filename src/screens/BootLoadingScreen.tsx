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
        src="/app-icon.svg"
        alt="Logic"
        width={120}
        height={120}
        style={{
          borderRadius: 28,
          boxShadow: '0 12px 32px rgba(0,0,0,0.32)',
          animation: 'logicBootPulse 1.8s ease-in-out infinite',
        }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <div
          aria-hidden="true"
          style={{
            width: 28,
            height: 28,
            border: '3px solid rgba(255,255,255,0.18)',
            borderTopColor: 'rgba(255,255,255,0.85)',
            borderRadius: '50%',
            animation: 'logicBootSpin 0.9s linear infinite',
          }}
        />
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
