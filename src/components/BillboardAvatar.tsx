import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { TextureLoader, type Mesh, type Texture } from 'three'
import * as THREE from 'three'

export type BillboardState = 'idle' | 'talking' | 'thinking'

interface BillboardAvatarProps {
  /** 透過 PNG キャラ画像の URL */
  imageUrl: string
  state: BillboardState
  /** 平面の幅（高さは画像のアスペクト比に従う） */
  width?: number
  /** 表示の縦オフセット */
  y?: number
  /** 画像ロード失敗時のコールバック（親が procedural fallback に切り替える用） */
  onError?: () => void
}

/**
 * 高クオリティな 2D キャラ画像（Pixar 風 AI 生成等）を Three.js シーン内の
 * 板（plane）に貼り付けて表示する。
 *
 * Three.js のシーン演出（背景グラデ・床ディスク・ライティング）と組み合わせる
 * ことで「3D 空間に立つ 2D キャラ」になり、軽い揺らぎ／傾き／浮遊で
 * 「キャラが生きてる感」を出す。
 *
 * idle: 呼吸（上下 ~0.02 単位）＋微細なスウェイ
 * talking: より大きい上下バウンス＋首振り風 sway
 * thinking: 軽く傾けて見上げる
 */
export function BillboardAvatar({
  imageUrl,
  state,
  width = 2.0,
  y = 0.95,
  onError,
}: BillboardAvatarProps) {
  const meshRef = useRef<Mesh>(null)
  // 自前 TextureLoader で colorSpace 等をロード時にセット
  // （useLoader 経由のテクスチャは外部 mutate がリンタで禁止されるため）
  const [texture, setTexture] = useState<Texture | null>(null)
  useEffect(() => {
    let cancelled = false
    const loader = new TextureLoader()
    loader.load(
      imageUrl,
      (tex) => {
        if (cancelled) return
        tex.colorSpace = THREE.SRGBColorSpace
        tex.anisotropy = 4
        setTexture(tex)
      },
      undefined,
      // 404 や CORS など、ロード失敗時は親に通知して fallback してもらう
      () => { if (!cancelled) onError?.() },
    )
    return () => { cancelled = true }
  }, [imageUrl, onError])

  const img = texture?.image as { width?: number; height?: number } | undefined
  const aspect = img?.width && img.height ? img.width / img.height : 1
  const height = width / aspect

  useFrame(({ clock }) => {
    const m = meshRef.current
    if (!m) return
    const t = clock.getElapsedTime()
    // 共通の呼吸
    const breathe = Math.sin(t * 1.5) * 0.018

    if (state === 'talking') {
      m.position.y = y + breathe + Math.sin(t * 5.4) * 0.04
      m.rotation.z = Math.sin(t * 4.0) * 0.035
      m.rotation.y = Math.sin(t * 2.6) * 0.06
      // スケール脈動（呼吸＋話している感）
      const s = 1 + Math.sin(t * 5.0) * 0.012
      m.scale.set(s, s, 1)
    } else if (state === 'thinking') {
      m.position.y = y + breathe + 0.03
      m.rotation.z = -0.08 + Math.sin(t * 0.9) * 0.015
      m.rotation.y = -0.15 + Math.sin(t * 0.6) * 0.04
      m.scale.set(1, 1, 1)
    } else {
      m.position.y = y + breathe
      m.rotation.z = Math.sin(t * 0.4) * 0.012
      m.rotation.y = Math.sin(t * 0.5) * 0.05
      m.scale.set(1, 1, 1)
    }
  })

  if (!texture) return null

  return (
    <mesh ref={meshRef} position={[0, y, 0]}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial
        map={texture}
        transparent
        depthWrite={false}
        alphaTest={0.05}
      />
    </mesh>
  )
}
