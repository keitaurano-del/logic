import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import * as THREE from 'three'

export type AvatarState = 'idle' | 'talking' | 'thinking'

export interface AvatarSpec {
  /** スキン/肌色 */
  skin: string
  /** 髪・髭の色（共通） */
  hair: string
  /** 衣服のメイン色（ジャケット・ローブ本体） */
  body: string
  /** 衣服のアクセント（パンツ・帯・コートの下） */
  accent: string
  /** 衣装タイプ */
  outfit: 'suit' | 'casual' | 'toga' | 'cloak' | 'frock'
  /** 髭の形 */
  beard: 'none' | 'short' | 'long' | 'mustache' | 'bushy'
  /** 髪の形 */
  hairStyle: 'short' | 'bald' | 'tousled' | 'slicked'
  /** メガネ */
  glasses?: boolean
  /** ネクタイ色（suit のとき） */
  tie?: string
}

interface ProceduralAvatarProps {
  spec: AvatarSpec
  state: AvatarState
}

type AvatarMaterials = {
  skin: THREE.MeshStandardMaterial
  hair: THREE.MeshStandardMaterial
  body: THREE.MeshStandardMaterial
  accent: THREE.MeshStandardMaterial
  tie: THREE.MeshStandardMaterial
  glasses: THREE.MeshStandardMaterial
  lens: THREE.MeshStandardMaterial
  mouth: THREE.MeshStandardMaterial
}

