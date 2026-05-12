// fermiData.ts — フェルミ問題プール（ホーム・DailyFermiScreen共通）
// ビジネス系 × ちょっと面白い系に厳選
//
// 28問の question / hint と対応する FERMI_STATS を ja / en で持つ。
// 起動時の getLocale() で FERMI_POOL / FERMI_STATS が決まる。

import { getLocale } from './i18n'

export type FermiQuestion = {
  question: string
  hint: string
}

const FERMI_POOL_JA: FermiQuestion[] = [
  // ── 王道ビジネス：市場規模・売上 ──
  { question: '日本国内のSaaS市場の年間売上規模は何円か？', hint: '日本の法人数×SaaS導入率×1社あたり年間支出で分解。中小と大企業で支出額が大きく違う。' },
  { question: '日本のスタバ全店舗が1日に売り上げる総額は何円か？', hint: '店舗数×1店舗の客数×客単価で分解。営業時間と回転率も意識しよう。' },
  { question: '居酒屋チェーン（300店舗規模）の1日の総売上は何円か？', hint: '1店舗の席数×回転率×客単価×店舗数で計算。平日と週末の違いも意識。' },
  { question: '日本のEC市場の年間流通総額（GMV）は何円か？', hint: 'ネット利用人口×EC利用率×1人あたり年間EC支出で分解。物販以外（旅行・チケット）も忘れずに。' },
  { question: '日本国内で年間に成立しているM&Aは何件か？', hint: '上場企業の戦略案件＋中小企業の事業承継案件で分解。後継者不在問題の規模感がカギ。' },

  // ── ビジネスコスト・オペレーション ──
  { question: '従業員50人の中小企業の年間オフィス賃料は何円か？', hint: '1人あたり必要面積×坪単価×12ヶ月で計算。都心と郊外で大きく異なる。' },
  { question: '大手コンサルファームが日本で年間に受注するプロジェクト数は？', hint: '従業員数÷1プロジェクトあたり人数×年間プロジェクト回転数で考えよう。' },

  // ── ビジネスあるある（面白い系） ──
  { question: '日本の会社員が1年間に押すハンコの総数は？', hint: '労働力人口×ホワイトカラー比率×1人/日のハンコ回数×年間営業日で分解。電子化進行率も差し引こう。' },
  { question: '日本のビジネスパーソンが1日に発する「お疲れ様です」の総回数は？', hint: '労働力人口×1人/日の発話回数で分解。挨拶・退勤・メール冒頭・チャット冒頭…と場面別に数えよう。' },
  { question: '日本の社内チャット（Slack/Teams等）で1日に送られる「了解です／承知しました」の総回数は？', hint: 'ビジネスチャット利用者数×1人/日の送信メッセージ数×「了解系」の比率で分解。' },
  { question: '日本のオフィスで1日に淹れられるコーヒーの総杯数は？', hint: 'ホワイトカラー人口×1人/日のオフィスコーヒー杯数で分解。コーヒーマシン＋カフェ持込みの両方を含めよう。' },
  { question: 'オンライン会議で1日に発される「マイクミュートになってます」の全国総回数は？', hint: '1日のオンライン会議件数×1会議でこの事故が起きる確率で分解。在宅・ハイブリッド勤務の浸透度も考えよう。' },
  { question: '日本の経費精算で1年間に申請される領収書の総枚数は？', hint: 'ホワイトカラー人口×1人/月の領収書枚数×12ヶ月で分解。営業職と内勤で枚数差が大きい。' },
  { question: '日本中の名刺ホルダーに眠っている「もう使わない」名刺の総枚数は？', hint: '労働力人口×営業職比率×営業1人の生涯獲得名刺枚数で分解。退職や部署異動で「眠る」割合も考えよう。' },

  // ── コンサルケース面接の定番（市場規模推定） ──
  { question: '日本のゴルフ市場の年間規模は何円か？', hint: 'ゴルフ人口×年間プレー回数×1ラウンドあたり費用（プレー代＋用品＋飲食）で分解。年代別の参加率の偏りも意識しよう。' },
  { question: '日本のペットフード市場の年間規模は何円か？', hint: '国内の犬・猫の飼育頭数×1頭あたり年間フード支出で分解。犬と猫で支出単価が違う点にも注意。' },
  { question: '東京都内のフィットネスジムの会員数は何人か？', hint: '東京都の人口×年代別ジム加入率で分解。20〜40代の都市労働者がコア層、シニア向けジムも忘れずに。' },
  { question: '日本の年間結婚式市場の規模は何円か？', hint: '年間婚姻組数×結婚式実施率×1組あたり披露宴費用で分解。「ナシ婚」を差し引くのがポイント。' },
  { question: '日本のオンライン広告市場の年間規模は何円か？', hint: '日本の総広告費（GDPの約1〜1.2%）×デジタル広告比率で考える。検索＋ディスプレイ＋動画＋SNSの構成も意識。' },
  { question: '日本のメガネ市場の年間規模は何円か？', hint: '人口×視力矯正必要率÷平均買い替え周期×1本あたり価格で分解。コンタクトレンズとの代替関係にも注意。' },
  { question: '日本の宅配便の年間取扱個数は何個か？', hint: '個人受取＋BtoB物流に分けて、人口×1人あたり年間受取数＋法人物流量で考える。EC化率の上昇も意識。' },
  { question: '日本のサブスク動画配信（Netflix/Prime Video等）市場の年間規模は何円か？', hint: '世帯数×SVOD加入率×1世帯あたり契約サービス数×月額×12ヶ月で分解。複数併用が一般的な点もポイント。' },
  { question: '日本のドラッグストア業界の年間総売上は何円か？', hint: '全国店舗数×1店舗の1日売上×営業日数で分解。化粧品・食品・医薬品の構成比で1店舗単価をチェック。' },
  { question: '日本のプロ野球（NPB）の年間観客動員数は何人か？', hint: '12球団×1球団のホーム試合数×1試合の平均観客（球場収容人数×稼働率）で分解。' },
]

