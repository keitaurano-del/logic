/**
 * LessonThumbnail — レッスンID別のSVGサムネイルコンポーネント
 * webp画像不使用。コードベースでピクセルパーフェクト。
 * カラーパレット: マット系ダーク（Notion/Linearライク）
 */

import React from 'react'

// ──────────────────────────────────────────────
// カラーパレット定義
// ──────────────────────────────────────────────
const PALETTE = {
  logic:    { bg: '#1C3230', stroke: '#5FA898' },  // ロジカルシンキング: ダークティール + セージ
  case:     { bg: '#1E2A22', stroke: '#6A9E78' },  // ケース面接: ダークフォレスト + オリーブグリーン
  critical: { bg: '#2C1E1E', stroke: '#A87070' },  // クリティカル: ダークバーガンディ + モーブレッド
  hypo:     { bg: '#1E2C1E', stroke: '#7AAB78' },  // 仮説思考: ダークグリーン + セージ
  issue:    { bg: '#221E2C', stroke: '#8B7AAB' },  // 課題設定: ダークパープル + モーブ
  design:   { bg: '#1E2228', stroke: '#7A8FAB' },  // デザイン: ダークネイビー + スレート
  lateral:  { bg: '#2A1E28', stroke: '#AB7A9E' },  // ラテラル: ダークプラム + モーブピンク
  analogy:  { bg: '#1E2228', stroke: '#7A8FAB' },  // アナロジー: ダークネイビー + スレート
  systems:  { bg: '#1C3230', stroke: '#5FA898' },  // システム: ダークティール + セージ
  proposal: { bg: '#2A2418', stroke: '#A89B6A' },  // 提案: ダークアンバー + ゴールドカーキ
  philo:    { bg: '#22201C', stroke: '#9E9070' },  // 哲学: ダークオーカー + ウォームグレー
}

// ──────────────────────────────────────────────
// SVGシェイプ定義（lessonId → シェイプ関数）
// ──────────────────────────────────────────────
type ShapeFn = (s: string) => React.ReactElement

