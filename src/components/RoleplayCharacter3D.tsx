import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useAnimations, useGLTF } from '@react-three/drei'
import type { AnimationAction, Group } from 'three'
import * as THREE from 'three'
import { SkeletonUtils } from 'three-stdlib'

export type CharacterState = 'idle' | 'talking' | 'thinking'

interface RoleplayCharacter3DProps {
  characterId: string
  state: CharacterState
  height?: number
}

type CharacterConfig = {
  modelUrl: string
  cameraPosition: [number, number, number]
  cameraTarget: [number, number, number]
  modelPosition: [number, number, number]
  modelRotation: [number, number, number]
  modelScale: number
  /** key tone for ambient/key light */
  toneColor: string
  /** background gradient stops */
  bgFrom: string
  bgTo: string
}

const FALLBACK_MODEL = '/models/sample-character.glb'

const CHARACTERS: Record<string, CharacterConfig> = {
  'why-so-report': {
    modelUrl: FALLBACK_MODEL,
    cameraPosition: [0, 1.5, 2.4],
    cameraTarget: [0, 1.35, 0],
    modelPosition: [0, -0.1, 0],
    modelRotation: [0, -0.15, 0],
    modelScale: 1,
    toneColor: '#c8d4ff',
    bgFrom: '#EEF2FE',
    bgTo: '#dfe6fd',
  },
  'mece-meeting': {
    modelUrl: FALLBACK_MODEL,
    cameraPosition: [0, 1.5, 2.4],
    cameraTarget: [0, 1.35, 0],
    modelPosition: [0, -0.1, 0],
    modelRotation: [0, 0.1, 0],
    modelScale: 1,
    toneColor: '#c9f1e2',
    bgFrom: '#ecfdf5',
    bgTo: '#d5f5e8',
  },
  'pyramid-client': {
    modelUrl: FALLBACK_MODEL,
    cameraPosition: [0, 1.5, 2.4],
    cameraTarget: [0, 1.35, 0],
    modelPosition: [0, -0.1, 0],
    modelRotation: [0, 0.05, 0],
    modelScale: 1,
    toneColor: '#e0d4ff',
    bgFrom: '#f3efff',
    bgTo: '#e5dcfb',
  },
  'logic-tree-sub': {
    modelUrl: FALLBACK_MODEL,
    cameraPosition: [0, 1.5, 2.4],
    cameraTarget: [0, 1.35, 0],
    modelPosition: [0, -0.1, 0],
    modelRotation: [0, -0.2, 0],
    modelScale: 1,
    toneColor: '#fde0b8',
    bgFrom: '#fff7ed',
    bgTo: '#fde6cc',
  },
  'socrates-dialog': {
    modelUrl: FALLBACK_MODEL,
    cameraPosition: [0, 1.5, 2.4],
    cameraTarget: [0, 1.35, 0],
    modelPosition: [0, -0.1, 0],
    modelRotation: [0, 0.15, 0],
    modelScale: 1,
    toneColor: '#dccfff',
    bgFrom: '#f5f0ff',
    bgTo: '#e6d9fa',
  },
  'descartes-doubt': {
    modelUrl: FALLBACK_MODEL,
    cameraPosition: [0, 1.5, 2.4],
    cameraTarget: [0, 1.35, 0],
    modelPosition: [0, -0.1, 0],
    modelRotation: [0, -0.1, 0],
    modelScale: 1,
    toneColor: '#cfd9ff',
    bgFrom: '#eef2ff',
    bgTo: '#dde4fb',
  },
  'nietzsche-values': {
    modelUrl: FALLBACK_MODEL,
    cameraPosition: [0, 1.5, 2.4],
    cameraTarget: [0, 1.35, 0],
    modelPosition: [0, -0.1, 0],
    modelRotation: [0, 0.05, 0],
    modelScale: 1,
    toneColor: '#fcd5d2',
    bgFrom: '#fff1f0',
    bgTo: '#fbd9d6',
  },
}

function getCharacterConfig(id: string): CharacterConfig {
  return CHARACTERS[id] ?? CHARACTERS['why-so-report']
}

interface AvatarProps {
  config: CharacterConfig
  state: CharacterState
}

