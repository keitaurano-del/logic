// ─── ジャーナル タグ統制語彙（controlled vocabulary）────────────────
//
// 目的:
//   AI 自動タグ生成（server /api/journal/tags・/summarize）が固有タグを
//   量産する問題（例: 「クライアントMTG」「顧客打ち合わせ」「商談」「お客さん訪問」
//   が全部別タグになる）を抑えるための「推奨語彙」を定義する。
//
// 設計方針: オープン ＋ 強い推奨
//   - canonical 群は固定リスト。AI／ユーザーへ「まずこの語彙から選んで」と強く推奨する。
//   - ただし語彙外タグも型・データ上は許容する（クローズドにしない）。
//     ＝ canonicalizeTag が語彙にヒットしなければ入力タグをそのまま返す。
//   - これにより「日々のジャーナルでよく出る概念は名寄せされて集計しやすく、
//     かつ語彙に無い個別の話題（特定の人名・固有プロジェクト名など）も失われない」
//     という両立を狙う。
//
// T3（journalDb の normalizeTagDisplay / tagMatchKey）との関係:
//   - T3 は「同じ語の表記ゆれ」を畳む層（MECE↔mece、全角半角、先頭 # 剥がし）。
//   - D1（このファイル）は「意味は同じだが別の語」を canonical へ寄せる層
//     （クライアントMTG↔顧客打ち合わせ↔商談）。完全に別軸。
//   - synonym 照合キーは T3 の tagMatchKey と同じ正規化（NFKC + 小文字化）に
//     合わせてあるので、二重実装にならず T3 の上に素直に乗る。
//
// このファイルのスコープ（D1）:
//   語彙データ + 型 + 参照ヘルパー（canonicalizeTag / buildVocabularyPromptHint 等）まで。
//   実際にプロンプトへ語彙を差し込む処理（D2）、既存タグの一括マッピング（D3）、
//   UI 表示（D4）は別サブタスクが本ファイルを import して実装する。

// ─── 型定義 ──────────────────────────────────────────────────────

/**
 * 語彙を整理する軸。
 *   theme:     何についての一日か（仕事・健康・人間関係 等の大きな主題）
 *   action:    その日に取った行動・活動（会議・集中作業・運動・学習 等）
 *   situation: 置かれていた状況・出来事（締切・トラブル・成果・移動 等）
 *   mood:      心身のコンディション・感情（前向き・疲労・不安 等）
 */
export type TagAxis = 'theme' | 'action' | 'situation' | 'mood'

export const TAG_AXES: TagAxis[] = ['theme', 'action', 'situation', 'mood']

/** 軸の表示ラベル（ja/en）。UI で軸ごとにグルーピングする D4 が利用できる。 */
export const TAG_AXIS_LABELS: Record<TagAxis, { ja: string; en: string }> = {
  theme: { ja: 'テーマ', en: 'Theme' },
  action: { ja: '行動', en: 'Action' },
  situation: { ja: '状況', en: 'Situation' },
  mood: { ja: '気分', en: 'Mood' },
}

/**
 * canonical（正規）タグ 1 件の定義。
 *   id:       語彙内で安定した識別子（英小文字・ハイフン。永続化や集計のキー用途）。
 *   axis:     どの軸に属するか。
 *   ja / en:  表示用の正規表記（ユーザーに見せる・AI に推奨する語）。
 *   synonyms: この canonical に名寄せする同義語・表記ゆれ・近い表現（ja/en 混在可）。
 *             ja / en 本体は自動的に synonym 扱いになるので、ここには重複して書かない。
 */
export interface CanonicalTag {
  id: string
  axis: TagAxis
  ja: string
  en: string
  synonyms: string[]
}