// ── ヘルパー：髭（module スコープ、static-components ルール準拠） ──
function Beard({ kind, hairMat }: { kind: AvatarSpec['beard']; hairMat: THREE.Material }) {
  if (kind === 'none') return null
  if (kind === 'mustache') {
    return (
      <mesh material={hairMat} position={[0, -0.05, 0.18]}>
        <boxGeometry args={[0.18, 0.04, 0.05]} />
      </mesh>
    )
  }
  if (kind === 'short') {
    return (
      <mesh material={hairMat} position={[0, -0.12, 0.16]}>
        <sphereGeometry args={[0.13, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
      </mesh>
    )
  }
  if (kind === 'long') {
    return (
      <group position={[0, -0.18, 0.14]}>
        <mesh material={hairMat}>
          <coneGeometry args={[0.18, 0.5, 18]} />
        </mesh>
      </group>
    )
  }
  // bushy
  return (
    <group position={[0, -0.13, 0.13]}>
      <mesh material={hairMat} position={[0, 0, 0]}>
        <sphereGeometry args={[0.18, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
      </mesh>
      <mesh material={hairMat} position={[-0.09, 0.04, 0.04]}>
        <sphereGeometry args={[0.07, 12, 10]} />
      </mesh>
      <mesh material={hairMat} position={[0.09, 0.04, 0.04]}>
        <sphereGeometry args={[0.07, 12, 10]} />
      </mesh>
    </group>
  )
}

// ── ヘルパー：髪 ──
function Hair({ kind, hairMat }: { kind: AvatarSpec['hairStyle']; hairMat: THREE.Material }) {
  if (kind === 'bald') return null
  if (kind === 'short') {
    return (
      <mesh material={hairMat} position={[0, 0.12, 0]}>
        <sphereGeometry args={[0.27, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.58]} />
      </mesh>
    )
  }
  if (kind === 'slicked') {
    return (
      <mesh material={hairMat} position={[0, 0.13, -0.02]}>
        <sphereGeometry args={[0.275, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.45]} />
      </mesh>
    )
  }
  // tousled
  return (
    <group position={[0, 0.13, 0]}>
      <mesh material={hairMat}>
        <sphereGeometry args={[0.28, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.65]} />
      </mesh>
      <mesh material={hairMat} position={[0.13, 0.05, 0]}>
        <sphereGeometry args={[0.09, 12, 10]} />
      </mesh>
      <mesh material={hairMat} position={[-0.12, 0.06, 0.03]}>
        <sphereGeometry args={[0.08, 12, 10]} />
      </mesh>
      <mesh material={hairMat} position={[0.03, 0.09, 0.08]}>
        <sphereGeometry args={[0.075, 12, 10]} />
      </mesh>
    </group>
  )
}

// ── ヘルパー：衣装 ──
function Outfit({ kind, mats }: { kind: AvatarSpec['outfit']; mats: AvatarMaterials }) {
  if (kind === 'toga') {
    return (
      <group>
        <mesh material={mats.body} position={[0, -0.05, 0]}>
          <cylinderGeometry args={[0.42, 0.55, 1.0, 18]} />
        </mesh>
        <mesh material={mats.accent} position={[0.05, 0.18, 0.05]} rotation={[0, 0, -0.4]}>
          <boxGeometry args={[0.65, 0.18, 0.36]} />
        </mesh>
        <mesh material={mats.body} position={[0, -0.6, 0]}>
          <coneGeometry args={[0.62, 0.4, 18]} />
        </mesh>
      </group>
    )
  }
  if (kind === 'cloak') {
    return (
      <group>
        <mesh material={mats.body} position={[0, 0, 0]}>
          <cylinderGeometry args={[0.46, 0.6, 1.1, 18]} />
        </mesh>
        <mesh material={mats.accent} position={[0, 0.4, -0.05]}>
          <torusGeometry args={[0.3, 0.09, 10, 18, Math.PI]} />
        </mesh>
        <mesh material={mats.body} position={[0, -0.6, 0]}>
          <coneGeometry args={[0.7, 0.5, 18]} />
        </mesh>
      </group>
    )
  }
  if (kind === 'frock') {
    return (
      <group>
        <mesh material={mats.body} position={[0, -0.05, 0]}>
          <boxGeometry args={[0.7, 1.05, 0.42]} />
        </mesh>
        <mesh material={mats.accent} position={[0, -0.05, 0.215]}>
          <boxGeometry args={[0.3, 0.95, 0.02]} />
        </mesh>
        {[0.18, 0.02, -0.14].map((y, i) => (
          <mesh key={i} material={mats.hair} position={[0, y, 0.23]}>
            <sphereGeometry args={[0.025, 8, 6]} />
          </mesh>
        ))}
      </group>
    )
  }
  if (kind === 'casual') {
    return (
      <group>
        <mesh material={mats.body} position={[0, 0.05, 0]}>
          <boxGeometry args={[0.72, 0.65, 0.44]} />
        </mesh>
        <mesh material={mats.accent} position={[0, -0.55, 0]}>
          <boxGeometry args={[0.7, 0.55, 0.42]} />
        </mesh>
      </group>
    )
  }
  // suit
  return (
    <group>
      <mesh material={mats.body} position={[0, 0.05, 0]}>
        <boxGeometry args={[0.74, 0.7, 0.44]} />
      </mesh>
      <mesh material={mats.skin} position={[0, 0.18, 0.221]}>
        <boxGeometry args={[0.2, 0.42, 0.02]} />
      </mesh>
      <mesh material={mats.tie} position={[0, 0.05, 0.232]}>
        <boxGeometry args={[0.08, 0.45, 0.02]} />
      </mesh>
      <mesh material={mats.tie} position={[0, -0.2, 0.232]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.13, 0.13, 0.02]} />
      </mesh>
      <mesh material={mats.accent} position={[0, -0.55, 0]}>
        <boxGeometry args={[0.7, 0.55, 0.42]} />
      </mesh>
    </group>
  )
}

/**
 * Three.js プリミティブだけで作る低ポリ procedural 人型アバター。
 * GLB モデル不要 — 各キャラの個性は spec で表現する。
 */
export function ProceduralAvatar({ spec, state }: ProceduralAvatarProps) {
  const rootRef = useRef<Group>(null)
  const torsoRef = useRef<Group>(null)
  const headRef = useRef<Group>(null)
  const leftArmRef = useRef<Group>(null)
  const rightArmRef = useRef<Group>(null)
  const jawRef = useRef<Group>(null)

  // material はメモ化
  const mats = useMemo(() => ({
    skin: new THREE.MeshStandardMaterial({ color: spec.skin, roughness: 0.7 }),
    hair: new THREE.MeshStandardMaterial({ color: spec.hair, roughness: 0.85 }),
    body: new THREE.MeshStandardMaterial({ color: spec.body, roughness: 0.65 }),
    accent: new THREE.MeshStandardMaterial({ color: spec.accent, roughness: 0.6 }),
    tie: new THREE.MeshStandardMaterial({ color: spec.tie ?? '#bd2030', roughness: 0.5 }),
    glasses: new THREE.MeshStandardMaterial({ color: '#0e0e0e', roughness: 0.3, metalness: 0.4 }),
    lens: new THREE.MeshStandardMaterial({
      color: '#bcd5ff',
      roughness: 0.2,
      metalness: 0.1,
      transparent: true,
      opacity: 0.55,
    }),
    mouth: new THREE.MeshStandardMaterial({
      color: new THREE.Color(spec.skin).multiplyScalar(0.55),
      roughness: 0.9,
    }),
  }), [spec])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const root = rootRef.current
    const torso = torsoRef.current
    const head = headRef.current
    const left = leftArmRef.current
    const right = rightArmRef.current
    const jaw = jawRef.current
    if (!root || !torso || !head) return

    // ── 呼吸（常時） ──
    const breathe = Math.sin(t * 1.6) * 0.015
    torso.position.y = 0.78 + breathe

    // ── State 別オーバーレイ ──
    if (state === 'talking') {
      // 上下バウンス、首ふり、口パク
      const bob = Math.sin(t * 5.2) * 0.025
      root.position.y = bob
      head.rotation.y = Math.sin(t * 3.8) * 0.18
      head.rotation.x = Math.sin(t * 4.6) * 0.05
      head.rotation.z = Math.sin(t * 2.1) * 0.04
      // 手のジェスチャー
      if (right) {
        right.rotation.z = -0.3 + Math.sin(t * 4.4) * 0.55
        right.rotation.x = Math.sin(t * 3.1) * 0.4
      }
      if (left) {
        left.rotation.z = 0.2 + Math.cos(t * 4.0) * 0.35
      }
      if (jaw) {
        jaw.scale.y = 1 + Math.abs(Math.sin(t * 9)) * 0.6
        jaw.position.y = -0.025 - Math.abs(Math.sin(t * 9)) * 0.025
      }
    } else if (state === 'thinking') {
      // 首をかしげる + ゆっくり目をそらす + 顎に手
      root.position.y = 0
      head.rotation.y = -0.4 + Math.sin(t * 0.8) * 0.06
      head.rotation.x = 0.12
      head.rotation.z = -0.18
      if (right) {
        right.rotation.z = -1.55
        right.rotation.x = -0.4
        right.rotation.y = 0.3
      }
      if (left) {
        left.rotation.z = 0.05
        left.rotation.x = 0
      }
      if (jaw) {
        jaw.scale.y = 1
        jaw.position.y = -0.025
      }
    } else {
      // idle: 微細な首振り + 軽いゆらぎ
      root.position.y = 0
      head.rotation.y = Math.sin(t * 0.55) * 0.08
      head.rotation.x = Math.sin(t * 0.4) * 0.025
      head.rotation.z = 0
      if (right) {
        right.rotation.z = -0.18 + Math.sin(t * 0.7) * 0.03
        right.rotation.x = 0
        right.rotation.y = 0
      }
      if (left) {
        left.rotation.z = 0.18 + Math.sin(t * 0.6) * 0.03
        left.rotation.x = 0
      }
      if (jaw) {
        jaw.scale.y = 1
        jaw.position.y = -0.025
      }
    }
  })

  // 衣装ごとに腕の起点を変える
  const armOffsetX = spec.outfit === 'toga' || spec.outfit === 'cloak' ? 0.48 : 0.42
  const armOffsetY = 0.25

  return (
    <group ref={rootRef}>
      {/* 胴体 */}
      <group ref={torsoRef} position={[0, 0.78, 0]}>
        <Outfit kind={spec.outfit} mats={mats} />

        {/* 左腕 */}
        <group ref={leftArmRef} position={[-armOffsetX, armOffsetY, 0]}>
          <mesh material={mats.body} position={[0, -0.28, 0]}>
            <capsuleGeometry args={[0.09, 0.45, 6, 10]} />
          </mesh>
          {/* 手 */}
          <mesh material={mats.skin} position={[0, -0.58, 0]}>
            <sphereGeometry args={[0.085, 12, 10]} />
          </mesh>
        </group>

        {/* 右腕 */}
        <group ref={rightArmRef} position={[armOffsetX, armOffsetY, 0]}>
          <mesh material={mats.body} position={[0, -0.28, 0]}>
            <capsuleGeometry args={[0.09, 0.45, 6, 10]} />
          </mesh>
          <mesh material={mats.skin} position={[0, -0.58, 0]}>
            <sphereGeometry args={[0.085, 12, 10]} />
          </mesh>
        </group>

        {/* 頭 */}
        <group ref={headRef} position={[0, 0.6, 0]}>
          {/* スカル */}
          <mesh material={mats.skin}>
            <sphereGeometry args={[0.27, 24, 20]} />
          </mesh>
          <Hair kind={spec.hairStyle} hairMat={mats.hair} />
          <Beard kind={spec.beard} hairMat={mats.hair} />

          {/* 目（白＋黒目） */}
          <group position={[0, 0.06, 0.22]}>
            <mesh material={mats.skin} position={[-0.09, 0, 0]}>
              <sphereGeometry args={[0.055, 12, 10]} />
            </mesh>
            <mesh material={mats.hair} position={[-0.09, 0, 0.045]}>
              <sphereGeometry args={[0.025, 10, 8]} />
            </mesh>
            <mesh material={mats.skin} position={[0.09, 0, 0]}>
              <sphereGeometry args={[0.055, 12, 10]} />
            </mesh>
            <mesh material={mats.hair} position={[0.09, 0, 0.045]}>
              <sphereGeometry args={[0.025, 10, 8]} />
            </mesh>
          </group>

          {/* メガネ */}
          {spec.glasses && (
            <group position={[0, 0.06, 0.235]}>
              <mesh material={mats.lens} position={[-0.09, 0, 0]}>
                <torusGeometry args={[0.065, 0.012, 8, 16]} />
              </mesh>
              <mesh material={mats.lens} position={[0.09, 0, 0]}>
                <torusGeometry args={[0.065, 0.012, 8, 16]} />
              </mesh>
              <mesh material={mats.glasses} position={[0, 0, 0]}>
                <boxGeometry args={[0.035, 0.008, 0.008]} />
              </mesh>
            </group>
          )}

          {/* 口（jaw グループでアニメ） — idle は細いライン */}
          <group ref={jawRef} position={[0, -0.07, 0.235]}>
            <mesh material={mats.mouth}>
              <boxGeometry args={[0.07, 0.012, 0.005]} />
            </mesh>
          </group>

          {/* 鼻 */}
          <mesh material={mats.skin} position={[0, 0.01, 0.255]}>
            <coneGeometry args={[0.025, 0.07, 8]} />
          </mesh>
        </group>
      </group>
    </group>
  )
}
