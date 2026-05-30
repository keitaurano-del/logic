// fermiData.ts — フェルミ問題プール（ホーム・DailyFermiScreen共通）
// ビジネス系 × ちょっと面白い系に厳選
//
// 50問の question / hint と対応する FERMI_STATS を ja / en で持つ。
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

  // ── 追加: 業界規模・市場サイズ ──
  { question: '日本のラーメン店の年間総売上は何円か？', hint: '店舗数×1店舗の1日売上×営業日数で分解。家系・二郎系・ファミリー向けで客単価差が大きい。' },
  { question: '日本のコンビニ大手3社の1日合計売上は何円か？', hint: '3社の合計店舗数×1店舗の1日売上で分解。立地（駅前・郊外・オフィス街）で売上が大きく異なる。' },
  { question: '日本のタクシー業界の年間総売上は何円か？', hint: '全国タクシー台数×1台の1日売上×稼働日数で分解。都市部と地方で稼働率・運賃に差。' },
  { question: '日本のカラオケ市場の年間規模は何円か？', hint: '店舗数×1店舗の1日売上×営業日数で分解。コロナ後の回復度合いも意識。' },
  { question: '日本の漫画市場（紙＋電子）の年間規模は何円か？', hint: '紙の単行本＋雑誌＋電子書籍ストアでの売上に分解。電子比率が年々上昇している。' },
  { question: '日本のスマホゲーム業界の年間売上は何円か？', hint: 'アクティブユーザー数×課金率×ARPPU（課金者あたり平均額）×12ヶ月で分解。重課金者の偏りも考慮。' },
  { question: '日本の保険業界の年間総保険料収入は何円か？', hint: '生保＋損保で分けて、世帯加入率×世帯あたり保険料で分解。生保は加入率が非常に高い。' },
  { question: '日本の中古車市場の年間流通台数は何台か？', hint: '国内自家用車保有台数×平均買い替え周期で年間取引量を概算。' },
  { question: '日本の宅配ピザ業界の年間総売上は何円か？', hint: '店舗数×1店舗の1日注文数×客単価×営業日数で分解。週末・イベント日の偏りに注意。' },
  { question: '日本のスマートフォン年間出荷台数は何台か？', hint: '人口×スマホ保有率÷平均買い替え周期で分解。法人需要も含めよう。' },
  { question: '日本のレンタカー業界の年間総売上は何円か？', hint: '保有車両台数×1日あたり稼働率×平均単価×365日で分解。観光地は稼働率が高い。' },
  { question: '日本の自販機の年間総売上は何円か？', hint: '全国自販機台数×1台の1日売上×365日で分解。飲料・たばこ・食品の構成比に注意。' },
  { question: '日本の通信費（携帯＋固定）の年間総支出は何円か？', hint: '世帯数×世帯あたり通信費×12ヶ月＋法人需要で分解。MNO/MVNOで料金差が大きい。' },
  { question: '日本の英会話スクール業界の年間総売上は何円か？', hint: '通学＋オンラインに分けて、受講者数×1人あたり年間支出で分解。子供向け・大人向けで単価差。' },
  { question: '日本のスーパー銭湯・温泉施設の年間総入場者数は何人か？', hint: '施設数×1施設の1日来場者×営業日数で分解。週末・連休の集中も考慮。' },
  { question: '日本の不動産仲介業界の年間総売上は何円か？', hint: '年間住宅取引件数×平均仲介手数料（売買価格の3%程度）で分解。賃貸仲介の規模も忘れずに。' },
  { question: '日本の電子書籍市場の年間規模は何円か？', hint: '読者人口×電子書籍利用率×1人あたり年間支出で分解。コミック比率が圧倒的に高い。' },
  { question: '日本のスマートウォッチの年間出荷台数は何台か？', hint: '20〜50代人口×スマートウォッチ保有率÷平均買い替え周期で分解。Apple Watch のシェアが大きい。' },
  { question: '日本のホテル業界（ビジネス＋シティ）の年間客室稼働数は何室泊か？', hint: '全国客室数×稼働率×365日で分解。観光需要とビジネス需要の比率に注意。' },

  // ── 追加: ビジネスあるある（面白い系） ──
  { question: '日本の会社員が1年間にコピー機の前で待つ総時間は何時間か？', hint: 'ホワイトカラー人口×1人/週のコピー回数×1回あたり待ち時間で分解。複合機の前の小さな"行列"も意識。' },
  { question: '日本の社内メールで1日に書かれる「お世話になっております」の総回数は？', hint: 'ビジネスメール送信者数×1人/日のメール送信数×冒頭挨拶率で分解。' },
  { question: '全国のオフィス会議室で1日に起きる「先方の都合で時間変更」の件数は？', hint: 'BtoB会議の1日件数×変更発生率で分解。リスケ多発業界（コンサル・営業）の比率も意識。' },
  { question: '日本のオフィスで1日に印刷される紙の総枚数は？', hint: 'ホワイトカラー人口×1人/日の印刷枚数で分解。ペーパーレス化進行率（業界差）も差し引こう。' },
  { question: '日本の年賀状の年間発送枚数は何枚か？', hint: '世帯数×世帯あたり発送枚数で分解。年々減少傾向（デジタル化）も考慮。' },
  { question: '日本の会社員が1年間に押す「Enterキー」の総回数は？', hint: 'PCワーカー人口×1人/日のEnter回数（メール送信＋検索＋コード実行など）×営業日で分解。' },
  { question: '日本の駅で1日に飲まれる自販機コーヒーの缶・ペットボトル本数は？', hint: '全国駅数×1駅の自販機台数×1台/日の販売本数のうちコーヒーの比率で分解。' },
]