const SHAPES: Record<number, ShapeFn> = {
  // ─── ロジカルシンキング ───
  20: s => ( // MECE: 3つの非重複円
    <g>
      <circle cx="33" cy="50" r="19" fill="none" stroke={s} strokeWidth="2.2"/>
      <circle cx="50" cy="50" r="19" fill="none" stroke={s} strokeWidth="2.2"/>
      <circle cx="67" cy="50" r="19" fill="none" stroke={s} strokeWidth="2.2"/>
    </g>
  ),
  21: s => ( // ロジックツリー: 分岐ライン
    <g>
      <line x1="50" y1="22" x2="50" y2="42" stroke={s} strokeWidth="2" strokeLinecap="round"/>
      <line x1="50" y1="42" x2="26" y2="62" stroke={s} strokeWidth="2" strokeLinecap="round"/>
      <line x1="50" y1="42" x2="74" y2="62" stroke={s} strokeWidth="2" strokeLinecap="round"/>
      <line x1="26" y1="62" x2="16" y2="80" stroke={s} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="26" y1="62" x2="36" y2="80" stroke={s} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="74" y1="62" x2="64" y2="80" stroke={s} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="74" y1="62" x2="84" y2="80" stroke={s} strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="50" cy="22" r="4" fill={s}/>
      <circle cx="26" cy="62" r="3" fill={s}/>
      <circle cx="74" cy="62" r="3" fill={s}/>
    </g>
  ),
  22: s => ( // So What / Why So: 双方向矢印 + ボックス
    <g>
      <rect x="22" y="20" width="56" height="14" rx="3" fill="none" stroke={s} strokeWidth="1.5"/>
      <line x1="50" y1="34" x2="50" y2="44" stroke={s} strokeWidth="2" strokeLinecap="round"/>
      <polyline points="44,40 50,46 56,40" fill="none" stroke={s} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="50" y1="56" x2="50" y2="66" stroke={s} strokeWidth="2" strokeLinecap="round" opacity={0.5}/>
      <polyline points="44,60 50,54 56,60" fill="none" stroke={s} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity={0.5}/>
      <rect x="22" y="66" width="56" height="14" rx="3" fill="none" stroke={s} strokeWidth="1.5"/>
    </g>
  ),
  23: s => ( // ピラミッド原則: 階層三角形
    <g>
      <polygon points="50,18 86,82 14,82" fill="none" stroke={s} strokeWidth="2.2" strokeLinejoin="round"/>
      <line x1="30" y1="58" x2="70" y2="58" stroke={s} strokeWidth="1.5"/>
      <line x1="38" y1="40" x2="62" y2="40" stroke={s} strokeWidth="1.5"/>
    </g>
  ),
  24: s => ( // ケーススタディ: グリッド + 虫眼鏡
    <g>
      <rect x="18" y="18" width="28" height="20" rx="2" fill="none" stroke={s} strokeWidth="1.8"/>
      <rect x="52" y="18" width="28" height="20" rx="2" fill="none" stroke={s} strokeWidth="1.8"/>
      <rect x="18" y="44" width="28" height="20" rx="2" fill="none" stroke={s} strokeWidth="1.8"/>
      <rect x="52" y="44" width="28" height="20" rx="2" fill="none" stroke={s} strokeWidth="1.8" opacity={0.4}/>
      <circle cx="42" cy="72" r="9" fill="none" stroke={s} strokeWidth="2"/>
      <line x1="49" y1="79" x2="58" y2="88" stroke={s} strokeWidth="2.5" strokeLinecap="round"/>
    </g>
  ),
  25: s => ( // 演繹法: 3段の棒 → 矢印
    <g>
      <rect x="18" y="28" width="50" height="7" rx="2" fill={s} opacity={0.9}/>
      <rect x="18" y="44" width="36" height="7" rx="2" fill={s} opacity={0.6}/>
      <rect x="18" y="60" width="22" height="7" rx="2" fill={s} opacity={0.35}/>
      <line x1="75" y1="30" x2="75" y2="64" stroke={s} strokeWidth="1.5" strokeLinecap="round"/>
      <polyline points="68,57 75,64 82,57" fill="none" stroke={s} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </g>
  ),
  26: s => ( // 帰納法: 散点 → 収束
    <g>
      <circle cx="22" cy="28" r="4" fill={s} opacity={0.5}/>
      <circle cx="40" cy="20" r="4" fill={s} opacity={0.5}/>
      <circle cx="70" cy="24" r="4" fill={s} opacity={0.5}/>
      <circle cx="78" cy="44" r="4" fill={s} opacity={0.5}/>
      <circle cx="26" cy="50" r="4" fill={s} opacity={0.5}/>
      <line x1="22" y1="28" x2="50" y2="68" stroke={s} strokeWidth="1" strokeDasharray="3,3"/>
      <line x1="40" y1="20" x2="50" y2="68" stroke={s} strokeWidth="1" strokeDasharray="3,3"/>
      <line x1="70" y1="24" x2="50" y2="68" stroke={s} strokeWidth="1" strokeDasharray="3,3"/>
      <line x1="78" y1="44" x2="50" y2="68" stroke={s} strokeWidth="1" strokeDasharray="3,3"/>
      <line x1="26" y1="50" x2="50" y2="68" stroke={s} strokeWidth="1" strokeDasharray="3,3"/>
      <circle cx="50" cy="68" r="7" fill={s}/>
    </g>
  ),
  27: s => ( // 形式論理: A→B 条件矢印
    <g>
      <rect x="14" y="36" width="28" height="18" rx="3" fill="none" stroke={s} strokeWidth="2"/>
      <rect x="58" y="36" width="28" height="18" rx="3" fill="none" stroke={s} strokeWidth="2"/>
      <line x1="42" y1="45" x2="56" y2="45" stroke={s} strokeWidth="2" strokeLinecap="round"/>
      <polyline points="51,39 57,45 51,51" fill="none" stroke={s} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="36" y1="62" x2="64" y2="62" stroke={s} strokeWidth="1.5" strokeLinecap="round" opacity={0.4} strokeDasharray="3,3"/>
    </g>
  ),
  68: s => ( // 具体と抽象: 抽象度の梯子
    <g>
      <line x1="38" y1="82" x2="38" y2="18" stroke={s} strokeWidth="2" strokeLinecap="round"/>
      <line x1="62" y1="82" x2="62" y2="18" stroke={s} strokeWidth="2" strokeLinecap="round"/>
      <line x1="38" y1="75" x2="62" y2="75" stroke={s} strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="38" y1="61" x2="62" y2="61" stroke={s} strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="38" y1="47" x2="62" y2="47" stroke={s} strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="38" y1="33" x2="62" y2="33" stroke={s} strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="50" cy="20" r="4" fill={s}/>
      <polyline points="44,26 50,20 56,26" fill="none" stroke={s} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </g>
  ),

  // ─── ケース面接 ───
  28: s => ( // ケース面接入門: フレームワーク表
    <g>
      <rect x="18" y="22" width="64" height="56" rx="3" fill="none" stroke={s} strokeWidth="1.8"/>
      <line x1="18" y1="36" x2="82" y2="36" stroke={s} strokeWidth="1.5"/>
      <line x1="50" y1="36" x2="50" y2="78" stroke={s} strokeWidth="1.5"/>
      <line x1="18" y1="57" x2="82" y2="57" stroke={s} strokeWidth="1.5" opacity={0.5}/>
      <circle cx="50" cy="29" r="3" fill={s}/>
    </g>
  ),
  29: s => ( // プロフィタビリティ: ウォーターフォール
    <g>
      <rect x="14" y="28" width="18" height="42" rx="2" fill={s} opacity={0.8}/>
      <rect x="38" y="38" width="14" height="32" rx="2" fill={s} opacity={0.5}/>
      <line x1="52" y1="54" x2="60" y2="54" stroke={s} strokeWidth="1.5" strokeDasharray="2,2"/>
      <rect x="60" y="50" width="14" height="20" rx="2" fill={s} opacity={0.75}/>
      <line x1="14" y1="74" x2="82" y2="74" stroke={s} strokeWidth="1.5" strokeLinecap="round"/>
    </g>
  ),
  35: s => ( // 新市場参入: 矢印 + 格子
    <g>
      <rect x="20" y="20" width="60" height="60" rx="4" fill="none" stroke={s} strokeWidth="1.5" opacity={0.4}/>
      <line x1="50" y1="20" x2="50" y2="80" stroke={s} strokeWidth="1" opacity={0.4}/>
      <line x1="20" y1="50" x2="80" y2="50" stroke={s} strokeWidth="1" opacity={0.4}/>
      <circle cx="68" cy="32" r="10" fill="none" stroke={s} strokeWidth="2.2"/>
      <circle cx="68" cy="32" r="3" fill={s}/>
      <line x1="22" y1="78" x2="60" y2="40" stroke={s} strokeWidth="2" strokeLinecap="round"/>
      <polyline points="54,38 62,38 62,46" fill="none" stroke={s} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </g>
  ),
  36: s => ( // M&A: 2つの円が合体
    <g>
      <circle cx="36" cy="50" r="20" fill="none" stroke={s} strokeWidth="2.2"/>
      <circle cx="64" cy="50" r="20" fill="none" stroke={s} strokeWidth="2.2"/>
      <path d="M 50 32 A 20 20 0 0 1 50 68" fill={s} opacity={0.15}/>
    </g>
  ),

  // ─── クリティカルシンキング ───
  40: s => ( // 入門: 虫眼鏡
    <g>
      <circle cx="44" cy="44" r="22" fill="none" stroke={s} strokeWidth="2.2"/>
      <line x1="60" y1="60" x2="80" y2="80" stroke={s} strokeWidth="3" strokeLinecap="round"/>
      <line x1="44" y1="36" x2="44" y2="52" stroke={s} strokeWidth="2" strokeLinecap="round" opacity={0.5}/>
      <line x1="36" y1="44" x2="52" y2="44" stroke={s} strokeWidth="2" strokeLinecap="round" opacity={0.5}/>
    </g>
  ),
  41: s => ( // 論理的誤謬: 壊れたチェーン
    <g>
      <line x1="18" y1="50" x2="35" y2="50" stroke={s} strokeWidth="2.5" strokeLinecap="round"/>
      <rect x="35" y="43" width="12" height="14" rx="3" fill="none" stroke={s} strokeWidth="2"/>
      <line x1="47" y1="50" x2="53" y2="50" stroke={s} strokeWidth="1" strokeLinecap="round" strokeDasharray="2,3" opacity={0.4}/>
      <line x1="53" y1="44" x2="60" y2="56" stroke={s} strokeWidth="2" strokeLinecap="round" opacity={0.6}/>
      <rect x="62" y="43" width="12" height="14" rx="3" fill="none" stroke={s} strokeWidth="2"/>
      <line x1="74" y1="50" x2="82" y2="50" stroke={s} strokeWidth="2.5" strokeLinecap="round"/>
    </g>
  ),
  42: s => ( // データを読む: 折れ線グラフ
    <g>
      <line x1="18" y1="78" x2="82" y2="78" stroke={s} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="18" y1="78" x2="18" y2="22" stroke={s} strokeWidth="1.5" strokeLinecap="round"/>
      <polyline points="22,68 36,52 50,58 64,34 78,40" fill="none" stroke={s} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="64" cy="34" r="3.5" fill={s}/>
    </g>
  ),
  43: s => ( // 問いを立てる: 大きな「?」
    <g>
      <path d="M 38 36 Q 38 24 50 24 Q 62 24 62 34 Q 62 42 52 46 L 52 54" fill="none" stroke={s} strokeWidth="2.8" strokeLinecap="round"/>
      <circle cx="52" cy="62" r="3" fill={s}/>
    </g>
  ),
  69: s => ( // 認知バイアス: 歪んだ鏡
    <g>
      <rect x="26" y="20" width="48" height="60" rx="4" fill="none" stroke={s} strokeWidth="2"/>
      <line x1="26" y1="38" x2="74" y2="38" stroke={s} strokeWidth="1" opacity={0.3}/>
      <path d="M 34 60 Q 50 72 66 60" fill="none" stroke={s} strokeWidth="2" strokeLinecap="round" opacity={0.5}/>
      <circle cx="42" cy="52" r="4" fill="none" stroke={s} strokeWidth="1.5" opacity={0.6}/>
      <circle cx="58" cy="52" r="4" fill="none" stroke={s} strokeWidth="1.5" opacity={0.6}/>
    </g>
  ),
  71: s => ( // 相関と因果: 2本の線 vs 矢印
    <g>
      <polyline points="18,72 36,48 54,56 72,32" fill="none" stroke={s} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity={0.4} strokeDasharray="4,3"/>
      <polyline points="18,72 36,56 54,44 72,32" fill="none" stroke={s} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity={0.4} strokeDasharray="4,3"/>
      <line x1="50" y1="82" x2="50" y2="58" stroke={s} strokeWidth="2.5" strokeLinecap="round"/>
      <polyline points="43,64 50,58 57,64" fill="none" stroke={s} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </g>
  ),

  // ─── 仮説思考 ───
  50: s => ( // 入門: ループ矢印
    <g>
      <path d="M 50 22 A 28 28 0 1 1 22 50" fill="none" stroke={s} strokeWidth="2.2" strokeLinecap="round"/>
      <polyline points="15,42 22,50 30,44" fill="none" stroke={s} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="50" cy="50" r="4" fill={s}/>
    </g>
  ),
  51: s => ( // 仮説の立て方: ダイヤ + 枝
    <g>
      <polygon points="50,22 64,50 50,78 36,50" fill="none" stroke={s} strokeWidth="2" strokeLinejoin="round"/>
      <line x1="64" y1="50" x2="80" y2="40" stroke={s} strokeWidth="1.5" strokeLinecap="round" opacity={0.6}/>
      <line x1="64" y1="50" x2="80" y2="60" stroke={s} strokeWidth="1.5" strokeLinecap="round" opacity={0.6}/>
      <circle cx="80" cy="40" r="3" fill={s} opacity={0.6}/>
      <circle cx="80" cy="60" r="3" fill={s} opacity={0.6}/>
    </g>
  ),
  52: s => ( // 仮説ドリブン: コンパス
    <g>
      <circle cx="50" cy="50" r="28" fill="none" stroke={s} strokeWidth="1.5" opacity={0.3}/>
      <line x1="50" y1="22" x2="50" y2="36" stroke={s} strokeWidth="2" strokeLinecap="round"/>
      <line x1="50" y1="64" x2="50" y2="78" stroke={s} strokeWidth="2" strokeLinecap="round" opacity={0.3}/>
      <line x1="22" y1="50" x2="36" y2="50" stroke={s} strokeWidth="2" strokeLinecap="round" opacity={0.3}/>
      <line x1="64" y1="50" x2="78" y2="50" stroke={s} strokeWidth="2" strokeLinecap="round" opacity={0.3}/>
      <polygon points="50,28 54,50 50,46 46,50" fill={s}/>
    </g>
  ),
  70: s => ( // 仮説の検証設計: A/B 分岐
    <g>
      <line x1="50" y1="22" x2="50" y2="40" stroke={s} strokeWidth="2" strokeLinecap="round"/>
      <line x1="50" y1="40" x2="28" y2="58" stroke={s} strokeWidth="2" strokeLinecap="round"/>
      <line x1="50" y1="40" x2="72" y2="58" stroke={s} strokeWidth="2" strokeLinecap="round"/>
      <rect x="18" y="58" width="20" height="18" rx="3" fill="none" stroke={s} strokeWidth="1.8"/>
      <rect x="62" y="58" width="20" height="18" rx="3" fill="none" stroke={s} strokeWidth="1.8"/>
      <line x1="18" y1="84" x2="38" y2="84" stroke={s} strokeWidth="2" strokeLinecap="round" opacity={0.6}/>
      <line x1="62" y1="84" x2="82" y2="84" stroke={s} strokeWidth="3" strokeLinecap="round"/>
    </g>
  ),

  // ─── 課題設定 ───
  53: s => ( // 入門: ターゲット
    <g>
      <circle cx="50" cy="50" r="30" fill="none" stroke={s} strokeWidth="1.5" opacity={0.35}/>
      <circle cx="50" cy="50" r="18" fill="none" stroke={s} strokeWidth="1.8" opacity={0.65}/>
      <circle cx="50" cy="50" r="6" fill={s}/>
      <line x1="50" y1="14" x2="50" y2="28" stroke={s} strokeWidth="1.5" strokeLinecap="round" opacity={0.35}/>
      <line x1="50" y1="72" x2="50" y2="86" stroke={s} strokeWidth="1.5" strokeLinecap="round" opacity={0.35}/>
      <line x1="14" y1="50" x2="28" y2="50" stroke={s} strokeWidth="1.5" strokeLinecap="round" opacity={0.35}/>
      <line x1="72" y1="50" x2="86" y2="50" stroke={s} strokeWidth="1.5" strokeLinecap="round" opacity={0.35}/>
    </g>
  ),
  54: s => ( // イシュー分析: ネットワーク + 中心強調
    <g>
      <circle cx="50" cy="50" r="8" fill={s} opacity={0.9}/>
      <circle cx="24" cy="34" r="5" fill={s} opacity={0.4}/>
      <circle cx="76" cy="34" r="5" fill={s} opacity={0.4}/>
      <circle cx="24" cy="66" r="5" fill={s} opacity={0.4}/>
      <circle cx="76" cy="66" r="5" fill={s} opacity={0.4}/>
      <circle cx="50" cy="20" r="5" fill={s} opacity={0.4}/>
      <circle cx="50" cy="80" r="5" fill={s} opacity={0.4}/>
      <line x1="50" y1="42" x2="50" y2="25" stroke={s} strokeWidth="1.5" opacity={0.4}/>
      <line x1="50" y1="58" x2="50" y2="75" stroke={s} strokeWidth="1.5" opacity={0.4}/>
      <line x1="42" y1="46" x2="29" y2="37" stroke={s} strokeWidth="1.5" opacity={0.4}/>
      <line x1="58" y1="46" x2="71" y2="37" stroke={s} strokeWidth="1.5" opacity={0.4}/>
      <line x1="42" y1="54" x2="29" y2="63" stroke={s} strokeWidth="1.5" opacity={0.4}/>
      <line x1="58" y1="54" x2="71" y2="63" stroke={s} strokeWidth="1.5" opacity={0.4}/>
    </g>
  ),
  55: s => ( // 実践: 付箋の整理
    <g>
      <rect x="16" y="20" width="28" height="24" rx="2" fill={s} opacity={0.2}/>
      <rect x="56" y="20" width="28" height="24" rx="2" fill={s} opacity={0.2}/>
      <rect x="16" y="56" width="28" height="24" rx="2" fill={s} opacity={0.35}/>
      <rect x="56" y="56" width="28" height="24" rx="2" fill={s} opacity={0.5}/>
      <line x1="16" y1="48" x2="84" y2="48" stroke={s} strokeWidth="1.5" strokeLinecap="round" opacity={0.4}/>
      <line x1="50" y1="20" x2="50" y2="80" stroke={s} strokeWidth="1.5" strokeLinecap="round" opacity={0.4}/>
    </g>
  ),

  // ─── デザインシンキング ───
  56: s => ( // 入門: ダブルダイヤモンド
    <g>
      <polygon points="18,50 36,22 54,50 36,78" fill="none" stroke={s} strokeWidth="2" strokeLinejoin="round"/>
      <polygon points="46,50 64,22 82,50 64,78" fill="none" stroke={s} strokeWidth="2" strokeLinejoin="round"/>
      <line x1="36" y1="50" x2="64" y2="50" stroke={s} strokeWidth="1.5" strokeDasharray="3,3" opacity={0.5}/>
    </g>
  ),
  57: s => ( // 共感マップ: 十字 + 人
    <g>
      <circle cx="50" cy="30" r="10" fill="none" stroke={s} strokeWidth="2"/>
      <line x1="50" y1="40" x2="50" y2="58" stroke={s} strokeWidth="2" strokeLinecap="round"/>
      <line x1="30" y1="50" x2="70" y2="50" stroke={s} strokeWidth="1.5" strokeLinecap="round" opacity={0.5}/>
      <line x1="20" y1="50" x2="30" y2="50" stroke={s} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="70" y1="50" x2="80" y2="50" stroke={s} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="50" y1="20" x2="50" y2="28" stroke={s} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="50" y1="58" x2="50" y2="80" stroke={s} strokeWidth="1.5" strokeLinecap="round"/>
    </g>
  ),
  58: s => ( // 実践: プロトタイプ繰り返し
    <g>
      <rect x="20" y="28" width="60" height="40" rx="4" fill="none" stroke={s} strokeWidth="2"/>
      <line x1="20" y1="44" x2="80" y2="44" stroke={s} strokeWidth="1.2" opacity={0.4}/>
      <rect x="26" y="50" width="18" height="12" rx="2" fill={s} opacity={0.3}/>
      <rect x="50" y="50" width="24" height="12" rx="2" fill={s} opacity={0.5}/>
      <path d="M 40 76 Q 50 86 60 76" fill="none" stroke={s} strokeWidth="2" strokeLinecap="round"/>
      <polyline points="56,72 60,76 56,80" fill="none" stroke={s} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </g>
  ),

  // ─── ラテラルシンキング ───
  59: s => ( // 入門: 壁を突き破る矢印
    <g>
      <rect x="38" y="18" width="8" height="64" rx="2" fill={s} opacity={0.25}/>
      <line x1="16" y1="50" x2="34" y2="50" stroke={s} strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="42" y1="50" x2="62" y2="50" stroke={s} strokeWidth="2.5" strokeLinecap="round"/>
      <polyline points="56,43 63,50 56,57" fill="none" stroke={s} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="70" y1="30" x2="70" y2="70" stroke={s} strokeWidth="1.5" strokeLinecap="round" opacity={0.4} strokeDasharray="3,3"/>
    </g>
  ),
  60: s => ( // 技法: ランダム刺激 → 接続
    <g>
      <circle cx="24" cy="30" r="6" fill="none" stroke={s} strokeWidth="1.8" opacity={0.6}/>
      <circle cx="76" cy="30" r="6" fill="none" stroke={s} strokeWidth="1.8" opacity={0.6}/>
      <circle cx="50" cy="72" r="8" fill={s} opacity={0.8}/>
      <line x1="24" y1="36" x2="46" y2="66" stroke={s} strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3,3" opacity={0.5}/>
      <line x1="76" y1="36" x2="54" y2="66" stroke={s} strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3,3" opacity={0.5}/>
      <line x1="24" y1="30" x2="76" y2="30" stroke={s} strokeWidth="1.5" strokeLinecap="round" opacity={0.3} strokeDasharray="4,4"/>
    </g>
  ),
  61: s => ( // 実践: 迷路の近道
    <g>
      <rect x="16" y="16" width="68" height="68" rx="3" fill="none" stroke={s} strokeWidth="1.5" opacity={0.4}/>
      <line x1="30" y1="16" x2="30" y2="48" stroke={s} strokeWidth="1.5" opacity={0.4}/>
      <line x1="30" y1="48" x2="56" y2="48" stroke={s} strokeWidth="1.5" opacity={0.4}/>
      <line x1="56" y1="48" x2="56" y2="16" stroke={s} strokeWidth="1.5" opacity={0.4}/>
      <polyline points="16,84 84,16" fill="none" stroke={s} strokeWidth="2.5" strokeLinecap="round" strokeDasharray="5,3"/>
      <polyline points="78,22 84,16 78,10" fill="none" stroke={s} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </g>
  ),

  // ─── アナロジー思考 ───
  62: s => ( // 入門: □→○ 変換
    <g>
      <rect x="14" y="36" width="26" height="26" rx="4" fill="none" stroke={s} strokeWidth="2"/>
      <circle cx="72" cy="49" r="14" fill="none" stroke={s} strokeWidth="2"/>
      <line x1="44" y1="49" x2="54" y2="49" stroke={s} strokeWidth="1.8" strokeLinecap="round"/>
      <polyline points="50,44 56,49 50,54" fill="none" stroke={s} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </g>
  ),
  63: s => ( // 技法: 遠い領域からの橋
    <g>
      <circle cx="24" cy="50" r="14" fill="none" stroke={s} strokeWidth="1.8"/>
      <circle cx="76" cy="50" r="14" fill="none" stroke={s} strokeWidth="1.8"/>
      <line x1="38" y1="44" x2="62" y2="44" stroke={s} strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3,3"/>
      <line x1="38" y1="56" x2="62" y2="56" stroke={s} strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3,3"/>
    </g>
  ),
  64: s => ( // 実践: 2つの構造の対応
    <g>
      <rect x="14" y="22" width="30" height="54" rx="3" fill="none" stroke={s} strokeWidth="1.8"/>
      <rect x="56" y="22" width="30" height="54" rx="3" fill="none" stroke={s} strokeWidth="1.8"/>
      <line x1="14" y1="40" x2="44" y2="40" stroke={s} strokeWidth="1" opacity={0.4}/>
      <line x1="56" y1="40" x2="86" y2="40" stroke={s} strokeWidth="1" opacity={0.4}/>
      <line x1="14" y1="58" x2="44" y2="58" stroke={s} strokeWidth="1" opacity={0.4}/>
      <line x1="56" y1="58" x2="86" y2="58" stroke={s} strokeWidth="1" opacity={0.4}/>
      <line x1="44" y1="31" x2="56" y2="31" stroke={s} strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2,2"/>
      <line x1="44" y1="49" x2="56" y2="49" stroke={s} strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2,2"/>
      <line x1="44" y1="67" x2="56" y2="67" stroke={s} strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2,2"/>
    </g>
  ),

  // ─── システムシンキング ───
  65: s => ( // 入門: 3ノード循環
    <g>
      <circle cx="50" cy="26" r="7" fill={s} opacity={0.75}/>
      <circle cx="72" cy="66" r="7" fill={s} opacity={0.75}/>
      <circle cx="28" cy="66" r="7" fill={s} opacity={0.75}/>
      <path d="M 55 32 C 68 40 70 54 68 60" fill="none" stroke={s} strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M 66 72 C 52 82 36 76 32 68" fill="none" stroke={s} strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M 32 60 C 30 46 38 34 46 30" fill="none" stroke={s} strokeWidth="1.8" strokeLinecap="round"/>
      <polyline points="63,60 68,60 66,66" fill="none" stroke={s} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </g>
  ),
  66: s => ( // システム原型: 強化ループ + バランスループ
    <g>
      <path d="M 30 50 A 20 20 0 1 1 30 50.01" fill="none" stroke={s} strokeWidth="2" strokeLinecap="round" opacity={0.35}/>
      <polyline points="38,30 30,32 28,40" fill="none" stroke={s} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity={0.35}/>
      <path d="M 70 40 A 14 14 0 0 0 70 60" fill="none" stroke={s} strokeWidth="2" strokeLinecap="round"/>
      <polyline points="62,56 70,60 74,53" fill="none" stroke={s} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="46" y1="50" x2="56" y2="50" stroke={s} strokeWidth="1.5" strokeLinecap="round" opacity={0.4}/>
    </g>
  ),
  67: s => ( // 実践: 氷山モデル
    <g>
      <polygon points="50,20 70,48 30,48" fill={s} opacity={0.7} strokeLinejoin="round"/>
      <line x1="26" y1="52" x2="74" y2="52" stroke={s} strokeWidth="1.5" strokeLinecap="round" opacity={0.5}/>
      <polygon points="50,56 80,86 20,86" fill={s} opacity={0.2} strokeLinejoin="round"/>
      <polygon points="50,56 80,86 20,86" fill="none" stroke={s} strokeWidth="1.5" strokeLinejoin="round" opacity={0.4}/>
    </g>
  ),

  // ─── 提案・伝える技術 ───
  72: s => ( // 目的: スポットライト
    <g>
      <polygon points="50,18 38,42 62,42" fill="none" stroke={s} strokeWidth="1.8" strokeLinejoin="round"/>
      <line x1="38" y1="42" x2="22" y2="78" stroke={s} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="62" y1="42" x2="78" y2="78" stroke={s} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="22" y1="78" x2="78" y2="78" stroke={s} strokeWidth="2" strokeLinecap="round"/>
      <circle cx="50" cy="18" r="4" fill={s}/>
    </g>
  ),
  73: s => ( // 相手の立場: 2つの顔
    <g>
      <circle cx="34" cy="36" r="10" fill="none" stroke={s} strokeWidth="2"/>
      <circle cx="66" cy="36" r="10" fill="none" stroke={s} strokeWidth="2"/>
      <line x1="34" y1="46" x2="34" y2="64" stroke={s} strokeWidth="2" strokeLinecap="round"/>
      <line x1="66" y1="46" x2="66" y2="64" stroke={s} strokeWidth="2" strokeLinecap="round"/>
      <line x1="20" y1="56" x2="48" y2="56" stroke={s} strokeWidth="1.5" strokeLinecap="round" opacity={0.5}/>
      <line x1="52" y1="56" x2="80" y2="56" stroke={s} strokeWidth="1.5" strokeLinecap="round" opacity={0.5}/>
      <line x1="44" y1="50" x2="56" y2="50" stroke={s} strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2,2" opacity={0.5}/>
    </g>
  ),
  74: s => ( // ストーリーライン: 山型アーク
    <g>
      <path d="M 16 74 Q 30 30 50 26 Q 70 22 84 74" fill="none" stroke={s} strokeWidth="2.2" strokeLinecap="round"/>
      <line x1="16" y1="78" x2="84" y2="78" stroke={s} strokeWidth="1.5" strokeLinecap="round" opacity={0.4}/>
      <circle cx="50" cy="26" r="4" fill={s}/>
      <line x1="50" y1="30" x2="50" y2="78" stroke={s} strokeWidth="1" strokeLinecap="round" strokeDasharray="3,3" opacity={0.3}/>
    </g>
  ),
  75: s => ( // メッセージ: ダイヤ研磨
    <g>
      <polygon points="50,20 72,50 50,80 28,50" fill="none" stroke={s} strokeWidth="2.2" strokeLinejoin="round"/>
      <line x1="28" y1="50" x2="50" y2="20" stroke={s} strokeWidth="1" opacity={0.35}/>
      <line x1="72" y1="50" x2="50" y2="20" stroke={s} strokeWidth="1" opacity={0.35}/>
      <line x1="38" y1="35" x2="62" y2="35" stroke={s} strokeWidth="1" opacity={0.35}/>
      <line x1="38" y1="65" x2="62" y2="65" stroke={s} strokeWidth="1" opacity={0.35}/>
    </g>
  ),
  76: s => ( // 反論: チェスの駒
    <g>
      <rect x="36" y="62" width="28" height="8" rx="2" fill={s} opacity={0.7}/>
      <rect x="40" y="54" width="20" height="8" rx="2" fill={s} opacity={0.6}/>
      <rect x="42" y="32" width="16" height="22" rx="4" fill="none" stroke={s} strokeWidth="2"/>
      <circle cx="50" cy="26" r="6" fill="none" stroke={s} strokeWidth="2"/>
      <line x1="36" y1="30" x2="50" y2="36" stroke={s} strokeWidth="1.5" strokeLinecap="round" opacity={0.4}/>
      <line x1="64" y1="30" x2="50" y2="36" stroke={s} strokeWidth="1.5" strokeLinecap="round" opacity={0.4}/>
    </g>
  ),

  // ─── 哲学 ───
  // 78: 反証可能性 — 1本の黒い白鳥で崩れる「すべての白鳥は白い」
  78: s => (
    <g>
      {/* すべての白線 */}
      <line x1="18" y1="26" x2="50" y2="26" stroke={s} strokeWidth="2" strokeLinecap="round" opacity={0.35}/>
      <line x1="18" y1="38" x2="50" y2="38" stroke={s} strokeWidth="2" strokeLinecap="round" opacity={0.35}/>
      <line x1="18" y1="50" x2="50" y2="50" stroke={s} strokeWidth="2" strokeLinecap="round" opacity={0.35}/>
      {/* 1本だけ打ち消し線（反証例） */}
      <line x1="55" y1="64" x2="82" y2="64" stroke={s} strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="55" y1="56" x2="82" y2="72" stroke={s} strokeWidth="2.5" strokeLinecap="round" opacity={0.9}/>
      {/* ×印 */}
      <line x1="58" y1="78" x2="80" y2="56" stroke={s} strokeWidth="1.5" strokeLinecap="round" opacity={0.5}/>
      {/* 枠 */}
      <rect x="14" y="18" width="42" height="42" rx="4" fill="none" stroke={s} strokeWidth="1.2" opacity={0.3}/>
      <rect x="51" y="52" width="35" height="28" rx="4" fill="none" stroke={s} strokeWidth="1.5"/>
    </g>
  ),
  // 79: 功利主義 vs 義務論 — 天秤
  79: s => (
    <g>
      {/* 天秤の支柱 */}
      <line x1="50" y1="20" x2="50" y2="60" stroke={s} strokeWidth="2.2" strokeLinecap="round"/>
      <line x1="26" y1="44" x2="74" y2="44" stroke={s} strokeWidth="2" strokeLinecap="round"/>
      {/* 左皿（功利主義: 少し下がってる） */}
      <line x1="26" y1="44" x2="26" y2="58" stroke={s} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M 14 58 Q 26 66 38 58" fill="none" stroke={s} strokeWidth="1.8" strokeLinecap="round"/>
      {/* 右皿（義務論: 少し上がってる） */}
      <line x1="74" y1="44" x2="74" y2="54" stroke={s} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M 62 54 Q 74 62 86 54" fill="none" stroke={s} strokeWidth="1.8" strokeLinecap="round"/>
      {/* 底部台座 */}
      <rect x="44" y="60" width="12" height="6" rx="2" fill={s} opacity={0.5}/>
      <line x1="38" y1="66" x2="62" y2="66" stroke={s} strokeWidth="2" strokeLinecap="round" opacity={0.6}/>
    </g>
  ),
  // 80: 認識論 — デカルト「我思う、ゆえに我あり」: 思考の泡から生まれる「私」
  80: s => (
    <g>
      {/* 中心の自己 */}
      <circle cx="50" cy="62" r="8" fill={s} opacity={0.85}/>
      {/* 疑念の泡（次第に薄くなる） */}
      <circle cx="36" cy="48" r="5" fill="none" stroke={s} strokeWidth="1.8" opacity={0.7}/>
      <circle cx="56" cy="40" r="7" fill="none" stroke={s} strokeWidth="1.5" opacity={0.5}/>
      <circle cx="34" cy="28" r="6" fill="none" stroke={s} strokeWidth="1.2" opacity={0.35}/>
      <circle cx="62" cy="24" r="4" fill="none" stroke={s} strokeWidth="1.2" opacity={0.25}/>
      <circle cx="72" cy="48" r="5" fill="none" stroke={s} strokeWidth="1.5" opacity={0.4}/>
      {/* 接続線 */}
      <line x1="50" y1="54" x2="40" y2="52" stroke={s} strokeWidth="1" strokeLinecap="round" opacity={0.4}/>
      <line x1="50" y1="54" x2="57" y2="47" stroke={s} strokeWidth="1" strokeLinecap="round" opacity={0.4}/>
      <line x1="50" y1="54" x2="67" y2="51" stroke={s} strokeWidth="1" strokeLinecap="round" opacity={0.4}/>
      {/* Cogito ergo sum: 「思う」の矢印 */}
      <polyline points="50,80 50,72" stroke={s} strokeWidth="0" strokeLinecap="round"/>
    </g>
  ),
  // 81: 思考実験 — トロッコ問題: 分岐するレール
  81: s => (
    <g>
      {/* メインレール */}
      <line x1="18" y1="30" x2="50" y2="30" stroke={s} strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="18" y1="38" x2="50" y2="38" stroke={s} strokeWidth="2.5" strokeLinecap="round"/>
      {/* 枕木 */}
      <line x1="24" y1="28" x2="24" y2="40" stroke={s} strokeWidth="1.5" strokeLinecap="round" opacity={0.5}/>
      <line x1="36" y1="28" x2="36" y2="40" stroke={s} strokeWidth="1.5" strokeLinecap="round" opacity={0.5}/>
      <line x1="46" y1="28" x2="46" y2="40" stroke={s} strokeWidth="1.5" strokeLinecap="round" opacity={0.5}/>
      {/* 分岐レール A（直進） */}
      <line x1="50" y1="30" x2="82" y2="22" stroke={s} strokeWidth="2.2" strokeLinecap="round" opacity={0.6}/>
      <line x1="50" y1="38" x2="82" y2="30" stroke={s} strokeWidth="2.2" strokeLinecap="round" opacity={0.6}/>
      {/* 分岐レール B（下） */}
      <line x1="50" y1="38" x2="82" y2="60" stroke={s} strokeWidth="2.2" strokeLinecap="round"/>
      <line x1="50" y1="30" x2="82" y2="52" stroke={s} strokeWidth="2.2" strokeLinecap="round"/>
      {/* 切り替えポイント（強調） */}
      <circle cx="50" cy="34" r="4" fill={s}/>
      {/* 人（ピン人） */}
      <circle cx="78" cy="56" r="3" fill={s} opacity={0.7}/>
      <line x1="78" y1="59" x2="78" y2="68" stroke={s} strokeWidth="1.5" strokeLinecap="round" opacity={0.7}/>
    </g>
  ),
  77: s => ( // ソクラテスの問答法: 2人の対話
    <g>
      <circle cx="30" cy="38" r="10" fill="none" stroke={s} strokeWidth="2"/>
      <circle cx="70" cy="38" r="10" fill="none" stroke={s} strokeWidth="2"/>
      <path d="M 22 52 Q 22 66 30 66 L 70 66 Q 78 66 78 52" fill="none" stroke={s} strokeWidth="1.5" strokeLinecap="round" opacity={0.4}/>
      <path d="M 38 30 Q 50 22 62 30" fill="none" stroke={s} strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3,3"/>
      <circle cx="40" cy="56" r="5" fill="none" stroke={s} strokeWidth="1.5" opacity={0.6}/>
      <circle cx="60" cy="56" r="5" fill="none" stroke={s} strokeWidth="1.5" opacity={0.6}/>
    </g>
  ),
}