// ─── 語彙データ ──────────────────────────────────────────────────
//
// 粒度の狙い: 「日々のジャーナルで週に何度も出てくる概念」を 1 つの canonical に束ねる。
//   - 細かすぎ（例: 「A社MTG」「B社MTG」を別タグ）→ 量産の原因なので canonical「会議・打ち合わせ」へ寄せる。
//   - 粗すぎ（例: 全部「仕事」）→ 集計しても何も見えないので避ける。
//   - synonyms は実際に AI が出しがちな表記（プロンプトの例「クライアントMTG, 集中, 体調不良, 読書」由来）と、
//     ユーザーが手打ちしそうな砕けた言い方を中心に収録する。
//
// プロセス段階・状態モディファイアの畳み込み（粒度引き上げ 2026-05-29）:
//   AI が「出産準備」「出産サポート」「仕事多忙」「引っ越し進行」のように、
//   親概念に「準備 / 進行 / サポート / 完了 / 多忙 / 中 / 開始」等の段階・状態を
//   付けた派生タグを量産しがち。これらは集計上ほぼ親概念と同じ意味なので、
//   親 canonical（出産 / 引っ越し / 仕事 等）の synonyms に複合形で寄せて畳む。
//   - 単独の状態語（「多忙」「完了」「準備」自体）は別 canonical（busy / achievement /
//     planning）が既に持つので、ここでは必ず「親＋状態」の複合形（「仕事多忙」「出産準備」）
//     で寄せる。SYNONYM_INDEX は先勝ちなので、複合形にしておけば既存の単独語 canonical と
//     衝突しない（＝親に正しく解決される）。