const FERMI_POOL_EN: FermiQuestion[] = [
  // F19: global-topic pool (en). Approved & audited 50 questions (basic10/standard23/advanced17).
  // Source: scripts/dogfood/f19_final.json. Globalized to US / world figures (no JP-only topics, no ¥).
  { question: 'What is the annual revenue (USD) of the coffee-chain café market in the United States?', hint: 'Start from US adults who buy café coffee, multiply by visits per week and spend per visit, then annualize. Coffee drinkers vs. chain buyers is the first split.' },
  { question: 'How many ride-hailing drivers are actively on the road at 6pm on a typical weekday across the United States?', hint: 'Estimate concurrent ride demand (rides happening at once) from daily rides ÷ active hours, then convert to drivers using utilization. Demand-side first, then supply.' },
  { question: 'What is the annual revenue (USD) of a single busy urban fast-food restaurant?', hint: 'Build from transactions per hour during peak and off-peak, average ticket, and operating hours per day, then annualize over operating days.' },
  { question: 'What is the annual revenue (USD) of the haircut and salon services market in the United States, estimated both top-down and bottom-up?', hint: 'Bottom-up: people × cuts/year × price. Top-down: number of salons × revenue per salon. Reconcile the two and explain the gap.' },
  { question: 'What is the annual revenue (USD) of the pet food market in the United States?', hint: 'Households with pets × pets per household × annual food spend per pet. Split dogs vs. cats since spend per animal differs.' },
  { question: 'How many people are watching a major video-streaming platform (e.g., a Netflix-scale service) simultaneously during global prime time?', hint: 'Start from subscriber base, daily active share, average daily watch time, then convert to concurrency at the global peak hour accounting for time zones.' },
  { question: 'How many gallons of gasoline are sold for passenger vehicles in the United States per year?', hint: 'Vehicles × annual miles driven × average fuel economy (miles per gallon). Use passenger cars/light trucks only.' },
  { question: 'What is the annual revenue (USD) of a single 120-room mid-scale hotel running at typical occupancy?', hint: 'Rooms × occupancy × average daily rate × 365 for room revenue, then add a markup for food/beverage and other services.' },
  { question: 'How many smartphones are sold worldwide per year, estimated top-down and bottom-up?', hint: 'Bottom-up: installed base ÷ replacement cycle + new first-time buyers. Top-down: regional populations × penetration × turnover. Reconcile.' },
  { question: 'How many food-delivery orders are placed through apps in the United States on a typical Friday evening (5–9pm)?', hint: 'Estimate ordering households in metros, the share that orders delivery on a peak Friday, and confine it to the 4-hour dinner window.' },
  { question: 'How many disposable diapers are used in the United States per year?', hint: 'Number of children still in diapers × diaper changes per day × 365. Anchor on births per year and the years a child stays in diapers.' },
  { question: 'What annual recurring revenue (USD) does a B2B SaaS startup reach 3 years after launch if it adds 200 paying customers per month at 2% monthly churn?', hint: 'Track the customer base month over month: additions minus churn compound into a partially-saturated base, then multiply by annual revenue per customer.' },
  { question: 'How many airline passenger seats are sold (passenger boardings) worldwide per year?', hint: 'Start from annual passengers (trips, not unique people), or build from aircraft fleet × seats × flights/day × load factor. Cross-check the two.' },
  { question: 'How many messages are sent across the world\'s largest messaging platform during its single busiest minute of the year?', hint: 'Annual or daily message volume → average per second, then apply a peak multiplier for an event (e.g., New Year) when many time zones celebrate at once.' },
  { question: 'What is the total annual residential electricity consumption (kWh) in the United States, via household and via per-capita routes?', hint: 'Route A: households × kWh per household per year. Route B: population × per-capita residential kWh. Reconcile and note what differs.' },
  { question: 'What is the annual retail revenue (USD) of the global chocolate market?', hint: 'Population in chocolate-consuming regions × kg consumed per person per year × retail price per kg. Weight consumption heavily toward wealthier regions.' },
  { question: 'What is the annual revenue (USD) of a single mid-size commercial fitness gym, and how many members visit per day?', hint: 'Revenue = members × monthly dues × 12, plus add-ons. Daily visits = members × the fraction who actually show up on an average day.' },
  { question: 'How many short-term-rental (e.g., Airbnb-style) listings are occupied on a peak summer Saturday night in the United States?', hint: 'Estimate total active US listings, then apply a high-season Saturday occupancy rate. Active supply first, then utilization.' },
  { question: 'How many cups of coffee (all sources: home, office, café) are consumed in the United States per day?', hint: 'Coffee-drinking adults × cups per drinker per day. Anchor on the share of adults who drink coffee and typical daily cups.' },
  { question: 'What is the annual global revenue (USD) of the mobile-games market, via player route and via top-down app-store route?', hint: 'Player route: players × paying-user rate × annual spend per payer. Top-down: total consumer app-store spend × games share. Reconcile.' },
  { question: 'What is the annual revenue (USD) of a single large suburban supermarket?', hint: 'Transactions per day (customers through checkout) × average basket size × operating days. Build the customer count from peak and off-peak flow.' },
  { question: 'How many new passenger cars and light trucks are sold in the United States per year?', hint: 'Installed fleet ÷ average vehicle lifespan gives the replacement rate; add modest fleet growth. Anchor on total registered vehicles and how long they last.' },
  { question: 'How many search queries per second does the world\'s largest search engine handle at its global peak?', hint: 'Annual or daily query volume → average queries per second, then apply a modest peak factor since global usage smooths across time zones.' },
  { question: 'What is the annual global box-office revenue (USD) for cinema?', hint: 'Cinema-going population × tickets per person per year × average ticket price, weighted toward regions with strong theater habits.' },
  { question: 'What is the annual revenue (USD) of a single 8-stall EV fast-charging station at a busy highway location, and what stall utilization does that imply?', hint: 'Sessions/stall/day from operating hours, session length and utilization × energy or price per session × 365. Then sanity-check the implied utilization.' },
  { question: 'How many pizzas are sold worldwide in a single day?', hint: 'Start from the major pizza-eating regions (US + Europe as the core), estimate slices or pies per person per week, then convert to a daily, global figure. The US alone is a useful anchor before scaling out.' },
  { question: 'How many personal computers (desktops + laptops) are shipped worldwide in one year?', hint: 'Work from the global installed base of PCs and an average replacement cycle, which is longer than for phones. Annual shipments roughly equal the active base divided by the replacement period, plus modest first-time demand.' },
  { question: 'How many cigarettes are consumed worldwide in one year?', hint: 'Estimate the global adult smoking population, then multiply by an average number of cigarettes per smoker per day and annualize. Smoking prevalence varies sharply by region.' },
  { question: 'What is the cumulative number of solar panels (PV modules) ever installed worldwide?', hint: 'Convert total installed solar capacity (in gigawatts) into module count using an average wattage per panel. Cumulative capacity, not annual additions, is what you want here.' },
  { question: 'How many shipping containers (TEU) cross the world\'s oceans each year?', hint: 'Anchor on global container port throughput, then recognize that each box is handled multiple times (load, transship, unload) so port moves overstate unique voyages. Reason from trade volume per capita as a cross-check.' },
  { question: 'What is the global annual revenue of the bottled-water industry (USD)?', hint: 'Multiply the drinking population by liters of bottled water consumed per person per year by an average price per liter. Developed markets drive both volume and price.' },
  { question: 'How many metric tons of air cargo are transported worldwide in one year?', hint: 'Anchor on global air-freight tonne-kilometers, or build from world population times an average kg of air-freighted goods per person per year. Recognize air cargo is a small but high-value slice of total freight.' },
  { question: 'What is the total cost of running the world\'s data centers in electricity per year (USD)?', hint: 'Combine global data-center electricity consumption (in terawatt-hours) with an average industrial electricity price per kWh. Energy use is the dominant operating cost lever.' },
  { question: 'How many pairs of shoes are manufactured worldwide in one year?', hint: 'Use world population times an average number of new pairs bought per person per year, recognizing rich and poor regions differ several-fold in purchase rate.' },
  { question: 'What is the cumulative number of automobiles (passenger cars) on the road worldwide today?', hint: 'Combine regional vehicle-ownership rates (cars per 1,000 people) with population for high-, middle-, and low-ownership regions, then sum the fleets.' },
  { question: 'How many emails are sent worldwide in a single day?', hint: 'Multiply the number of email users by average emails sent per user per day, but remember a large share of total volume is automated and spam, not human-typed.' },
  { question: 'What is the global annual revenue of the fast-food (quick-service restaurant) industry (USD)?', hint: 'Estimate the world\'s regular fast-food customers, visits per person per year, and average ticket size. Developed markets dominate spend even where developing markets dominate headcount.' },
  { question: 'How many barrels of oil does the world consume in a single day?', hint: 'Anchor on world population and a weighted per-capita oil consumption, recognizing the US consumes far more per person than the global average. Cross-check against the well-known global daily figure.' },
  { question: 'What is the cumulative number of credit and debit cards in circulation worldwide?', hint: 'Estimate the banked adult population, then multiply by an average number of payment cards held per person, which is several in developed markets and near zero in unbanked regions.' },
  { question: 'How many cups (servings) of tea are consumed worldwide in a single day?', hint: 'Tea is concentrated in Asia, the Middle East, and the UK, so weight those regions heavily for cups per person per day rather than using a flat global average.' },
  { question: 'What is the global annual revenue of the pet-care market (food + vet + supplies, USD)?', hint: 'Combine the number of pet-owning households in developed regions with annual spend per pet, since spending is overwhelmingly concentrated in high-income markets.' },
  { question: 'How many flights (commercial aircraft departures) take off worldwide in a single day?', hint: 'Work backward from annual global passengers and an average passengers-per-flight figure to get flights per year, then divide by 365. Distinguish passenger flights from cargo/private.' },
  { question: 'What is the annual operating cost of the global postal and parcel-delivery \'last mile\' (USD)?', hint: 'Estimate annual parcels delivered worldwide times an average last-mile cost per parcel, recognizing last mile is the costliest delivery segment per item.' },
  { question: 'How many liters of milk are produced worldwide in one year?', hint: 'Anchor on world population and an average per-capita dairy-milk availability per year, weighting high-consumption regions (Europe, the Americas, South Asia) more heavily.' },
  { question: 'What is the global total addressable market for online video streaming subscriptions (USD)?', hint: 'Multiply broadband-connected households worldwide by an estimated paying-subscriber rate, services per household, and average monthly fee × 12. Affordability caps adoption in lower-income regions.' },
  { question: 'How many plastic bottles (PET beverage bottles) are produced worldwide in one year?', hint: 'Start from global bottled-beverage servings per person per year (water + soda) and scale by population, recognizing that one person can consume hundreds of bottles annually in heavy markets.' },
  { question: 'What is the cumulative number of active bank accounts worldwide?', hint: 'Estimate the banked adult population, then multiply by an average number of accounts (checking, savings, etc.) held per banked person, which is higher in developed markets.' },
  { question: 'What is the global annual retail revenue of the beer market (USD)?', hint: 'Combine the world\'s regular beer-drinking population with liters consumed per person per year and an average retail price per liter, weighting high-consumption regions and on-premise (bar) pricing.' },
  { question: 'How many text/chat messages (SMS + messaging apps) are sent worldwide in a single day?', hint: 'Multiply the number of messaging-app users by an average messages-sent-per-user-per-day, recognizing that app messaging volume now dwarfs traditional SMS.' },
  { question: 'What is the global annual electricity-generation revenue (utility sales to end users, USD)?', hint: 'Combine total world electricity consumption (in terawatt-hours) with an average retail price per kWh, blending cheap-power and expensive-power regions.' },
]