// ─── カテゴリ → パレット ───
function getPalette(lessonId: number): { bg: string; stroke: string } {
  if ([20,21,22,23,24,25,26,27,68].includes(lessonId)) return PALETTE.logic
  if ([28,29,35,36].includes(lessonId)) return PALETTE.case
  if ([40,41,42,43,69,71].includes(lessonId)) return PALETTE.critical
  if ([50,51,52,70].includes(lessonId)) return PALETTE.hypo
  if ([53,54,55].includes(lessonId)) return PALETTE.issue
  if ([56,57,58].includes(lessonId)) return PALETTE.design
  if ([59,60,61].includes(lessonId)) return PALETTE.lateral
  if ([62,63,64].includes(lessonId)) return PALETTE.analogy
  if ([65,66,67].includes(lessonId)) return PALETTE.systems
  if ([72,73,74,75,76].includes(lessonId)) return PALETTE.proposal
  if ([77,78,79,80,81].includes(lessonId)) return PALETTE.philo
  return PALETTE.logic
}

// ─── デフォルトシェイプ（未定義IDのフォールバック） ───
function defaultShape(s: string): React.ReactElement {
  return (
    <g>
      <circle cx="50" cy="50" r="28" fill="none" stroke={s} strokeWidth="2"/>
      <line x1="50" y1="22" x2="50" y2="78" stroke={s} strokeWidth="1.5" strokeLinecap="round" opacity={0.4}/>
      <line x1="22" y1="50" x2="78" y2="50" stroke={s} strokeWidth="1.5" strokeLinecap="round" opacity={0.4}/>
    </g>
  )
}

// ──────────────────────────────────────────────
// メインコンポーネント
// ──────────────────────────────────────────────
interface LessonThumbnailProps {
  lessonId: number
  size?: number          // px (default 88 for roadmap list, 100% for hero)
  className?: string
  style?: React.CSSProperties
}

export function LessonThumbnail({ lessonId, size, className, style }: LessonThumbnailProps) {
  const palette = getPalette(lessonId)
  const shapeFn = SHAPES[lessonId] ?? (() => defaultShape(palette.stroke))
  const shape = shapeFn(palette.stroke)

  const sizeStyle: React.CSSProperties = size
    ? { width: size, height: size }
    : { width: '100%', height: '100%' }

  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'block', ...sizeStyle, ...style }}
    >
      <rect width="100" height="100" fill={palette.bg}/>
      {shape}
    </svg>
  )
}