export const CANONICAL_TAGS: CanonicalTag[] = [
  // ─── theme（テーマ：何についての一日か）──────────────────────
  {
    id: 'work',
    axis: 'theme',
    ja: '仕事',
    en: 'work',
    synonyms: [
      '業務', '本業', 'job', 'office', 'ワーク',
      // プロセス段階・状態モディファイア付き派生（親「仕事」へ畳む）
      // ※「繁忙」単独は situation:busy が持つので入れない。仕事固有の複合形だけ寄せる。
      '仕事多忙', '仕事完了', '仕事準備', '仕事対応', '仕事の準備', '仕事終わり',
      '残業', '繁忙期', '仕事漬け', '激務', '業務多忙', '業務対応', '仕事山積み',
    ],
  },
  {
    id: 'study',
    axis: 'theme',
    ja: '学習',
    en: 'study',
    synonyms: [
      '勉強', '学び', '自己研鑽', 'インプット', 'learning', '読書', '読書時間', 'reading', '資格勉強', '語学',
      // プロセス段階派生（親「学習」へ畳む）
      '勉強中', '勉強会', '試験勉強', '受験勉強', '試験準備', '資格勉強中', '語学学習',
    ],
  },
  {
    id: 'health',
    axis: 'theme',
    ja: '健康',
    en: 'health',
    synonyms: ['体調', 'からだ', 'コンディション', 'ヘルスケア', '食事', '睡眠管理', 'wellness'],
  },
  {
    id: 'relationships',
    axis: 'theme',
    ja: '人間関係',
    en: 'relationships',
    synonyms: ['対人', '人付き合い', '交友', '人脈', 'コミュニケーション', 'people', 'social'],
  },
  {
    id: 'family',
    axis: 'theme',
    ja: '家族',
    en: 'family',
    synonyms: ['家庭', '親', '子ども', '夫婦', 'パートナー', '実家', 'home life'],
  },
  {
    id: 'money',
    axis: 'theme',
    ja: 'お金',
    en: 'money',
    synonyms: ['家計', '出費', '支出', '貯金', '投資', '節約', 'finance', '財務'],
  },
  {
    id: 'career',
    axis: 'theme',
    ja: 'キャリア',
    en: 'career',
    synonyms: [
      '進路', '転職', '昇進', '将来設計', 'キャリアプラン', '評価', 'promotion',
      // 転職まわりのプロセス派生（親「キャリア」へ畳む）
      '転職準備', '転職活動', '転職活動中', '就活', '就職活動', '面接準備', '退職準備', '退職手続き', 'job hunting',
    ],
  },
  {
    id: 'self-growth',
    axis: 'theme',
    ja: '自己成長',
    en: 'self-growth',
    synonyms: ['成長', '内省', '振り返り', '自己分析', '気づき', 'self-improvement', 'reflection', '習慣化', '習慣'],
  },
  {
    id: 'hobby',
    axis: 'theme',
    ja: '趣味',
    en: 'hobby',
    synonyms: ['娯楽', 'エンタメ', '気分転換', '遊び', 'レジャー', 'leisure', '映画', 'ゲーム'],
  },

  // ─── theme（ライフイベント：準備/進行派生を生みやすい大きな出来事）──
  // 「出産準備」「引っ越し進行」のような段階・状態モディファイア付きの派生タグを
  // 親イベント概念へ畳むための canonical。日記に出やすく、AI が段階タグを量産しがち。
  {
    id: 'childbirth',
    axis: 'theme',
    ja: '出産',
    en: 'childbirth',
    synonyms: [
      '出産準備', '出産サポート', '出産対応', '出産後', '産後', '出産前', '臨月',
      '妊娠', '妊娠中', 'マタニティ', '里帰り出産', '立ち会い', '入院準備', 'birth', 'pregnancy',
    ],
  },
  {
    id: 'childcare',
    axis: 'theme',
    ja: '育児',
    en: 'childcare',
    synonyms: [
      '育児準備', '育児サポート', '子育て', '子育て準備', '育休', '育児休業', '寝かしつけ',
      '夜泣き対応', '保活', '保育園準備', '送り迎え', 'parenting', 'childrearing',
    ],
  },
  {
    id: 'moving',
    axis: 'theme',
    ja: '引っ越し',
    en: 'moving',
    synonyms: [
      '引っ越し準備', '引っ越し進行', '引っ越しサポート', '引っ越し完了', '引越し', '引越',
      '転居', '荷造り', '梱包', '内見', '物件探し', '部屋探し', '退去', '入居', 'relocation', 'house moving',
    ],
  },
  {
    id: 'marriage',
    axis: 'theme',
    ja: '結婚',
    en: 'marriage',
    synonyms: [
      '結婚準備', '結婚進行', '結婚サポート', '入籍', '結婚式準備', '式準備', '挙式',
      '婚約', 'プロポーズ', '結婚式', '披露宴', '新婚', 'wedding', 'wedding prep',
    ],
  },

  // ─── action（行動：その日取った活動）────────────────────────
  {
    id: 'meeting',
    axis: 'action',
    ja: '会議・打ち合わせ',
    en: 'meeting',
    synonyms: [
      'MTG', 'ミーティング', '打ち合わせ', '打合せ', '商談', '面談', '面接',
      'クライアントMTG', 'クライアント会議', '顧客打ち合わせ', 'お客さん訪問', '客先訪問',
      '1on1', '定例', '定例会', 'レビュー会', 'client meeting', 'meetings', 'call', 'ミーティング',
    ],
  },
  {
    id: 'deep-work',
    axis: 'action',
    ja: '集中作業',
    en: 'deep work',
    synonyms: ['集中', '没頭', '作業', 'タスク処理', '実装', '執筆', '資料作成', 'focus', 'deep focus', '深い集中', 'もくもく'],
  },
  {
    id: 'planning',
    axis: 'action',
    ja: '計画・段取り',
    en: 'planning',
    synonyms: ['計画', '段取り', 'タスク整理', '優先順位付け', 'スケジューリング', '準備', '仕込み', 'prep', 'planning', 'todo整理'],
  },
  {
    id: 'exercise',
    axis: 'action',
    ja: '運動',
    en: 'exercise',
    synonyms: [
      '筋トレ', 'トレーニング', 'ジム', 'ランニング', '散歩', 'ウォーキング', 'ヨガ', 'workout', 'running', 'walk', 'スポーツ',
      // プロセス段階・状態派生（親「運動」へ畳む）
      'トレーニング中', '運動習慣', 'ジム通い', '運動不足', 'ダイエット', 'ストレッチ',
    ],
  },
  {
    id: 'rest',
    axis: 'action',
    ja: '休息',
    en: 'rest',
    synonyms: ['休憩', '休み', 'リラックス', '昼寝', '仮眠', 'のんびり', 'break', 'relax', '休養', 'リフレッシュ'],
  },
  {
    id: 'meal',
    axis: 'action',
    ja: '食事',
    en: 'meal',
    synonyms: ['ごはん', '昼食', 'ランチ', '夕食', '朝食', '外食', '自炊', 'dinner', 'lunch', '家族との食事', 'family dinner'],
  },
  {
    id: 'output',
    axis: 'action',
    ja: 'アウトプット',
    en: 'output',
    synonyms: ['発信', '登壇', 'プレゼン', '発表', '提案', '納品', 'リリース', '投稿', 'presentation', 'shipping'],
  },
  {
    id: 'chores',
    axis: 'action',
    ja: '家事・雑務',
    en: 'chores',
    synonyms: ['家事', '掃除', '洗濯', '片付け', '買い物', '雑務', '事務作業', 'errands', '手続き'],
  },

  // ─── situation（状況：置かれていた状態・出来事）──────────────
  {
    id: 'deadline',
    axis: 'situation',
    ja: '締切',
    en: 'deadline',
    synonyms: ['納期', '〆切', 'デッドライン', '期限', '締め切り間際', 'due', 'タイトな日程'],
  },
  {
    id: 'busy',
    axis: 'situation',
    ja: '多忙',
    en: 'busy',
    synonyms: ['忙しい', 'バタバタ', '繁忙', '余裕なし', '詰まってる', 'overloaded', 'hectic', '手一杯'],
  },
  {
    id: 'trouble',
    axis: 'situation',
    ja: 'トラブル',
    en: 'trouble',
    synonyms: ['問題発生', '失敗', 'ミス', 'クレーム', '炎上', '想定外', '障害', 'issue', 'incident', 'うまくいかない'],
  },
  {
    id: 'achievement',
    axis: 'situation',
    ja: '成果',
    en: 'achievement',
    synonyms: [
      '達成', '成功', '前進', '進捗', 'うまくいった', '手応え', '完了', 'win', 'progress', 'やりきった',
      // 「X完了」系の複合派生（親「成果」へ畳む。※「仕事完了」は work が先勝ち）
      'タスク完了', '対応完了', '案件完了', '目標達成', '完遂',
    ],
  },
  {
    id: 'decision',
    axis: 'situation',
    ja: '意思決定',
    en: 'decision',
    synonyms: ['判断', '決断', '選択', '方針決め', '迷い', '決めた', 'decision making', 'choice'],
  },
  {
    id: 'learning-moment',
    axis: 'situation',
    ja: '学び・発見',
    en: 'insight',
    synonyms: ['発見', '気づき', 'なるほど', '新しい視点', 'ひらめき', '腹落ち', 'insight', 'aha', '勉強になった'],
  },
  {
    id: 'commute',
    axis: 'situation',
    ja: '移動',
    en: 'commute',
    synonyms: ['通勤', '出張', '移動時間', '電車', '外出', 'travel', 'trip', '帰省'],
  },

  // ─── mood（気分：心身のコンディション・感情）──────────────────
  {
    id: 'positive',
    axis: 'mood',
    ja: '前向き',
    en: 'positive',
    synonyms: ['ポジティブ', '上向き', '気分良い', '充実', 'やる気', 'モチベ高い', '楽しい', 'good mood', 'energized', '気分が乗る'],
  },
  {
    id: 'calm',
    axis: 'mood',
    ja: '穏やか',
    en: 'calm',
    synonyms: ['落ち着いた', '平穏', 'リラックス', 'マイペース', '安定', 'peaceful', '心地よい'],
  },
  {
    id: 'tired',
    axis: 'mood',
    ja: '疲労',
    en: 'tired',
    synonyms: ['疲れ', 'だるい', '体調不良', '寝不足', 'エネルギー切れ', '消耗', 'low energy', 'exhausted', 'fatigue', 'しんどい'],
  },
  {
    id: 'stressed',
    axis: 'mood',
    ja: 'ストレス',
    en: 'stressed',
    synonyms: ['プレッシャー', '緊張', 'いっぱいいっぱい', 'ピリピリ', '余裕がない', 'stress', 'pressure', '焦り'],
  },
  {
    id: 'anxious',
    axis: 'mood',
    ja: '不安',
    en: 'anxious',
    synonyms: ['心配', 'モヤモヤ', '気がかり', '迷い', '落ち込み', '凹んだ', 'worried', 'uneasy', '気分が沈む'],
  },
  {
    id: 'motivated',
    axis: 'mood',
    ja: '意欲的',
    en: 'motivated',
    synonyms: ['やる気満々', 'チャレンジ', '前のめり', '燃えてる', '集中できた', '挑戦したい', 'driven', 'fired up'],
  },
]

