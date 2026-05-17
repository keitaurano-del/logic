import { Suspense, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ProceduralAvatar, type AvatarSpec, type AvatarState } from './ProceduralAvatar'
import { BillboardAvatar } from './BillboardAvatar'

export type CharacterState = AvatarState

interface RoleplayCharacter3DProps {
  characterId: string
  state: CharacterState
  height?: number
}

type CharacterConfig = {
  spec: AvatarSpec
  cameraPosition: [number, number, number]
  cameraTarget: [number, number, number]
  rootRotation: [number, number, number]
  /** key tone for ambient/key light */
  toneColor: string
  /** rim/back light color */
  rimColor: string
  /** background gradient stops */
  bgFrom: string
  bgTo: string
  /** floor disc color */
  floorColor: string
  /**
   * 高クオリティ AI 生成キャラ画像（透過 PNG）の URL。
   * 指定されていれば 2D billboard モードでこの画像が使われ、
   * 未指定なら ProceduralAvatar にフォールバック。
   */
  imageUrl?: string
}

const CHARACTERS: Record<string, CharacterConfig> = {
  // ── David Chen 部長（紺スーツ、短髪、鋭い目つき） ──
  'why-so-report': {
    spec: {
      skin: '#e8c19a',
      hair: '#1a1410',
      body: '#1f2a52',
      accent: '#0e1730',
      outfit: 'suit',
      beard: 'none',
      hairStyle: 'slicked',
      tie: '#bd2030',
    },
    cameraPosition: [0, 1.45, 2.5],
    cameraTarget: [0, 1.25, 0],
    rootRotation: [0, -0.12, 0],
    toneColor: '#dee3f5',
    rimColor: '#7c9bff',
    bgFrom: '#EEF2FE',
    bgTo: '#cbd6f5',
    floorColor: '#bfc8e8',
  },
  // ── Meeting Team（モスグリーンジャケット、髭少し） ──
  'mece-meeting': {
    spec: {
      skin: '#f0c9a4',
      hair: '#2d2410',
      body: '#1f5e48',
      accent: '#103225',
      outfit: 'suit',
      beard: 'short',
      hairStyle: 'short',
      tie: '#e8d088',
    },
    cameraPosition: [0, 1.45, 2.5],
    cameraTarget: [0, 1.25, 0],
    rootRotation: [0, 0.1, 0],
    toneColor: '#d6f0e1',
    rimColor: '#6dd4a4',
    bgFrom: '#ecfdf5',
    bgTo: '#cae8d6',
    floorColor: '#b8d8c6',
  },
  // ── Mr. Carter クライアント役員（ダークグレースーツ、メガネ、白髪混じり） ──
  'pyramid-client': {
    spec: {
      skin: '#e3b88f',
      hair: '#6a5848',
      body: '#3a3548',
      accent: '#1c1925',
      outfit: 'suit',
      beard: 'none',
      hairStyle: 'slicked',
      glasses: true,
      tie: '#1f3a8a',
    },
    cameraPosition: [0, 1.45, 2.5],
    cameraTarget: [0, 1.25, 0],
    rootRotation: [0, 0.05, 0],
    toneColor: '#e2d9f5',
    rimColor: '#b59bff',
    bgFrom: '#f3efff',
    bgTo: '#d6cce8',
    floorColor: '#c6bcd8',
  },
  // ── Alex Kim 後輩（カジュアル、若い、Tシャツ） ──
  'logic-tree-sub': {
    spec: {
      skin: '#f0c9a4',
      hair: '#1a1410',
      body: '#c79a64',
      accent: '#5a3c20',
      outfit: 'casual',
      beard: 'none',
      hairStyle: 'tousled',
    },
    cameraPosition: [0, 1.45, 2.5],
    cameraTarget: [0, 1.25, 0],
    rootRotation: [0, -0.18, 0],
    toneColor: '#fde0b8',
    rimColor: '#ffc684',
    bgFrom: '#fff7ed',
    bgTo: '#f2d9b4',
    floorColor: '#e0c8a0',
  },
  // ── ソクラテス（白いトーガ、長い白髭、禿頭、古代ギリシャ） ──
  'socrates-dialog': {
    spec: {
      skin: '#d9b58a',
      hair: '#ece4d4',     // 銀髪・白髭
      body: '#f5ecd9',     // アイボリーのトーガ
      accent: '#c7a87a',
      outfit: 'toga',
      beard: 'bushy',
      hairStyle: 'bald',
    },
    cameraPosition: [0, 1.45, 2.4],
    cameraTarget: [0, 1.25, 0],
    rootRotation: [0, 0.12, 0],
    toneColor: '#fff3d4',
    rimColor: '#fff4c2',
    bgFrom: '#fcf3d6',
    bgTo: '#e8d8a8',
    floorColor: '#cdb685',
  },
  // ── デカルト（黒髪に肩までのウィッグ、紫ローブ、整った顎髭、17世紀） ──
  'descartes-doubt': {
    spec: {
      skin: '#e8c9a8',
      hair: '#1a1410',
      body: '#3a2f4f',     // 深い紫のローブ
      accent: '#1a1428',
      outfit: 'cloak',
      beard: 'short',
      hairStyle: 'tousled',
    },
    cameraPosition: [0, 1.45, 2.4],
    cameraTarget: [0, 1.25, 0],
    rootRotation: [0, -0.1, 0],
    toneColor: '#d8d2f0',
    rimColor: '#9b8eff',
    bgFrom: '#eef0ff',
    bgTo: '#c8c0e8',
    floorColor: '#b8b0d8',
  },
  // ── ニーチェ（黒のフロックコート、太い茶髭、19世紀） ──
  'nietzsche-values': {
    spec: {
      skin: '#e8c9a8',
      hair: '#5a3520',     // 茶色の髪・髭
      body: '#161616',     // 黒のフロックコート
      accent: '#0a0a0a',
      outfit: 'frock',
      beard: 'mustache',
      hairStyle: 'tousled',
    },
    cameraPosition: [0, 1.45, 2.4],
    cameraTarget: [0, 1.25, 0],
    rootRotation: [0, 0.05, 0],
    toneColor: '#fcd5d2',
    rimColor: '#ff9d8c',
    bgFrom: '#fff1f0',
    bgTo: '#f0c6c2',
    floorColor: '#dab0ac',
  },
}