const FERMI_POOL_EN: FermiQuestion[] = [
  // ── Classic business: market size / revenue ──
  { question: 'What is the annual revenue size of the SaaS market in Japan (JPY)?', hint: 'Break down as: number of companies × SaaS adoption rate × annual spend per company. SMB and enterprise spend differ greatly.' },
  { question: 'What is the total daily revenue of all Starbucks stores in Japan (JPY)?', hint: 'Break down as: number of stores × customers per store × spend per customer. Consider operating hours and turnover.' },
  { question: 'What is the daily total revenue of a 300-store izakaya chain (JPY)?', hint: 'Compute as: seats per store × turnover × spend per customer × number of stores. Mind weekday vs weekend.' },
  { question: 'What is the annual GMV of the EC market in Japan (JPY)?', hint: 'Break down as: internet users × EC usage rate × annual EC spend per person. Include travel and tickets, not just goods.' },
  { question: 'How many M&A deals are closed annually in Japan?', hint: 'Split into strategic deals at listed firms + succession deals at SMBs. The successor-shortage problem is the key scale driver.' },

  // ── Business cost / operations ──
  { question: 'What is the annual office rent for a 50-person SMB in Japan (JPY)?', hint: 'Compute as: floor area per person × rent per tsubo × 12 months. Central Tokyo and suburbs differ widely.' },
  { question: 'How many projects do major consulting firms win annually in Japan?', hint: 'Think: headcount ÷ people per project × number of project cycles per year.' },

  // ── Quirky business observations ──
  { question: 'How many hanko (stamps) do Japanese office workers press in a year nationwide?', hint: 'Break down as: workforce × white-collar ratio × stamps per person per day × working days per year. Subtract digitization progress.' },
  { question: 'How many times per day is "otsukaresama desu" uttered by Japanese business people in total?', hint: 'Workforce × utterances per person per day. Count by scene: greetings, signing off, email openings, chat openings…' },
  { question: 'How many "ryōkai desu / shōchi shimashita" (acknowledgment) messages are sent in business chat (Slack/Teams etc.) per day in Japan?', hint: 'Business-chat users × messages per person per day × ratio that are acknowledgments.' },
  { question: 'How many cups of coffee are brewed daily in Japanese offices?', hint: 'White-collar population × cups per person per day at the office. Include both coffee machines and café take-ins.' },
  { question: 'How many times per day, nationwide, does someone say "your mic is on mute" in online meetings?', hint: 'Daily online meetings × probability that this happens per meeting. Factor in remote/hybrid penetration.' },
  { question: 'How many receipts are filed through expense reports annually in Japan?', hint: 'White-collar population × receipts per person per month × 12 months. Sales roles file far more than back-office.' },
  { question: 'How many "no-longer-needed" business cards sit unused in business-card holders across Japan?', hint: 'Workforce × sales-role ratio × lifetime cards collected per salesperson. Adjust for cards that "go to sleep" when people change roles or retire.' },

  // ── Consulting case-interview staples (market sizing) ──
  { question: 'What is the annual size of the golf market in Japan (JPY)?', hint: 'Golf population × rounds per year × cost per round (greens fee + equipment + food). Mind the skew across age groups.' },
  { question: 'What is the annual size of the pet food market in Japan (JPY)?', hint: 'Dogs and cats owned × annual food spend per animal. Per-animal spend differs between dogs and cats.' },
  { question: 'How many fitness gym members are there in Tokyo?', hint: 'Tokyo population × age-group gym membership rates. Urban workers in their 20s–40s are the core; don\'t forget senior gyms.' },
  { question: 'What is the annual size of the wedding market in Japan (JPY)?', hint: 'Annual marriages × ceremony rate × reception cost per couple. Subtracting "no-ceremony" couples is the key.' },
  { question: 'What is the annual size of the online advertising market in Japan (JPY)?', hint: 'Total ad spend (~1–1.2% of GDP) × digital share. Mind the mix: search + display + video + social.' },
  { question: 'What is the annual size of the eyewear market in Japan (JPY)?', hint: 'Population × vision-correction rate ÷ average replacement cycle × price per pair. Watch substitution with contact lenses.' },
  { question: 'How many parcels does the delivery industry handle annually in Japan?', hint: 'Split into consumer receipts + BtoB logistics: population × parcels per person per year + business volume. Mind the rise in EC penetration.' },
  { question: 'What is the annual size of the subscription video market (Netflix, Prime Video, etc.) in Japan (JPY)?', hint: 'Households × SVOD adoption × services subscribed per household × monthly fee × 12 months. Multi-subscription is common.' },
  { question: 'What is the annual total revenue of the drugstore industry in Japan (JPY)?', hint: 'Number of stores × daily sales per store × operating days. Check per-store mix of cosmetics, food, and OTC drugs.' },
  { question: 'What is the annual attendance at Japan\'s professional baseball (NPB) games?', hint: '12 teams × home games per team × average attendance per game (stadium capacity × utilization).' },
]

