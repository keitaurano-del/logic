import { describe, it, expect, beforeEach, vi } from 'vitest'
import { uploadJournalImage } from '../components/journal/journalImages'

/**
 * JF-7: ジャーナル画像アップロードの圧縮工程に対する回帰テスト。
 *
 * 検証する不変条件:
 *  1) 圧縮（デコード→canvas→toBlob）は同時に 1 枚しか走らない（逐次化）。
 *     → モバイル WebView で大きな canvas/ImageBitmap が同時多発しヒープが
 *       枯渇するのを防ぐための核心。
 *  2) 圧縮後に canvas のバックバッファが 1x1 に潰されて解放される。
 *     → リーク（=数枚目で compress-failed→再試行も失敗）の再発防止。
 */

// ─── supabase storage をスタブ（アップロードは即成功扱い） ───────────────
vi.mock('../supabase', () => ({
  getSupabaseClient: () => ({
    storage: {
      from: () => ({
        upload: async () => ({ error: null }),
      }),
    },
  }),
}))

// 進行中の圧縮数を観測するための共有カウンタ
let activeCompressions = 0
let maxConcurrentCompressions = 0
// 解放（1x1 化）された canvas の数
let shrunkCanvases = 0

beforeEach(() => {
  activeCompressions = 0
  maxConcurrentCompressions = 0
  shrunkCanvases = 0
})

function makeFile(): File {
  // 中身は問わない（createImageBitmap をスタブするため）
  return new File([new Uint8Array([1, 2, 3, 4])], 'photo.jpg', { type: 'image/jpeg' })
}

describe('uploadJournalImage の圧縮（JF-7）', () => {
  it('複数枚を同時に投げても圧縮は逐次化され同時実行は 1 枚まで', async () => {
    // createImageBitmap: probe を返す。toBlob までの間「圧縮中」とみなしカウント。
    const fakeBitmap = () => {
      activeCompressions++
      maxConcurrentCompressions = Math.max(maxConcurrentCompressions, activeCompressions)
      return {
        width: 800,
        height: 600,
        close: vi.fn(),
      } as unknown as ImageBitmap
    }
    vi.stubGlobal('createImageBitmap', vi.fn(async () => fakeBitmap()))

    // canvas.getContext / toBlob をスタブ。toBlob は非同期で少し待ってから blob を返す。
    const origCreate = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'canvas') {
        let w = 0
        let h = 0
        const canvas = {
          get width() { return w },
          set width(v: number) { if (v === 1 && w !== 1) shrunkCanvases++; w = v },
          get height() { return h },
          set height(v: number) { h = v },
          getContext: () => ({ drawImage: vi.fn() }),
          toBlob: (cb: (b: Blob | null) => void) => {
            // 非同期境界をまたいでも他の圧縮が割り込んでいないことを保証したい
            setTimeout(() => {
              activeCompressions--
              cb(new Blob([new Uint8Array([9])], { type: 'image/jpeg' }))
            }, 5)
          },
        }
        return canvas as unknown as HTMLCanvasElement
      }
      return origCreate(tag)
    })

    const files = [makeFile(), makeFile(), makeFile(), makeFile()]
    const results = await Promise.all(
      files.map((f) => uploadJournalImage('user-1', '2026-06-16', f)),
    )

    // すべて成功
    for (const r of results) {
      expect(r.error).toBeUndefined()
      expect(r.image?.path).toMatch(/^user-1\/2026-06-16\//)
    }
    // 同時圧縮は 1 枚まで（逐次化されている）
    expect(maxConcurrentCompressions).toBe(1)
    // 各 canvas が 1x1 に潰されて解放された
    expect(shrunkCanvases).toBe(files.length)
  })
})