function Avatar({ config, state }: AvatarProps) {
  const groupRef = useRef<Group>(null)
  const headTargetRef = useRef(new THREE.Vector3(0, 0, 1))
  const { scene, animations } = useGLTF(config.modelUrl)

  // SkeletonUtils.clone は SkinnedMesh + bone を正しく複製する
  const clonedScene = useMemo(() => {
    const clone = SkeletonUtils.clone(scene)
    clone.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh
        mesh.castShadow = true
        mesh.receiveShadow = true
      }
    })
    return clone
  }, [scene])

  // useAnimations の対象は clone した scene 自体に当てる
  const { actions, names } = useAnimations(animations, clonedScene)

  // Soldier.glb has: "Idle", "Walk", "Run", "TPose"
  const idleName = useMemo(() => {
    const lower = names.map((n) => n.toLowerCase())
    const idleIdx = lower.findIndex((n) => n.includes('idle'))
    if (idleIdx >= 0) return names[idleIdx]
    return names[0]
  }, [names])

  useEffect(() => {
    if (!idleName) return
    const action: AnimationAction | null = actions[idleName] ?? null
    if (!action) return
    action.reset().fadeIn(0.4).play()
    return () => {
      action.fadeOut(0.4)
    }
  }, [actions, idleName])

  // State-driven motion overlay
  useFrame(({ clock }) => {
    const g = groupRef.current
    if (!g) return
    const t = clock.getElapsedTime()

    // Subtle breathing always
    const breathe = Math.sin(t * 1.6) * 0.012

    // State overlays
    let bobY = 0
    let nodX = 0
    let swayY = 0
    if (state === 'talking') {
      bobY = Math.sin(t * 6.2) * 0.018
      nodX = Math.sin(t * 4.4) * 0.05
      swayY = Math.sin(t * 1.9) * 0.08
    } else if (state === 'thinking') {
      // tilt + slow look-away
      nodX = -0.08 + Math.sin(t * 0.9) * 0.02
      swayY = Math.sin(t * 0.7) * 0.18 - 0.08
    } else {
      swayY = Math.sin(t * 0.5) * 0.05
      nodX = Math.sin(t * 0.4) * 0.015
    }

    g.position.y = config.modelPosition[1] + breathe + bobY
    g.rotation.x = config.modelRotation[0] + nodX
    g.rotation.y = config.modelRotation[1] + swayY

    headTargetRef.current.set(swayY, 0, 1)
  })

  return (
    <group
      ref={groupRef}
      position={config.modelPosition}
      rotation={config.modelRotation}
      scale={config.modelScale}
    >
      <primitive object={clonedScene} />
    </group>
  )
}

function StateBubble({ state }: { state: CharacterState }) {
  if (state === 'idle') return null
  const label = state === 'thinking' ? '考え中…' : '話してる'
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: 12,
        right: 14,
        background: 'rgba(255,255,255,.92)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        padding: '6px 10px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        color: 'var(--brand)',
        boxShadow: '0 2px 8px rgba(15,21,35,.08)',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        pointerEvents: 'none',
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: state === 'thinking' ? '#a78bfa' : '#22c55e',
          boxShadow: state === 'thinking'
            ? '0 0 6px #a78bfa'
            : '0 0 6px #22c55e',
          animation: 'rp3dPulse 1.2s ease-in-out infinite',
        }}
      />
      {label}
    </div>
  )
}

export function RoleplayCharacter3D({ characterId, state, height = 260 }: RoleplayCharacter3DProps) {
  const config = useMemo(() => getCharacterConfig(characterId), [characterId])

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height,
        borderRadius: 18,
        overflow: 'hidden',
        background: `linear-gradient(160deg, ${config.bgFrom} 0%, ${config.bgTo} 100%)`,
        boxShadow: 'inset 0 -10px 30px rgba(15,21,35,.04)',
      }}
    >
      <style>{`
        @keyframes rp3dPulse {
          0%, 100% { opacity: .55; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.35); }
        }
      `}</style>
      <Canvas
        camera={{ position: config.cameraPosition, fov: 32, near: 0.1, far: 50 }}
        dpr={[1, 1.6]}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
        style={{ width: '100%', height: '100%' }}
      >
        <CameraLookAt target={config.cameraTarget} />
        <ambientLight intensity={0.85} color={config.toneColor} />
        <directionalLight
          position={[2.5, 4, 3]}
          intensity={1.05}
          color="#ffffff"
        />
        <directionalLight
          position={[-2, 2, 2]}
          intensity={0.45}
          color={config.toneColor}
        />
        <Suspense fallback={null}>
          <Avatar config={config} state={state} />
        </Suspense>
      </Canvas>
      <StateBubble state={state} />
    </div>
  )
}

function CameraLookAt({ target }: { target: [number, number, number] }) {
  useFrame(({ camera }) => {
    camera.lookAt(target[0], target[1], target[2])
  })
  return null
}

// Preload sample model so first interaction is fast
useGLTF.preload(FALLBACK_MODEL)