export const FERMI_POOL: FermiQuestion[] = getLocale() === 'en' ? FERMI_POOL_EN : FERMI_POOL_JA

/** 今日の問題インデックス（日付ベース・全画面共通） */
export function getDailyFermiIndex(): number {
  return Math.floor(Date.now() / 86400000) % FERMI_POOL.length
}

/** 今日の問題を返す */
export function getDailyFermi(): FermiQuestion {
  return FERMI_POOL[getDailyFermiIndex()]
}

// 問題ごとの参考データ（最小限・問題に直結するものだけ）
export type FermiStat = { label: string; value: string }

const FERMI_STATS_JA: FermiStat[][] = [
  // 0: SaaS市場規模
  [{ label: '日本の法人数', value: '約400万社' }, { label: 'SaaS導入率（参考）', value: '約30〜50%' }, { label: '1社あたりSaaS年間支出（参考）', value: '約10万〜500万円' }],
  // 1: スタバ全店舗の1日売上
  [{ label: '日本のスタバ店舗数', value: '約1,900店' }, { label: '客単価（参考）', value: '約700円' }, { label: '1店舗の1日客数（参考）', value: '約500〜800人' }],
  // 2: 居酒屋チェーン300店舗の1日売上
  [{ label: '居酒屋平均席数（参考）', value: '約60〜80席' }, { label: '客単価（参考）', value: '約3,000〜4,500円' }, { label: '1日の回転数（参考）', value: '約1.5〜2.5回' }],
  // 3: EC市場GMV
  [{ label: '日本のネット利用人口', value: '約1億人' }, { label: 'EC利用率（参考）', value: '約75%' }, { label: '1人あたり年間EC支出（参考）', value: '約15万円' }],
  // 4: M&A年間件数
  [{ label: '日本の法人数', value: '約400万社' }, { label: '中小企業の後継者不在率（参考）', value: '約60%' }, { label: '上場企業数', value: '約4,000社' }],
  // 5: 中小企業のオフィス賃料
  [{ label: '1人あたり必要面積', value: '約3〜5坪' }, { label: '都心オフィス坪単価（月）', value: '約2〜3万円' }, { label: '郊外オフィス坪単価（月）', value: '約1万円' }],
  // 6: コンサルプロジェクト数
  [{ label: '大手コンサル従業員数（参考）', value: '約2,000〜5,000人/社' }, { label: '1プロジェクトあたり人数', value: '約3〜10人' }, { label: '年間稼働プロジェクト/人（参考）', value: '約3〜5本' }],
  // 7: ハンコの総数
  [{ label: '労働力人口', value: '約6,900万人' }, { label: 'ホワイトカラー比率（参考）', value: '約50%' }, { label: '1人/日のハンコ回数（参考）', value: '約3〜10回' }, { label: '年間営業日', value: '約240日' }],
  // 8: 「お疲れ様です」の発話回数
  [{ label: '労働力人口', value: '約6,900万人' }, { label: '1人/日の発話回数（対面＋メール＋チャット, 参考）', value: '約10〜30回' }],
  // 9: 「了解です」のチャット送信数
  [{ label: '国内ビジネスチャット利用者（参考）', value: '約2,000万人' }, { label: '1人/日の送信メッセージ数（参考）', value: '約30〜50件' }, { label: '「了解系」の比率（参考）', value: '約10%' }],
  // 10: オフィスコーヒー杯数
  [{ label: 'ホワイトカラー人口（参考）', value: '約3,500万人' }, { label: '1人/日のコーヒー杯数（参考）', value: '約2〜3杯' }, { label: 'オフィスで飲む比率（参考）', value: '約60%' }],
  // 11: Zoom「マイクミュート」回数
  [{ label: 'ホワイトカラー人口（参考）', value: '約3,500万人' }, { label: '1人/日のオンライン会議数（参考）', value: '約2〜4件' }, { label: 'ミュート事故発生率（参考）', value: '約20〜30%' }],
  // 12: 経費精算の領収書枚数
  [{ label: 'ホワイトカラー人口（参考）', value: '約3,500万人' }, { label: '1人/月の領収書枚数（参考）', value: '約5〜20枚' }, { label: '集計期間', value: '12ヶ月' }],
  // 13: 名刺ホルダーに眠る名刺
  [{ label: '労働力人口', value: '約6,900万人' }, { label: '営業職比率（参考）', value: '約8〜10%' }, { label: '営業1人の生涯獲得名刺（参考）', value: '約3,000〜5,000枚' }],
  // 14: ゴルフ市場
  [{ label: '日本のゴルフ人口（参考）', value: '約500〜600万人' }, { label: '1人/年プレー回数（参考）', value: '約8〜12回' }, { label: '1ラウンドの費用（参考）', value: '約1〜3万円' }],
  // 15: ペットフード市場
  [{ label: '国内の犬の飼育頭数', value: '約700万匹' }, { label: '国内の猫の飼育頭数', value: '約900万匹' }, { label: '1頭あたり年間フード支出（参考）', value: '約2〜4万円' }],
  // 16: 東京都内ジム会員数
  [{ label: '東京都の人口', value: '約1,400万人' }, { label: '20〜40代比率（参考）', value: '約35%' }, { label: '同年代のジム加入率（参考）', value: '約10〜15%' }],
  // 17: 結婚式市場
  [{ label: '日本の年間婚姻数', value: '約50万組' }, { label: '結婚式実施率（参考）', value: '約60〜70%' }, { label: '1組あたり費用（参考）', value: '約300〜400万円' }],
  // 18: オンライン広告市場
  [{ label: '日本の総広告費（参考）', value: '約7兆円' }, { label: 'デジタル広告比率（参考）', value: '約45〜50%' }, { label: '内訳', value: '検索＋ディスプレイ＋動画＋SNS' }],
  // 19: メガネ市場
  [{ label: '日本の人口', value: '約1.24億人' }, { label: '視力矯正必要率（参考）', value: '約60%' }, { label: 'メガネ買い替え周期（参考）', value: '約3〜4年' }, { label: '1本あたり価格（参考）', value: '約2万円' }],
  // 20: 宅配便取扱個数
  [{ label: '日本の人口', value: '約1.24億人' }, { label: '1人/年の個人受取数（参考）', value: '約30〜40個' }, { label: 'BtoB物流の比率', value: '個人向けと同程度〜やや少' }],
  // 21: SVOD（動画サブスク）市場
  [{ label: '日本の世帯数', value: '約5,700万世帯' }, { label: 'SVOD加入率（参考）', value: '約40%' }, { label: '1世帯の平均契約サービス数（参考）', value: '約1.5〜2' }, { label: '月額（参考）', value: '約1,000円' }],
  // 22: ドラッグストア業界売上
  [{ label: '日本のドラッグストア店舗数', value: '約2.3万店' }, { label: '1店舗の1日売上（参考）', value: '約80〜120万円' }, { label: '営業日（参考）', value: '約350日' }],
  // 23: プロ野球年間観客動員数
  [{ label: 'NPB球団数', value: '12球団' }, { label: '1球団のホーム試合数（参考）', value: '約70試合' }, { label: '1試合あたり平均観客（参考）', value: '約3万人' }],
]