export const FERMI_POOL: FermiQuestion[] = getLocale() === 'en' ? FERMI_POOL_EN : FERMI_POOL_JA

/**
 * 問題文（question_text）から pool index を逆引きする。
 * 履歴 → 再挑戦の導線で使う。マッチしなければ -1。
 * 現ロケールのプール内で先頭一致を厳密比較（trim 比較）。
 */
export function findFermiPoolIndex(questionText: string): number {
  if (!questionText) return -1
  const needle = questionText.trim()
  return FERMI_POOL.findIndex(q => q.question.trim() === needle)
}

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
  // 24: ラーメン店年間総売上
  [{ label: '日本のラーメン店店舗数（参考）', value: '約3.2万店' }, { label: '1店舗の1日売上（参考）', value: '約4〜8万円' }, { label: '営業日（参考）', value: '約330日' }],
  // 25: コンビニ大手3社1日合計売上
  [{ label: 'セブン店舗数', value: '約2.1万店' }, { label: 'ファミマ店舗数', value: '約1.6万店' }, { label: 'ローソン店舗数', value: '約1.5万店' }, { label: '1店舗の1日売上（参考）', value: '約55万円' }],
  // 26: タクシー業界年間総売上
  [{ label: '全国タクシー台数', value: '約23万台' }, { label: '1台の1日売上（参考）', value: '約3万円' }, { label: '稼働日数（参考）', value: '約280日' }],
  // 27: カラオケ市場年間規模
  [{ label: '日本のカラオケ店店舗数', value: '約8,000店' }, { label: '1店舗の1日売上（参考）', value: '約8〜15万円' }, { label: '営業日（参考）', value: '約350日' }],
  // 28: 漫画市場（紙＋電子）年間規模
  [{ label: '紙コミック市場（参考）', value: '約2,000億円' }, { label: '電子コミック市場（参考）', value: '約5,000億円' }, { label: 'コミック雑誌市場', value: '約500億円' }],
  // 29: スマホゲーム業界年間売上
  [{ label: '国内アクティブユーザー（参考）', value: '約5,000万人' }, { label: '課金率（参考）', value: '約10%' }, { label: 'ARPPU（参考）', value: '約3,000〜5,000円/月' }],
  // 30: 保険業界年間総保険料収入
  [{ label: '生保保険料収入（参考）', value: '約30兆円' }, { label: '損保保険料収入（参考）', value: '約9兆円' }, { label: '生保世帯加入率', value: '約90%' }],
  // 31: 中古車市場年間流通台数
  [{ label: '国内自家用車保有台数', value: '約6,200万台' }, { label: '平均買い替え周期', value: '約7〜8年' }, { label: '中古車流通比率', value: '新車の約1.5倍' }],
  // 32: 宅配ピザ業界年間総売上
  [{ label: '宅配ピザ店舗数（参考）', value: '約2,500店' }, { label: '1店舗/日の注文数（参考）', value: '約30〜50件' }, { label: '客単価（参考）', value: '約3,000円' }],
  // 33: スマートフォン年間出荷台数
  [{ label: '日本の人口', value: '約1.24億人' }, { label: 'スマホ保有率（参考）', value: '約85%' }, { label: '買い替え周期（参考）', value: '約3〜4年' }],
  // 34: レンタカー業界年間総売上
  [{ label: '国内レンタカー保有台数（参考）', value: '約65万台' }, { label: '稼働率（参考）', value: '約50%' }, { label: '平均単価/日（参考）', value: '約8,000円' }],
  // 35: 自販機年間総売上
  [{ label: '全国自販機台数（参考）', value: '約400万台（飲料約240万台）' }, { label: '1台/日の売上（参考）', value: '約1,000〜2,000円' }, { label: '稼働日', value: '365日' }],
  // 36: 通信費（携帯＋固定）年間総支出
  [{ label: '日本の世帯数', value: '約5,700万世帯' }, { label: '世帯あたり通信費（参考）', value: '約12,000円/月' }, { label: '法人通信支出（参考）', value: '個人と同規模' }],
  // 37: 英会話スクール業界年間総売上
  [{ label: '受講者数（参考）', value: '約400万人' }, { label: '1人あたり年間支出（参考）', value: '約10〜30万円' }, { label: 'オンライン比率', value: '上昇傾向（約30〜40%）' }],
  // 38: スーパー銭湯・温泉施設年間入場者
  [{ label: '全国スーパー銭湯/温泉施設数', value: '約7,000施設' }, { label: '1施設/日の来場者（参考）', value: '約300〜800人' }, { label: '営業日', value: '約360日' }],
  // 39: 不動産仲介業界年間総売上
  [{ label: '年間住宅取引件数（参考）', value: '約80万件' }, { label: '平均成約価格（参考）', value: '約3,000万円' }, { label: '仲介手数料率', value: '約3%' }],
  // 40: 電子書籍市場年間規模
  [{ label: '日本の読者人口（参考）', value: '約7,000万人' }, { label: '電子書籍利用率（参考）', value: '約30〜40%' }, { label: '1人あたり年間支出（参考）', value: '約3,000〜5,000円' }],
  // 41: スマートウォッチ年間出荷台数
  [{ label: '20〜50代人口（参考）', value: '約5,000万人' }, { label: '保有率（参考）', value: '約15〜20%' }, { label: '買い替え周期（参考）', value: '約3〜4年' }],
  // 42: ホテル業界年間客室稼働数
  [{ label: '全国客室数（参考）', value: '約170万室' }, { label: '稼働率（参考）', value: '約60〜70%' }, { label: '日数', value: '365日' }],
  // 43: コピー機の前で待つ年間総時間
  [{ label: 'ホワイトカラー人口', value: '約3,500万人' }, { label: '1人/週のコピー回数（参考）', value: '約10〜20回' }, { label: '1回あたり待ち時間（参考）', value: '約30秒' }],
  // 44: 「お世話になっております」総回数
  [{ label: 'ビジネスメール送信者数（参考）', value: '約3,000万人' }, { label: '1人/日のメール送信数（参考）', value: '約20〜40通' }, { label: '冒頭挨拶率（参考）', value: '約30〜50%' }],
  // 45: 「先方都合の時間変更」件数
  [{ label: 'BtoB会議の1日件数（参考）', value: '約500万件' }, { label: '時間変更発生率（参考）', value: '約5〜10%' }, { label: 'リスケ多発業界比率', value: 'コンサル・営業で高め' }],
  // 46: 1日の印刷紙総枚数
  [{ label: 'ホワイトカラー人口', value: '約3,500万人' }, { label: '1人/日の印刷枚数（参考）', value: '約10〜20枚' }, { label: 'ペーパーレス化率', value: '業界によって30〜70%' }],
  // 47: 年賀状年間発送枚数
  [{ label: '日本の世帯数', value: '約5,700万世帯' }, { label: '1世帯あたり発送枚数（参考）', value: '約20〜40枚' }, { label: '減少率（前年比）', value: '約5〜10%/年' }],
  // 48: Enterキー年間総押下回数
  [{ label: 'PCワーカー人口（参考）', value: '約3,000万人' }, { label: '1人/日のEnter回数（参考）', value: '約200〜500回' }, { label: '営業日', value: '約240日' }],
  // 49: 駅の自販機コーヒー1日販売本数
  [{ label: '全国駅数', value: '約9,500駅' }, { label: '1駅の自販機台数（参考）', value: '約3〜10台' }, { label: '1台/日の販売本数（参考）', value: '約20〜30本' }, { label: 'コーヒー比率（参考）', value: '約20%' }],
]