function getCharacterConfig(id: string): CharacterConfig {
  return CHARACTERS[id] ?? CHARACTERS['why-so-report']
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

function CameraLookAt({ target }: { target: [number, number, number] }) {
  useFrame(({ camera }) => {
    camera.lookAt(target[0], target[1], target[2])
  })
  return null
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
        camera={{ position: config.cameraPosition, fov: 34, near: 0.1, far: 50 }}
        dpr={[1, 1.6]}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
        style={{ width: '100%', height: '100%' }}
      >
        <CameraLookAt target={config.cameraTarget} />
        <ambientLight intensity={0.55} color={config.toneColor} />
        {/* key light（前方右上） */}
        <directionalLight position={[2.5, 3.5, 3]} intensity={1.05} color="#ffffff" />
        {/* fill light（前方左下、暗部のディテール） */}
        <directionalLight position={[-2, 1.5, 2]} intensity={0.35} color={config.toneColor} />
        {/* rim light（背後から、シルエットを際立たせる） */}
        <directionalLight position={[-1.5, 3, -3]} intensity={1.0} color={config.rimColor} />
        {/* 床ディスク */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <circleGeometry args={[1.0, 48]} />
          <meshStandardMaterial color={config.floorColor} roughness={0.95} />
        </mesh>
        <Suspense fallback={null}>
          {config.imageUrl ? (
            <BillboardAvatar imageUrl={config.imageUrl} state={state} />
          ) : (
            <group rotation={config.rootRotation}>
              <ProceduralAvatar spec={config.spec} state={state} />
            </group>
          )}
        </Suspense>
      </Canvas>
      <StateBubble state={state} />
    </div>
  )
}