const FERMI_STATS_EN: FermiStat[][] = [
  // 0: SaaS market
  [{ label: 'Companies in Japan', value: '~4 million' }, { label: 'SaaS adoption rate (ref.)', value: '~30–50%' }, { label: 'Annual SaaS spend per company (ref.)', value: '~¥100K–5M' }],
  // 1: Starbucks daily revenue
  [{ label: 'Starbucks stores in Japan', value: '~1,900' }, { label: 'Spend per customer (ref.)', value: '~¥700' }, { label: 'Customers per store per day (ref.)', value: '~500–800' }],
  // 2: Izakaya chain daily revenue
  [{ label: 'Seats per izakaya (ref.)', value: '~60–80' }, { label: 'Spend per customer (ref.)', value: '~¥3,000–4,500' }, { label: 'Daily turnover (ref.)', value: '~1.5–2.5×' }],
  // 3: EC GMV
  [{ label: 'Internet users in Japan', value: '~100 million' }, { label: 'EC usage rate (ref.)', value: '~75%' }, { label: 'Annual EC spend per person (ref.)', value: '~¥150,000' }],
  // 4: M&A annual count
  [{ label: 'Companies in Japan', value: '~4 million' }, { label: 'SMB successor-shortage rate (ref.)', value: '~60%' }, { label: 'Listed companies', value: '~4,000' }],
  // 5: SMB office rent
  [{ label: 'Floor area per person', value: '~3–5 tsubo' }, { label: 'Central Tokyo rent per tsubo (monthly)', value: '~¥20K–30K' }, { label: 'Suburban rent per tsubo (monthly)', value: '~¥10K' }],
  // 6: Consulting projects
  [{ label: 'Headcount at major consulting firms (ref.)', value: '~2,000–5,000 / firm' }, { label: 'People per project', value: '~3–10' }, { label: 'Projects per person per year (ref.)', value: '~3–5' }],
  // 7: Hanko stamps
  [{ label: 'Workforce', value: '~69 million' }, { label: 'White-collar ratio (ref.)', value: '~50%' }, { label: 'Stamps per person per day (ref.)', value: '~3–10' }, { label: 'Working days per year', value: '~240' }],
  // 8: "Otsukaresama" utterances
  [{ label: 'Workforce', value: '~69 million' }, { label: 'Utterances per person per day (in-person + email + chat, ref.)', value: '~10–30' }],
  // 9: "Ryōkai" chat messages
  [{ label: 'Business chat users in Japan (ref.)', value: '~20 million' }, { label: 'Messages per person per day (ref.)', value: '~30–50' }, { label: 'Acknowledgment ratio (ref.)', value: '~10%' }],
  // 10: Office coffee cups
  [{ label: 'White-collar population (ref.)', value: '~35 million' }, { label: 'Cups per person per day (ref.)', value: '~2–3' }, { label: 'Share drunk at office (ref.)', value: '~60%' }],
  // 11: "Mic is muted" moments
  [{ label: 'White-collar population (ref.)', value: '~35 million' }, { label: 'Online meetings per person per day (ref.)', value: '~2–4' }, { label: 'Mute-incident probability (ref.)', value: '~20–30%' }],
  // 12: Expense report receipts
  [{ label: 'White-collar population (ref.)', value: '~35 million' }, { label: 'Receipts per person per month (ref.)', value: '~5–20' }, { label: 'Period', value: '12 months' }],
  // 13: Dormant business cards
  [{ label: 'Workforce', value: '~69 million' }, { label: 'Sales role ratio (ref.)', value: '~8–10%' }, { label: 'Lifetime cards per salesperson (ref.)', value: '~3,000–5,000' }],
  // 14: Golf market
  [{ label: 'Golf population in Japan (ref.)', value: '~5–6 million' }, { label: 'Rounds per year (ref.)', value: '~8–12' }, { label: 'Cost per round (ref.)', value: '~¥10K–30K' }],
  // 15: Pet food market
  [{ label: 'Dogs in Japan', value: '~7 million' }, { label: 'Cats in Japan', value: '~9 million' }, { label: 'Annual food spend per animal (ref.)', value: '~¥20K–40K' }],
  // 16: Tokyo gym members
  [{ label: 'Tokyo population', value: '~14 million' }, { label: 'Share aged 20–40s (ref.)', value: '~35%' }, { label: 'Gym membership in that age group (ref.)', value: '~10–15%' }],
  // 17: Wedding market
  [{ label: 'Annual marriages in Japan', value: '~500K' }, { label: 'Ceremony rate (ref.)', value: '~60–70%' }, { label: 'Cost per couple (ref.)', value: '~¥3–4 million' }],
  // 18: Online ad market
  [{ label: 'Total ad spend in Japan (ref.)', value: '~¥7 trillion' }, { label: 'Digital share (ref.)', value: '~45–50%' }, { label: 'Mix', value: 'Search + display + video + social' }],
  // 19: Eyewear market
  [{ label: 'Japan population', value: '~124 million' }, { label: 'Vision-correction rate (ref.)', value: '~60%' }, { label: 'Replacement cycle (ref.)', value: '~3–4 years' }, { label: 'Price per pair (ref.)', value: '~¥20,000' }],
  // 20: Parcel deliveries
  [{ label: 'Japan population', value: '~124 million' }, { label: 'Personal parcels per person per year (ref.)', value: '~30–40' }, { label: 'BtoB logistics share', value: 'Similar to or slightly less than consumer' }],
  // 21: SVOD market
  [{ label: 'Households in Japan', value: '~57 million' }, { label: 'SVOD adoption (ref.)', value: '~40%' }, { label: 'Services per household (ref.)', value: '~1.5–2' }, { label: 'Monthly fee (ref.)', value: '~¥1,000' }],
  // 22: Drugstore industry
  [{ label: 'Drugstore count in Japan', value: '~23,000' }, { label: 'Daily sales per store (ref.)', value: '~¥800K–1.2M' }, { label: 'Operating days (ref.)', value: '~350' }],
  // 23: NPB attendance
  [{ label: 'NPB teams', value: '12 teams' }, { label: 'Home games per team (ref.)', value: '~70' }, { label: 'Avg attendance per game (ref.)', value: '~30,000' }],
]

export const FERMI_STATS: FermiStat[][] = getLocale() === 'en' ? FERMI_STATS_EN : FERMI_STATS_JA

/** 指定インデックスの問題に対応した参考データを返す */
export function getFermiStatsByIndex(index: number): FermiStat[] {
  return FERMI_STATS[index] ?? []
}

/** 今日の問題に対応した参考データを返す */
export function getDailyFermiStats(): FermiStat[] {
  return getFermiStatsByIndex(getDailyFermiIndex())
}
