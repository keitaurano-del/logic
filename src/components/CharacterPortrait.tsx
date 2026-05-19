// キャラ立ち絵共通コンポーネント
// public/characters/{id}_{expression}.png があればそれを表示、
// 無ければアクセントカラーのグラデ + イニシャル文字（CSS placeholder）にフォールバック。
//
// blinking=true でまばたきアニメ、bouncing=true で軽くバウンド。

import { useEffect, useState } from 'react'
import type { Character, CharacterExpression } from '../roleplayCharacters'

interface Props {
  character: Character
  size?: number
  expression?: CharacterExpression
  /** まばたきアニメを有効化（4-6 秒間隔） */
  blinking?: boolean
  /** 一時的にバウンドさせる（true → translateY(-4px)、false → 元位置） */
  bouncing?: boolean
}

export function CharacterPortrait({
  character,
  size = 96,
  expression = 'neutral',
  blinking = false,
  bouncing = false,
}: Props) {
  const [imgFailed, setImgFailed] = useState(false)
  const [blink, setBlink] = useState(false)

  useEffect(() => {
    if (!blinking) return
    let cancelled = false
    const loop = () => {
      if (cancelled) return
      const delay = 4000 + Math.random() * 2000
      setTimeout(() => {
        if (cancelled) return
        setBlink(true)
        setTimeout(() => {
          if (cancelled) return
          setBlink(false)
          loop()
        }, 120)
      }, delay)
    }
    loop()
    return () => { cancelled = true }
  }, [blinking])

  const transform = bouncing ? 'translateY(-4px)' : 'translateY(0)'
  const opacity = blink ? 0.3 : 1
  const containerStyle: React.CSSProperties = {
    width: size, height: size, borderRadius: '50%',
    position: 'relative',
    overflow: 'hidden',
    flexShrink: 0,
    background: `radial-gradient(circle at 30% 30%, color-mix(in srgb, ${character.accentColor} 65%, white) 0%, ${character.accentColor} 100%)`,
    boxShadow: `0 ${size * 0.06}px ${size * 0.18}px color-mix(in srgb, ${character.accentColor} 35%, transparent)`,
    transform,
    transition: 'transform 180ms ease, opacity 100ms ease',
    opacity,
    userSelect: 'none',
  }

  return (
    <div style={containerStyle} aria-hidden="true">
      {/* 背景レイヤー: イニシャル文字（画像が無い／読み込み失敗時のフォールバック） */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Caveat, "Noto Serif JP", serif',
        fontSize: size * 0.55,
        fontWeight: 700,
        color: 'rgba(255,255,255,0.92)',
        letterSpacing: '0.02em',
      }}>
        {character.initial}
      </div>
      {/* 画像レイヤー: あれば background を覆い隠す */}
      {!imgFailed && (
        <img
          src={character.images[expression]}
          alt=""
          onError={() => setImgFailed(true)}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      )}
    </div>
  )
}
