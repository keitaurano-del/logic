// ロールプレイ画面：キャラ（哲学者）一覧
// 2026-05-19 シチュエーション軸 → キャラ軸に全面リプレース。
// 画像が無い間は CSS placeholder（アクセントカラーのグラデ + イニシャル）で表示する。

import { useState } from 'react'
import { ArrowLeftIcon, BookmarkIcon, BookmarkFilledIcon } from '../icons'
import { IconButton } from '../components/IconButton'
import { isSaved, toggleSaved } from '../savedItemsStore'
import { haptic } from '../platform/haptics'
import { t } from '../i18n'
import { CHARACTERS, localized, type Character } from '../roleplayCharacters'

interface RoleplaySelectScreenProps {
  onBack: () => void
  onStart: (characterId: string) => void
  /** 旧シグネチャ互換用。ロールプレイは全プラン無制限。 */
  onUpgrade?: () => void
}

// 画像が無いときの placeholder。アクセントカラーのグラデ + 大きなイニシャル文字。
function CharacterPortraitPlaceholder({ character, size = 96 }: { character: Character; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      flexShrink: 0,
      background: `radial-gradient(circle at 30% 30%, color-mix(in srgb, ${character.accentColor} 65%, white) 0%, ${character.accentColor} 100%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Caveat, "Noto Serif JP", serif',
      fontSize: size * 0.5,
      fontWeight: 700,
      color: 'rgba(255,255,255,0.9)',
      boxShadow: `0 6px 18px color-mix(in srgb, ${character.accentColor} 35%, transparent)`,
      letterSpacing: '0.02em',
      userSelect: 'none',
    }} aria-hidden="true">
      {character.initial}
    </div>
  )
}

function CharacterCard({
  character,
  onClick,
}: {
  character: Character
  onClick: () => void
}) {
  const [saved, setSaved] = useState<boolean>(() => isSaved('roleplay', character.id))

  const handleToggleSave = () => {
    haptic.light()
    const next = toggleSaved({
      type: 'roleplay',
      refId: character.id,
      title: localized(character.name),
      subtitle: localized(character.role),
    })
    setSaved(next)
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={onClick}
        style={{
          width: '100%',
          background: 'var(--bg-card)',
          border: `1.5px solid color-mix(in srgb, ${character.accentColor} 20%, transparent)`,
          borderRadius: 18,
          padding: '16px 16px 18px',
          cursor: 'pointer',
          textAlign: 'left',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          transition: 'border-color .15s, transform .12s',
        }}
      >
        {/* ヘッダー：立ち絵 + 名前 / 役柄 / 時代 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <CharacterPortraitPlaceholder character={character} size={84} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-.01em', lineHeight: 1.2 }}>
              {localized(character.name)}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: character.accentColor, marginTop: 4 }}>
              {localized(character.role)}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              {localized(character.era)}
            </div>
          </div>
        </div>

        {/* 紹介文 */}
        <div style={{
          fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6,
          paddingLeft: 12,
          borderLeft: `2px solid color-mix(in srgb, ${character.accentColor} 35%, transparent)`,
        }}>
          {localized(character.intro)}
        </div>

        {/* 口グセ */}
        <div style={{
          fontSize: 14, fontStyle: 'italic',
          color: 'var(--text-primary)',
          background: `color-mix(in srgb, ${character.accentColor} 8%, transparent)`,
          padding: '8px 12px', borderRadius: 10,
          fontFamily: '"Noto Serif JP", serif',
        }}>
          &ldquo;{localized(character.catchphrase)}&rdquo;
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: character.accentColor }}>
            {t('roleplaySelect.start')}
          </span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={character.accentColor} strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>
      </button>

      {/* 保存ボタン（親 button の外に置いて nested-interactive 回避） */}
      <button
        type="button"
        onClick={handleToggleSave}
        aria-label={saved ? t('roleplaySelect.unsaveAria') : t('roleplaySelect.saveAria')}
        aria-pressed={saved}
        style={{
          position: 'absolute', top: 12, right: 12,
          width: 32, height: 32, borderRadius: '50%',
          background: saved ? `color-mix(in srgb, ${character.accentColor} 18%, transparent)` : 'transparent',
          border: 'none',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          color: saved ? character.accentColor : 'var(--text-muted)',
          WebkitTapHighlightColor: 'transparent',
          zIndex: 2,
        }}
      >
        {saved ? <BookmarkFilledIcon width={16} height={16} /> : <BookmarkIcon width={16} height={16} />}
      </button>
    </div>
  )
}

export function RoleplaySelectScreen({ onBack, onStart, onUpgrade: _onUpgrade }: RoleplaySelectScreenProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', padding: '16px 16px 40px', background: 'var(--bg-primary)', minHeight: '100vh', color: 'var(--text-primary)', fontFamily: "'Noto Sans JP', sans-serif" }}>
      {/* ヘッダー */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0 16px' }}>
        <IconButton aria-label={t('roleplaySelect.backAria')} onClick={onBack}>
          <ArrowLeftIcon />
        </IconButton>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-.02em' }}>
              {t('roleplaySelect.title')}
            </div>
            <span style={{
              background: 'color-mix(in srgb, var(--brand) 15%, transparent)',
              color: 'var(--brand)',
              borderRadius: 99, padding: '2px 8px',
              fontSize: 10, fontWeight: 800, letterSpacing: '0.06em',
            }}>{t('roleplay.beta')}</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
            {t('roleplaySelect.subtitle')}
          </div>
        </div>
      </div>

      {/* 哲学者カード一覧 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
        <div style={{
          fontSize: 12, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase',
          color: 'var(--text-muted)',
        }}>
          {t('roleplaySelect.heading')}
        </div>
        {CHARACTERS.map((c) => (
          <CharacterCard
            key={c.id}
            character={c}
            onClick={() => onStart(c.id)}
          />
        ))}
      </div>

      {/* Live2D 注釈 */}
      <div style={{
        fontSize: 11, color: 'var(--text-muted)', textAlign: 'center',
        padding: '12px 16px', borderRadius: 10,
        background: `color-mix(in srgb, var(--brand) 4%, transparent)`,
        lineHeight: 1.6,
      }}>
        {t('roleplay.live2dNote')}
      </div>
    </div>
  )
}