const FERMI_STATS_EN: FermiStat[][] = [
  // F19: グローバル題材プール（en）の参照データ。各問題の anchor（common-knowledge 参照値）を
  // {label,value} チップ化し、末尾に referenceStats（模範解答の推論ロジック）を保持。
  // 0: market-sizing (basic)
  [{ label: 'US population', value: '~330M' }, { label: 'Adults', value: '~250M' }, { label: 'Context', value: 'coffee a daily habit for many' }, { label: 'Worked estimate', value: 'US adults ~250M; ~40% are regular chain-café buyers (~100M) buying ~2 cups/week at ~$5 each → ~100M × 2 × 52 × $5 ≈ $52B. Cross-check vs. Starbucks US revenue (~$25B) as roughly half the chain segment → order of tens of billions.' }],
  // 1: platform-supply-demand (standard)
  [{ label: 'US population', value: '~330M' }, { label: 'large metros', value: '~1–10M people' }, { label: 'a ride lasts', value: '~15 min' }, { label: 'Worked estimate', value: 'US ride-hailing ~20M rides/day; evening peak ~8% in the busy hour → ~1.6M rides/hour; each ride ~15 min so ~0.4M rides in progress at any instant; with ~50% driver utilization at peak → ~0.8M drivers online. Order of magnitude: high hundreds of thousands.' }],
  // 2: unit-economics (standard)
  [{ label: 'Context', value: 'A fast-food outlet seats few but turns fast' }, { label: 'Context 2', value: 'lunch+dinner peaks' }, { label: 'ticket', value: '~$10' }, { label: 'Worked estimate', value: '~12 operating hours: ~4 peak hours at ~60 orders/hr + ~8 off-peak at ~20/hr → ~400 orders/day × $10 ticket = $4,000/day × 360 days ≈ $1.4M/year. Cross-check: typical US QSR unit does ~$1–3M/year, so this sits at the lower-mid end.' }],
  // 3: national-sizing (advanced)
  [{ label: 'US', value: '~330M people' }, { label: 'haircut every', value: '~5–8 weeks' }, { label: 'Average cut', value: '~$25' }, { label: 'Worked estimate', value: 'Bottom-up: ~280M people getting ~6 cuts/year at ~$25 avg ≈ $42B. Top-down: ~1M salons/barbershops × ~$50–60K revenue per chair-equivalent slice → tens of billions. Both converge on ~$45–55B; the gap comes from color/treatment upsell and tips not captured in the bottom-up price.' }],
  // 4: market-sizing (basic)
  [{ label: 'US', value: '~130M households' }, { label: 'pets in', value: '~65% of homes' }, { label: 'Context', value: 'food bag bought monthly' }, { label: 'Worked estimate', value: '~85M households own pets; ~90M dogs at ~$300/yr food + ~75M cats at ~$200/yr food ≈ $27B + $15B ≈ $42B. Cross-check vs. total US pet industry (~$150B incl. vet/supplies); food is ~30% → ~$45B. Order: ~$40–50B.' }],
  // 5: platform-concurrency (advanced)
  [{ label: 'Global population', value: '~8B' }, { label: 'Internet users', value: '~5B' }, { label: 'Context', value: 'video streaming dominates traffic' }, { label: 'Worked estimate', value: '~250M subscriber accounts × ~1.5 viewers/account = ~375M potential viewers; ~50% watch on a given day for ~2 hrs each. After time-zone smoothing the single highest instant ≈ 20–30M concurrent streams. Order: tens of millions.' }],
  // 6: national-sizing (standard)
  [{ label: 'US', value: '~330M' }, { label: 'Licensed drivers', value: '~230M' }, { label: 'Registered vehicles', value: '~290M' }, { label: 'Worked estimate', value: '~250M light-duty vehicles × ~12,000 miles/yr ÷ ~25 mpg ≈ 120B gallons. Cross-check: US motor gasoline consumption is ~135B gallons/yr including all light vehicles → order of ~10^11 gallons.' }],
  // 7: unit-economics (standard)
  [{ label: 'A mid-scale hotel', value: '~120 rooms' }, { label: 'ADR', value: '~$120' }, { label: 'occupancy', value: '~70%' }, { label: 'Worked estimate', value: '120 rooms × 70% occupancy × $120 ADR × 365 ≈ $3.7M room revenue; add ~25% for F&B/other → ~$4.6M total. Cross-check: RevPAR ≈ $84 × 120 × 365 ≈ $3.7M confirms the room line.' }],
  // 8: market-sizing (advanced)
  [{ label: 'Global', value: '~8B' }, { label: 'Mobile phone users', value: '~5.5B' }, { label: 'phones replaced', value: '~every 3 yrs' }, { label: 'Worked estimate', value: 'Bottom-up: ~4.5B installed base ÷ ~3.5-yr replacement ≈ 1.3B replacements + ~0.1B net new users ≈ 1.3–1.4B/yr. Top-down by region (Asia/EU/Americas) lands ~1.2–1.4B. Both converge near ~1.2B units/year. Order: ~10^9.' }],
  // 9: platform-supply-demand (standard)
  [{ label: 'US', value: '~130M households' }, { label: 'Have internet', value: '~95%' }, { label: 'Context', value: 'food delivery common in metros' }, { label: 'Worked estimate', value: '~80M metro/suburban households with delivery access; ~8% order on a busy Friday night → ~6.4M orders concentrated in the 5–9pm window. Cross-check vs. ~3M average daily US delivery orders, with Friday peak hours running several-fold above the daily-average hourly rate → low-millions in the window.' }],
  // 10: national-sizing (basic)
  [{ label: 'US', value: '~330M' }, { label: 'Births/yr', value: '~3.6M' }, { label: 'diapers used for', value: '~2.5 yrs' }, { label: 'Worked estimate', value: '~3.6M births/yr × ~2.5 years in diapers ≈ 9M children in diapers; ~6 diapers/day × 365 → ~9M × 2,190 ≈ 20B diapers/year. Order: ~2 × 10^10.' }],
  // 11: unit-economics (advanced)
  [{ label: 'Context', value: 'A SaaS startup' }, { label: 'ARPU', value: '~$50/mo' }, { label: 'churn', value: '~2%/mo' }, { label: 'Context 2', value: '200 adds/mo' }, { label: 'Worked estimate', value: 'Net base with 200 adds/mo and 2% monthly churn approaches equilibrium near adds ÷ churn = 200 ÷ 0.02 = 10,000, but at 36 months it\'s still ramping → ~5,500 customers. × $50/mo × 12 ≈ $3.3M ARR. Order: low single-digit millions ARR.' }],
  // 12: market-sizing (standard)
  [{ label: 'Global', value: '~8B' }, { label: 'Commercial passenger jets', value: '~25,000' }, { label: 'Seats/plane', value: '~180' }, { label: 'Worked estimate', value: 'Build-up: ~25,000 commercial passenger jets × ~3 flights/day × ~180 seats × ~80% load × 360 days ≈ 3.9B passenger-trips. Cross-check: industry reports ~4–4.5B passenger boardings/year → order of ~4 × 10^9 seats sold.' }],
  // 13: platform-concurrency (advanced)
  [{ label: 'Global', value: '~5B internet users' }, { label: 'Context', value: 'messaging near-universal' }, { label: 'Context 2', value: 'New Year peaks by zone' }, { label: 'Worked estimate', value: '~2B users × ~40 messages/day ≈ 80B/day ≈ 0.9M/sec average. New Year\'s-style peaks run ~30–50× average for a minute → ~30M/sec × 60 ≈ ~1.8B messages in the peak minute. Order: ~10^9 in one minute.' }],
  // 14: national-sizing (advanced)
  [{ label: 'US', value: '~130M households' }, { label: 'People/household', value: '~2.5' }, { label: 'KWh/home/yr', value: '~10,000' }, { label: 'Worked estimate', value: 'Route A: ~130M households × ~10,500 kWh/yr ≈ 1,365B kWh. Route B: ~330M people × ~4,200 kWh/yr residential ≈ 1,386B kWh. Both converge near ~1.4 trillion kWh (~1.4 × 10^12). Routes agree because per-household and per-capita are linked by ~2.5 people/household.' }],
  // 15: market-sizing (basic)
  [{ label: 'Global', value: '~8B' }, { label: 'Context', value: 'chocolate eaten widely in wealthier regions' }, { label: 'Retail', value: '~$12/kg' }, { label: 'Worked estimate', value: '~1.5B people in high-consumption regions at ~5 kg/yr + ~2B at ~1 kg/yr ≈ 9.5B kg; × ~$12/kg retail ≈ $110B. Cross-check vs. reported global chocolate market ~$100–130B → order of ~$10^11.' }],
  // 16: unit-economics (standard)
  [{ label: 'A gym', value: '~3,000 members' }, { label: 'dues', value: '~$40/mo' }, { label: 'Visit on a given day', value: '~10–15%' }, { label: 'Worked estimate', value: '3,000 members × $40/mo × 12 ≈ $1.44M dues; +~15% personal training/retail → ~$1.65M/yr. Daily visits: gyms rely on low attendance, ~10–18% of members visit/day → ~300–500 visits/day. Order: ~$1.5M revenue, hundreds of daily visits.' }],
  // 17: platform-supply-demand (standard)
  [{ label: 'US', value: '~330M' }, { label: 'Active short-term-rental listings', value: '~1.5M' }, { label: 'Context', value: 'travel peaks in summer' }, { label: 'Worked estimate', value: '~1.5M active US short-term rental listings; peak-summer-Saturday occupancy ~70–80% → ~1.1M occupied. Cross-check: ~2 guests/listing → ~2.2M travelers housed that night, plausible against US summer travel volumes. Order: ~10^6 occupied listings.' }],
  // 18: national-sizing (basic)
  [{ label: 'US', value: '~330M' }, { label: 'Adults', value: '~250M' }, { label: 'Drink coffee daily', value: '~60%' }, { label: 'Worked estimate', value: '~250M adults × ~60% drink coffee (~150M) × ~3 cups/day ≈ 450M cups/day. Cross-check: US drinks ~400–500M cups/day per industry surveys → order of ~4–5 × 10^8 cups/day.' }],
  // 19: market-sizing (advanced)
  [{ label: 'Global', value: '~5.5B mobile users' }, { label: 'Play mobile games', value: '~3.5B' }, { label: 'payers', value: '~3%' }, { label: 'Worked estimate', value: 'Player route: ~3.5B players × ~3% payers (~105M) × ~$800/yr per payer ≈ $84B. Top-down: app-store consumer spend ~$150B × ~60% games ≈ $90B. Both converge near ~$85–90B/yr. Order: ~$10^11.' }],
  // 20: unit-economics (standard)
  [{ label: 'A supermarket', value: '~40,000 sq ft' }, { label: 'Average basket', value: '~$35' }, { label: 'Context', value: 'busy suburban site' }, { label: 'Worked estimate', value: '~2,500 transactions/day × ~$35 basket ≈ $87,500/day × 360 ≈ $31M/yr. Cross-check: typical US supermarket does ~$15–40M/yr in sales, so a busy suburban unit sits in the upper range. Order: tens of millions.' }],
  // 21: national-sizing (standard)
  [{ label: 'US', value: '~330M' }, { label: 'Registered light vehicles', value: '~290M' }, { label: 'Vehicle lifespan', value: '~18-yr' }, { label: 'Worked estimate', value: '~290M registered light vehicles ÷ ~18-year average lifespan ≈ 16M replacements/yr; minor net fleet growth keeps it near 15–17M. Cross-check: US new light-vehicle sales run ~15–17M/yr → order of ~10^7 units.' }],
  // 22: platform-concurrency (advanced)
  [{ label: 'Global', value: '~8B' }, { label: 'Context', value: 'one search engine handles most queries' }, { label: 'Context 2', value: 'usage spread by waking hours' }, { label: 'Worked estimate', value: '~5 trillion queries/year ÷ 31.5M sec ≈ 160,000 queries/sec average. Global time-zone smoothing keeps the peak multiplier modest (~1.5–2×) → ~250,000–320,000 queries/sec at peak. Order: ~10^5 qps.' }],
  // 23: market-sizing (basic)
  [{ label: 'Global', value: '~8B' }, { label: 'Regular cinema-goers', value: '~2B' }, { label: 'ticket', value: '~$7 avg globally' }, { label: 'Worked estimate', value: '~2B regular cinema-goers × ~2 tickets/yr × ~$7 avg global ticket ≈ $28B; add occasional viewers → ~$30–40B. Cross-check vs. reported global box office (~$30–40B) → order of ~$10^10.' }],
  // 24: unit-economics (advanced)
  [{ label: 'An EV fast-charging site', value: '~8 stalls' }, { label: 'session', value: '~30 min' }, { label: 'KWh/session', value: '~30' }, { label: 'Worked estimate', value: '8 stalls × ~16 active hours ÷ ~0.5 hr/session × ~40% utilization ≈ ~100 sessions/day; × ~30 kWh × ~$0.45/kWh ≈ $1,350/day × 365 ≈ $490K/yr. Cross-check: 40% utilization at a busy highway site is plausible-to-optimistic; a lower 20% utilization halves revenue to ~$250K. Order: hundreds of thousands USD.' }],
  // 25: industry-throughput (basic)
  [{ label: 'US population', value: '~330M' }, { label: 'world population', value: '~8B' }, { label: 'Worked estimate', value: 'US population ~330M; ~1 pizza per person per week in the US (~3 billion pizzas/year ≈ ~8M/day in the US). Scale up ~2–3× for Europe + rest of world heavy markets → roughly 20–30M pizzas/day globally.' }],
  // 26: stock-flow (standard)
  [{ label: 'World population', value: '~8B' }, { label: 'Active PCs in use', value: '~1.5B' }, { label: 'Worked estimate', value: 'Global PC installed base ~1.5–1.6B active machines; average replacement cycle ~5–6 years → ~260–300M replacement units/year; plus net new buyers keeps annual shipments around ~250–300M units.' }],
  // 27: industry-throughput (basic)
  [{ label: 'World population', value: '~8B' }, { label: 'Smokers', value: '~1.1B' }, { label: 'Worked estimate', value: 'World adults ~5.5B; smokers ~20% (~1.1B) at ~13–15 cigarettes/day → ~1.1B × 14 × 365 ≈ ~5.5–6 trillion cigarettes/year (commonly cited ~5.5T).' }],
  // 28: stock-flow (advanced)
  [{ label: 'Global cumulative PV capacity', value: '~1.5 TW' }, { label: 'Worked estimate', value: 'Global cumulative solar capacity ~1,500 GW (~1.5 TW); average module ~0.4 kW each → ~1.5e12 W / 400 W ≈ ~3.5–4 billion modules cumulatively installed.' }],
  // 29: industry-throughput (advanced)
  [{ label: 'Global container port throughput', value: '~850M TEU/year' }, { label: 'Worked estimate', value: 'Global container port throughput ~850M–900M TEU/year of handling moves; unique laden + empty trade flows ~200–250M TEU/year. State which you mean—handling vs. shipped—since they differ ~3–4×.' }],
  // 30: global-tam (standard)
  [{ label: 'World population', value: '~8B' }, { label: 'Worked estimate', value: 'World population ~8B; bottled-water consumers ~3–4B at ~40–50 L/person/year; price ~$0.5–1 per liter at retail → roughly $250–350B/year (commonly cited ~$300B).' }],
  // 31: industry-throughput (standard)
  [{ label: 'World population', value: '~8B' }, { label: 'Context', value: 'air cargo is a high-value freight slice' }, { label: 'Worked estimate', value: 'World population ~8B; ~7–8 kg of air-freighted goods per person per year on average → ~55–65 million tonnes/year. Cross-check: industry reports ~60–65M tonnes of air cargo annually → order of ~10^7 tonnes.' }],
  // 32: cost-ops (advanced)
  [{ label: 'Global data-center electricity', value: '~400 TWh/year' }, { label: 'Worked estimate', value: 'Global data-center electricity use ~350–450 TWh/year; industrial power ~$0.10–0.15/kWh → ~$40–65B/year in electricity alone. State TWh × price/kWh explicitly.' }],
  // 33: industry-throughput (basic)
  [{ label: 'World population', value: '~8B' }, { label: 'Worked estimate', value: 'World population ~8B; weighted average ~2.5–3 new pairs/person/year (developed ~5–7, developing ~1–2) → ~20–24 billion pairs/year (commonly cited ~22B).' }],
  // 34: stock-flow (standard)
  [{ label: 'World population', value: '~8B' }, { label: 'US', value: '~330M people, ~280M registered vehicles' }, { label: 'Worked estimate', value: 'World population ~8B; US ~800 cars/1,000, Europe ~500, China rising ~200, low-income regions <50 → weighted global fleet ~1.4–1.5 billion vehicles (cars + light trucks).' }],
  // 35: industry-throughput (standard)
  [{ label: 'Global email users', value: '~4.3B' }, { label: 'Worked estimate', value: 'Email users ~4.3B; human-sent ~10–15/day each ≈ ~50–65B; total including automated + spam pushes the figure to ~300–350B/day. Separate human vs. total—they differ ~5×.' }],
  // 36: global-tam (standard)
  [{ label: 'World population', value: '~8B' }, { label: 'Worked estimate', value: 'World population ~8B; regular QSR users ~2–3B at ~30–50 visits/year × ~$7 ticket → roughly $600–900B/year (industry estimates ~$700–900B).' }],
  // 37: industry-throughput (standard)
  [{ label: 'World population', value: '~8B' }, { label: 'US oil use', value: '~20M bbl/day' }, { label: 'Worked estimate', value: 'US ~330M people use ~20M barrels/day (~0.06 bbl/person/day); world average is far lower → global consumption ~100M barrels/day (a standard reference figure).' }],
  // 38: stock-flow (advanced)
  [{ label: 'World population', value: '~8B' }, { label: 'banked adults', value: '~4B+' }, { label: 'Worked estimate', value: 'World adults ~5.5B; banked share ~75% → ~4B card-holders; developed holders carry ~3–4 cards, others ~1 → cumulative ~20–24 billion cards in circulation.' }],
  // 39: industry-throughput (basic)
  [{ label: 'World population', value: '~8B' }, { label: 'Worked estimate', value: 'World population ~8B; heavy-tea regions (~4B people) at ~2–3 cups/day plus lighter regions → roughly ~6–9 billion servings/day (tea is the second-most consumed beverage after water).' }],
  // 40: global-tam (standard)
  [{ label: 'US population', value: '~330M' }, { label: 'US pet market', value: '~$130B' }, { label: 'Worked estimate', value: 'US pet market alone ~$120–140B; other major developed markets (Europe, etc.) add a comparable amount → global pet care roughly ~$250–300B/year.' }],
  // 41: industry-throughput (standard)
  [{ label: 'Global annual air passengers', value: '~4.5B' }, { label: 'Worked estimate', value: 'Global air passengers ~4.5B/year ÷ ~120 passengers/flight ≈ ~38M flights/year ≈ ~100,000 commercial passenger departures/day (often cited ~100k–130k including all flight types).' }],
  // 42: cost-ops (advanced)
  [{ label: 'Global annual parcel volume', value: '~150B' }, { label: 'Worked estimate', value: 'Global parcels ~150–160B/year; last-mile cost ~$2–4/parcel (it is ~40–50% of total shipping cost) → roughly $400–600B/year in last-mile spend.' }],
  // 43: industry-throughput (standard)
  [{ label: 'World population', value: '~8B' }, { label: 'Worked estimate', value: 'World population ~8B; weighted average ~100–110 L of milk per person/year (developed ~250+, developing far less) → ~850–900 billion liters/year (global production ~900B liters).' }],
  // 44: global-tam (advanced)
  [{ label: 'World broadband households', value: '~1.3B' }, { label: 'Worked estimate', value: 'Broadband households ~1.3B; paying SVOD households ~700–900M at ~1.8 services × ~$8/month × 12 → roughly $120–160B/year (global SVOD ~$130B+).' }],
  // 45: industry-throughput (standard)
  [{ label: 'World population', value: '~8B' }, { label: 'Worked estimate', value: 'World population ~8B; ~60–70 PET bottles/person/year on average (developed markets far higher) → roughly ~480–550 billion bottles/year (commonly cited ~500B).' }],
  // 46: stock-flow (standard)
  [{ label: 'World population', value: '~8B' }, { label: 'banked adults', value: '~4B+' }, { label: 'Worked estimate', value: 'World adults ~5.5B; banked share ~75% → ~4B account-holders; developed holders average ~2–3 accounts, others ~1–1.5 → cumulative ~7–9 billion active accounts.' }],
  // 47: global-tam (advanced)
  [{ label: 'World population', value: '~8B' }, { label: 'Regular beer drinkers', value: '~2B' }, { label: 'Worked estimate', value: 'World population ~8B; ~2B regular beer drinkers at ~70–80 L/year → ~150B liters; blended retail price ~$3–4/liter (cheap off-premise to expensive bar pours) → roughly $600–700B/year (global beer market often cited ~$650–750B).' }],
  // 48: industry-throughput (standard)
  [{ label: 'Global messaging-app users', value: '~3B' }, { label: 'Worked estimate', value: 'Messaging-app users ~3B; ~30–40 sent messages/user/day → ~90–120 billion/day from one major platform alone; across all platforms total is on the order of ~100–150B/day (WhatsApp alone ~100B/day).' }],
  // 49: global-tam (advanced)
  [{ label: 'World population', value: '~8B' }, { label: 'global electricity use', value: '~29,000 TWh/year' }, { label: 'Worked estimate', value: 'Global electricity consumption ~28,000–30,000 TWh/year; blended retail price ~$0.10–0.15/kWh → roughly $3–4 trillion/year. State TWh × price/kWh explicitly as the backbone.' }],
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