// ─── 参照ヘルパー（D2/D3/D4 がこれを使う）──────────────────────

/**
 * 内部用: T3（journalDb.tagMatchKey）と同じ正規化キーを生成する。
 * 循環 import を避けるためここで同等処理を再現する（NFKC + 先頭 # 剥がし + 空白畳み + 小文字化）。
 * T3 のロジックが変わった場合はここも合わせること。
 */
function vocabKey(raw: string): string {
  return raw
    .normalize('NFKC')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/^[#＃]+/, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

/**
 * synonym 照合キー → CanonicalTag の逆引きマップ。
 * ja / en 本体・全 synonyms・id をキーとして登録する（同義語のどの表記からでも引ける）。
 */
const SYNONYM_INDEX: Map<string, CanonicalTag> = (() => {
  const map = new Map<string, CanonicalTag>()
  for (const tag of CANONICAL_TAGS) {
    const keys = [tag.id, tag.ja, tag.en, ...tag.synonyms]
    for (const k of keys) {
      const key = vocabKey(k)
      if (!key) continue
      // 先勝ち: 同じキーが複数 canonical に被った場合は最初の定義を優先する。
      if (!map.has(key)) map.set(key, tag)
    }
  }
  return map
})()

/** id から CanonicalTag を引く。 */
export function getCanonicalById(id: string): CanonicalTag | undefined {
  return CANONICAL_TAGS.find((t) => t.id === id)
}

/**
 * 入力タグに対応する canonical を返す（語彙にヒットしなければ undefined）。
 * 表記ゆれ・同義語・ja/en どの表記からでも引ける。
 */
export function matchCanonical(raw: string): CanonicalTag | undefined {
  if (!raw) return undefined
  return SYNONYM_INDEX.get(vocabKey(raw))
}

/**
 * オープン＋強い推奨の中核ヘルパー。
 *   - 語彙にヒット → canonical の表示形（locale に応じた ja / en）を返す（名寄せ）。
 *   - ヒットしない → 入力タグをそのまま返す（語彙外タグを許容＝オープン）。
 * D3（既存タグの一括マッピング）・保存時の名寄せから利用する想定。
 */
export function canonicalizeTag(raw: string, locale: 'ja' | 'en' = 'ja'): string {
  const hit = matchCanonical(raw)
  if (!hit) return raw
  return locale === 'en' ? hit.en : hit.ja
}

/** ある軸に属する canonical タグ一覧。 */
export function canonicalsByAxis(axis: TagAxis): CanonicalTag[] {
  return CANONICAL_TAGS.filter((t) => t.axis === axis)
}

/** locale に応じた canonical 表示形の全リスト（推奨語彙の一覧表示用）。 */
export function allCanonicalLabels(locale: 'ja' | 'en' = 'ja'): string[] {
  return CANONICAL_TAGS.map((t) => (locale === 'en' ? t.en : t.ja))
}

/**
 * D2 がプロンプトへ差し込むための「推奨語彙ヒント」テキストを生成する。
 * 軸ごとに canonical 表示形を列挙する。オープン方針なので
 * 「まずこの語彙から選ぶ／無ければ新しい短いタグを作ってよい」という含みで使う想定。
 *
 * 例（ja）:
 *   テーマ: 仕事, 学習, 健康, ...
 *   行動: 会議・打ち合わせ, 集中作業, ...
 *   状況: 締切, 多忙, ...
 *   気分: 前向き, 穏やか, ...
 */
export function buildVocabularyPromptHint(locale: 'ja' | 'en' = 'ja'): string {
  return TAG_AXES.map((axis) => {
    const label = locale === 'en' ? TAG_AXIS_LABELS[axis].en : TAG_AXIS_LABELS[axis].ja
    const words = canonicalsByAxis(axis).map((t) => (locale === 'en' ? t.en : t.ja))
    const sep = locale === 'en' ? ', ' : '、'
    return `${label}: ${words.join(sep)}`
  }).join('\n')
}
