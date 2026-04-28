/**
 * FeedbackDashboardScreen - フィードバック分析ダッシュボード (SCRUM-88)
 * COO/Apollo向け: ユーザーフィードバックの集計・可視化
 */
import { useEffect, useState } from 'react'
import { v3 } from '../styles/tokensV3'
import { createClient } from '@supabase/supabase-js'

function getSupabaseClient() {
  const url = import.meta.env.VITE_SUPABASE_URL || ''
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  if (!url || !key) return null
  return createClient(url, key)
}

interface FeedbackItem {
  id: number
  category: string
  message: string
  locale: string
  created_at: string
}

interface CategoryStat {
  category: string
  count: number
  color: string
}

const CATEGORY_COLORS: Record<string, string> = {
  'バグ報告':    '#EF4444',
  '内容・説明が間違っている': '#F97316',
  '選択肢の正解が違う':      '#EAB308',
  '改善提案':    v3.color.accent,
  'その他':      v3.color.text3,
}

interface Props {
  onClose: () => void
}

export function FeedbackDashboardScreen({ onClose }: Props) {
  const [items, setItems] = useState<FeedbackItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    const supabase = getSupabaseClient()
    if (!supabase) { setError('Supabase未接続'); setLoading(false); return }

    supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)
      .then(({ data, error }) => {
        if (error) { setError(error.message); setLoading(false); return }
        setItems(data ?? [])
        setLoading(false)
      })
  }, [])

  // カテゴリ別集計
  const categoryCounts: CategoryStat[] = Object.entries(
    items.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] ?? 0) + 1
      return acc
    }, {} as Record<string, number>)
  )
    .sort((a, b) => b[1] - a[1])
    .map(([category, count]) => ({
      category,
      count,
      color: CATEGORY_COLORS[category] ?? v3.color.text3,
    }))

  const maxCount = Math.max(...categoryCounts.map(c => c.count), 1)

  const filtered = filter === 'all' ? items : items.filter(i => i.category === filter)

  // 直近7日 vs 前7日比較
  const now = Date.now()
  const day7 = 7 * 24 * 60 * 60 * 1000
  const last7 = items.filter(i => now - new Date(i.created_at).getTime() < day7).length
  const prev7 = items.filter(i => {
    const age = now - new Date(i.created_at).getTime()
    return age >= day7 && age < day7 * 2
  }).length
  const trend = prev7 > 0 ? Math.round(((last7 - prev7) / prev7) * 100) : null

  return (
    <div style={{
      background: v3.color.bg, minHeight: '100dvh',
      fontFamily: "'Noto Sans JP', sans-serif", color: v3.color.text,
      display: 'flex', flexDirection: 'column',
    }}>
      {/* ヘッダー */}
      <div style={{
        padding: 'calc(env(safe-area-inset-top, 44px) + 4px) 20px 16px',
        display: 'flex', alignItems: 'center', gap: 12,
        borderBottom: `1px solid ${v3.color.line}`,
      }}>
        <button
          onClick={onClose}
          style={{ background: v3.color.card, border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: v3.color.text2, flexShrink: 0 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>フィードバック分析</div>
          <div style={{ fontSize: 12, color: v3.color.text3 }}>SCRUM-88 · COO/Apollo向け</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 80px' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: 60, color: v3.color.text2 }}>読み込み中...</div>
        )}
        {error && (
          <div style={{ textAlign: 'center', padding: 40, color: '#EF4444', fontSize: 14 }}>{error}</div>
        )}

        {!loading && !error && (
          <>
            {/* サマリーカード */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              <div style={{ flex: 1, background: v3.color.card, borderRadius: 16, padding: '16px 12px', textAlign: 'center' }}>
                <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 32, fontWeight: 900, color: v3.color.accent, lineHeight: 1 }}>{items.length}</div>
                <div style={{ fontSize: 11, color: v3.color.text3, marginTop: 4 }}>合計件数</div>
              </div>
              <div style={{ flex: 1, background: v3.color.card, borderRadius: 16, padding: '16px 12px', textAlign: 'center' }}>
                <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 32, fontWeight: 900, color: last7 > 0 ? v3.color.accent : v3.color.text3, lineHeight: 1 }}>{last7}</div>
                <div style={{ fontSize: 11, color: v3.color.text3, marginTop: 4 }}>直近7日</div>
                {trend !== null && (
                  <div style={{ fontSize: 11, color: trend >= 0 ? v3.color.accent : '#EF4444', marginTop: 2, fontWeight: 700 }}>
                    {trend >= 0 ? `+${trend}%` : `${trend}%`}
                  </div>
                )}
              </div>
              <div style={{ flex: 1, background: v3.color.card, borderRadius: 16, padding: '16px 12px', textAlign: 'center' }}>
                <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 32, fontWeight: 900, color: v3.color.warm, lineHeight: 1 }}>
                  {categoryCounts.find(c => c.category.includes('バグ') || c.category.includes('間違'))?.count ?? 0}
                </div>
                <div style={{ fontSize: 11, color: v3.color.text3, marginTop: 4 }}>要対応</div>
              </div>
            </div>

            {/* カテゴリ別バーチャート */}
            <div style={{ background: v3.color.card, borderRadius: 16, padding: '16px 18px', marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, color: v3.color.text2 }}>カテゴリ別</div>
              {categoryCounts.length === 0 ? (
                <div style={{ fontSize: 13, color: v3.color.text3, textAlign: 'center', padding: '20px 0' }}>データなし</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {categoryCounts.map(({ category, count, color }) => (
                    <div key={category}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <span style={{ fontSize: 13, fontWeight: 500 }}>{category}</span>
                        <span style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 13, fontWeight: 700, color }}>{count}</span>
                      </div>
                      <div style={{ height: 6, background: v3.color.bg, borderRadius: 99 }}>
                        <div style={{
                          height: 6, borderRadius: 99,
                          background: color,
                          width: `${(count / maxCount) * 100}%`,
                          transition: 'width 0.5s ease',
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* フィルター */}
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 14, paddingBottom: 4 }}>
              {['all', ...categoryCounts.map(c => c.category)].map(cat => (
                <button key={cat}
                  onClick={() => setFilter(cat)}
                  style={{
                    flexShrink: 0, padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600,
                    cursor: 'pointer', border: 'none',
                    background: filter === cat ? v3.color.accent : v3.color.card,
                    color: filter === cat ? v3.color.bg : v3.color.text2,
                  }}
                >
                  {cat === 'all' ? 'すべて' : cat}
                </button>
              ))}
            </div>

            {/* フィードバック一覧 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: v3.color.text3, fontSize: 14 }}>
                  フィードバックはまだありません
                </div>
              ) : (
                filtered.map(item => (
                  <div key={item.id} style={{ background: v3.color.card, borderRadius: 14, padding: '14px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{
                        display: 'inline-block', padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600,
                        background: `${CATEGORY_COLORS[item.category] ?? v3.color.text3}20`,
                        color: CATEGORY_COLORS[item.category] ?? v3.color.text3,
                      }}>{item.category}</span>
                      <span style={{ fontSize: 11, color: v3.color.text3 }}>
                        {new Date(item.created_at).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p style={{ fontSize: 14, lineHeight: 1.7, color: v3.color.text, margin: 0 }}>{item.message}</p>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
