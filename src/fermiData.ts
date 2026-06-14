// fermiData.ts — フェルミ問題プール（ホーム・DailyFermiScreen共通）
// ビジネス系 × ちょっと面白い系に厳選
//
// 50問の question / hint と対応する FERMI_STATS を ja / en で持つ。
// 起動時の getLocale() で FERMI_POOL / FERMI_STATS が決まる。

import { getLocale } from './i18n'

export type FermiDifficulty = 'basic' | 'standard' | 'advanced'
export type FermiDomain = 'market' | 'unit' | 'volume' | 'flow' | 'cost'

export type FermiQuestion = {
  question: string
  hint: string
  difficulty: FermiDifficulty
  domain: FermiDomain
  theme?: string  // en 由来の細分類（任意）
}

const FERMI_POOL_JA: FermiQuestion[] = [
  // ── 王道ビジネス：市場規模・売上 ──
  // idx 0: advanced / market
  { question: '日本国内のSaaS市場の年間売上規模は何円か？', hint: '日本の法人数×SaaS導入率×1社あたり年間支出で分解。中小と大企業で支出額が大きく違う。', difficulty: 'advanced', domain: 'market' },
  // idx 1: standard / unit
  { question: '日本のスタバ全店舗が1日に売り上げる総額は何円か？', hint: '店舗数×1店舗の客数×客単価で分解。営業時間と回転率も意識しよう。', difficulty: 'standard', domain: 'unit' },
  // idx 2: standard / unit
  { question: '居酒屋チェーン（300店舗規模）の1日の総売上は何円か？', hint: '1店舗の席数×回転率×客単価×店舗数で計算。平日と週末の違いも意識。', difficulty: 'standard', domain: 'unit' },
  // idx 3: standard / market
  { question: '日本のEC市場の年間流通総額（GMV）は何円か？', hint: 'ネット利用人口×EC利用率×1人あたり年間EC支出で分解。物販以外（旅行・チケット）も忘れずに。', difficulty: 'standard', domain: 'market' },
  // idx 4: advanced / volume
  { question: '日本国内で年間に成立しているM&Aは何件か？', hint: '上場企業の戦略案件＋中小企業の事業承継案件で分解。後継者不在問題の規模感がカギ。', difficulty: 'advanced', domain: 'volume' },

  // ── ビジネスコスト・オペレーション ──
  // idx 5: basic / cost
  { question: '従業員50人の中小企業の年間オフィス賃料は何円か？', hint: '1人あたり必要面積×坪単価×12ヶ月で計算。都心と郊外で大きく異なる。', difficulty: 'basic', domain: 'cost' },
  // idx 6: advanced / volume
  { question: '大手コンサルファームが日本で年間に受注するプロジェクト数は？', hint: '従業員数÷1プロジェクトあたり人数×年間プロジェクト回転数で考えよう。', difficulty: 'advanced', domain: 'volume' },

  // ── ビジネスあるある（面白い系） ──
  // idx 7: standard / volume
  { question: '日本の会社員が1年間に押すハンコの総数は？', hint: '労働力人口×ホワイトカラー比率×1人/日のハンコ回数×年間営業日で分解。電子化進行率も差し引こう。', difficulty: 'standard', domain: 'volume' },
  // idx 8: standard / volume
  { question: '日本のビジネスパーソンが1日に発する「お疲れ様です」の総回数は？', hint: '労働力人口×1人/日の発話回数で分解。挨拶・退勤・メール冒頭・チャット冒頭…と場面別に数えよう。', difficulty: 'standard', domain: 'volume' },
  // idx 9: standard / volume
  { question: '日本の社内チャット（Slack/Teams等）で1日に送られる「了解です／承知しました」の総回数は？', hint: 'ビジネスチャット利用者数×1人/日の送信メッセージ数×「了解系」の比率で分解。', difficulty: 'standard', domain: 'volume' },
  // idx 10: basic / volume
  { question: '日本のオフィスで1日に淹れられるコーヒーの総杯数は？', hint: 'ホワイトカラー人口×1人/日のオフィスコーヒー杯数で分解。コーヒーマシン＋カフェ持込みの両方を含めよう。', difficulty: 'basic', domain: 'volume' },
  // idx 11: advanced / flow
  { question: 'オンライン会議で1日に発される「マイクミュートになってます」の全国総回数は？', hint: '1日のオンライン会議件数×1会議でこの事故が起きる確率で分解。在宅・ハイブリッド勤務の浸透度も考えよう。', difficulty: 'advanced', domain: 'flow' },
  // idx 12: standard / volume
  { question: '日本の経費精算で1年間に申請される領収書の総枚数は？', hint: 'ホワイトカラー人口×1人/月の領収書枚数×12ヶ月で分解。営業職と内勤で枚数差が大きい。', difficulty: 'standard', domain: 'volume' },
  // idx 13: advanced / volume
  { question: '日本中の名刺ホルダーに眠っている「もう使わない」名刺の総枚数は？', hint: '労働力人口×営業職比率×営業1人の生涯獲得名刺枚数で分解。退職や部署異動で「眠る」割合も考えよう。', difficulty: 'advanced', domain: 'volume' },

  // ── コンサルケース面接の定番（市場規模推定） ──
  // idx 14: standard / market
  { question: '日本のゴルフ市場の年間規模は何円か？', hint: 'ゴルフ人口×年間プレー回数×1ラウンドあたり費用（プレー代＋用品＋飲食）で分解。年代別の参加率の偏りも意識しよう。', difficulty: 'standard', domain: 'market' },
  // idx 15: basic / market
  { question: '日本のペットフード市場の年間規模は何円か？', hint: '国内の犬・猫の飼育頭数×1頭あたり年間フード支出で分解。犬と猫で支出単価が違う点にも注意。', difficulty: 'basic', domain: 'market' },
  // idx 16: standard / volume
  { question: '東京都内のフィットネスジムの会員数は何人か？', hint: '東京都の人口×年代別ジム加入率で分解。20〜40代の都市労働者がコア層、シニア向けジムも忘れずに。', difficulty: 'standard', domain: 'volume' },
  // idx 17: standard / market
  { question: '日本の年間結婚式市場の規模は何円か？', hint: '年間婚姻組数×結婚式実施率×1組あたり披露宴費用で分解。「ナシ婚」を差し引くのがポイント。', difficulty: 'standard', domain: 'market' },
  // idx 18: advanced / market
  { question: '日本のオンライン広告市場の年間規模は何円か？', hint: '日本の総広告費（GDPの約1〜1.2%）×デジタル広告比率で考える。検索＋ディスプレイ＋動画＋SNSの構成も意識。', difficulty: 'advanced', domain: 'market' },
  // idx 19: standard / market
  { question: '日本のメガネ市場の年間規模は何円か？', hint: '人口×視力矯正必要率÷平均買い替え周期×1本あたり価格で分解。コンタクトレンズとの代替関係にも注意。', difficulty: 'standard', domain: 'market' },
  // idx 20: standard / volume
  { question: '日本の宅配便の年間取扱個数は何個か？', hint: '個人受取＋BtoB物流に分けて、人口×1人あたり年間受取数＋法人物流量で考える。EC化率の上昇も意識。', difficulty: 'standard', domain: 'volume' },
  // idx 21: standard / market
  { question: '日本のサブスク動画配信（Netflix/Prime Video等）市場の年間規模は何円か？', hint: '世帯数×SVOD加入率×1世帯あたり契約サービス数×月額×12ヶ月で分解。複数併用が一般的な点もポイント。', difficulty: 'standard', domain: 'market' },
  // idx 22: basic / unit
  { question: '日本のドラッグストア業界の年間総売上は何円か？', hint: '全国店舗数×1店舗の1日売上×営業日数で分解。化粧品・食品・医薬品の構成比で1店舗単価をチェック。', difficulty: 'basic', domain: 'unit' },
  // idx 23: basic / volume
  { question: '日本のプロ野球（NPB）の年間観客動員数は何人か？', hint: '12球団×1球団のホーム試合数×1試合の平均観客（球場収容人数×稼働率）で分解。', difficulty: 'basic', domain: 'volume' },

  // ── 追加: 業界規模・市場サイズ ──
  // idx 24: basic / unit
  { question: '日本のラーメン店の年間総売上は何円か？', hint: '店舗数×1店舗の1日売上×営業日数で分解。家系・二郎系・ファミリー向けで客単価差が大きい。', difficulty: 'basic', domain: 'unit' },
  // idx 25: basic / unit
  { question: '日本のコンビニ大手3社の1日合計売上は何円か？', hint: '3社の合計店舗数×1店舗の1日売上で分解。立地（駅前・郊外・オフィス街）で売上が大きく異なる。', difficulty: 'basic', domain: 'unit' },
  // idx 26: standard / unit
  { question: '日本のタクシー業界の年間総売上は何円か？', hint: '全国タクシー台数×1台の1日売上×稼働日数で分解。都市部と地方で稼働率・運賃に差。', difficulty: 'standard', domain: 'unit' },
  // idx 27: basic / unit
  { question: '日本のカラオケ市場の年間規模は何円か？', hint: '店舗数×1店舗の1日売上×営業日数で分解。コロナ後の回復度合いも意識。', difficulty: 'basic', domain: 'unit' },
  // idx 28: standard / market
  { question: '日本の漫画市場（紙＋電子）の年間規模は何円か？', hint: '紙の単行本＋雑誌＋電子書籍ストアでの売上に分解。電子比率が年々上昇している。', difficulty: 'standard', domain: 'market' },
  // idx 29: advanced / market
  { question: '日本のスマホゲーム業界の年間売上は何円か？', hint: 'アクティブユーザー数×課金率×ARPPU（課金者あたり平均額）×12ヶ月で分解。重課金者の偏りも考慮。', difficulty: 'advanced', domain: 'market' },
  // idx 30: advanced / market
  { question: '日本の保険業界の年間総保険料収入は何円か？', hint: '生保＋損保で分けて、世帯加入率×世帯あたり保険料で分解。生保は加入率が非常に高い。', difficulty: 'advanced', domain: 'market' },
  // idx 31: standard / volume
  { question: '日本の中古車市場の年間流通台数は何台か？', hint: '国内自家用車保有台数×平均買い替え周期で年間取引量を概算。', difficulty: 'standard', domain: 'volume' },
  // idx 32: basic / unit
  { question: '日本の宅配ピザ業界の年間総売上は何円か？', hint: '店舗数×1店舗の1日注文数×客単価×営業日数で分解。週末・イベント日の偏りに注意。', difficulty: 'basic', domain: 'unit' },
  // idx 33: standard / volume
  { question: '日本のスマートフォン年間出荷台数は何台か？', hint: '人口×スマホ保有率÷平均買い替え周期で分解。法人需要も含めよう。', difficulty: 'standard', domain: 'volume' },
  // idx 34: standard / unit
  { question: '日本のレンタカー業界の年間総売上は何円か？', hint: '保有車両台数×1日あたり稼働率×平均単価×365日で分解。観光地は稼働率が高い。', difficulty: 'standard', domain: 'unit' },
  // idx 35: basic / unit
  { question: '日本の自販機の年間総売上は何円か？', hint: '全国自販機台数×1台の1日売上×365日で分解。飲料・たばこ・食品の構成比に注意。', difficulty: 'basic', domain: 'unit' },
  // idx 36: standard / market
  { question: '日本の通信費（携帯＋固定）の年間総支出は何円か？', hint: '世帯数×世帯あたり通信費×12ヶ月＋法人需要で分解。MNO/MVNOで料金差が大きい。', difficulty: 'standard', domain: 'market' },
  // idx 37: standard / market
  { question: '日本の英会話スクール業界の年間総売上は何円か？', hint: '通学＋オンラインに分けて、受講者数×1人あたり年間支出で分解。子供向け・大人向けで単価差。', difficulty: 'standard', domain: 'market' },
  // idx 38: basic / volume
  { question: '日本のスーパー銭湯・温泉施設の年間総入場者数は何人か？', hint: '施設数×1施設の1日来場者×営業日数で分解。週末・連休の集中も考慮。', difficulty: 'basic', domain: 'volume' },
  // idx 39: advanced / market
  { question: '日本の不動産仲介業界の年間総売上は何円か？', hint: '年間住宅取引件数×平均仲介手数料（売買価格の3%程度）で分解。賃貸仲介の規模も忘れずに。', difficulty: 'advanced', domain: 'market' },
  // idx 40: standard / market
  { question: '日本の電子書籍市場の年間規模は何円か？', hint: '読者人口×電子書籍利用率×1人あたり年間支出で分解。コミック比率が圧倒的に高い。', difficulty: 'standard', domain: 'market' },
  // idx 41: standard / volume
  { question: '日本のスマートウォッチの年間出荷台数は何台か？', hint: '20〜50代人口×スマートウォッチ保有率÷平均買い替え周期で分解。Apple Watch のシェアが大きい。', difficulty: 'standard', domain: 'volume' },
  // idx 42: standard / flow
  { question: '日本のホテル業界（ビジネス＋シティ）の年間客室稼働数は何室泊か？', hint: '全国客室数×稼働率×365日で分解。観光需要とビジネス需要の比率に注意。', difficulty: 'standard', domain: 'flow' },

  // ── 追加: ビジネスあるある（面白い系） ──
  // idx 43: standard / volume
  { question: '日本の会社員が1年間にコピー機の前で待つ総時間は何時間か？', hint: 'ホワイトカラー人口×1人/週のコピー回数×1回あたり待ち時間で分解。複合機の前の小さな"行列"も意識。', difficulty: 'standard', domain: 'volume' },
  // idx 44: standard / volume
  { question: '日本の社内メールで1日に書かれる「お世話になっております」の総回数は？', hint: 'ビジネスメール送信者数×1人/日のメール送信数×冒頭挨拶率で分解。', difficulty: 'standard', domain: 'volume' },
  // idx 45: advanced / flow
  { question: '全国のオフィス会議室で1日に起きる「先方の都合で時間変更」の件数は？', hint: 'BtoB会議の1日件数×変更発生率で分解。リスケ多発業界（コンサル・営業）の比率も意識。', difficulty: 'advanced', domain: 'flow' },
  // idx 46: standard / volume
  { question: '日本のオフィスで1日に印刷される紙の総枚数は？', hint: 'ホワイトカラー人口×1人/日の印刷枚数で分解。ペーパーレス化進行率（業界差）も差し引こう。', difficulty: 'standard', domain: 'volume' },
  // idx 47: basic / volume
  { question: '日本の年賀状の年間発送枚数は何枚か？', hint: '世帯数×世帯あたり発送枚数で分解。年々減少傾向（デジタル化）も考慮。', difficulty: 'basic', domain: 'volume' },
  // idx 48: standard / volume
  { question: '日本の会社員が1年間に押す「Enterキー」の総回数は？', hint: 'PCワーカー人口×1人/日のEnter回数（メール送信＋検索＋コード実行など）×営業日で分解。', difficulty: 'standard', domain: 'volume' },
  // idx 49: advanced / volume
  { question: '日本の駅で1日に飲まれる自販機コーヒーの缶・ペットボトル本数は？', hint: '全国駅数×1駅の自販機台数×1台/日の販売本数のうちコーヒーの比率で分解。', difficulty: 'advanced', domain: 'volume' },
  // ── 新規12問（cost / flow 厚め・DF-F22） ──
  // idx 50: basic / cost
  { question: '美容室（スタッフ4人規模）の1ヶ月の人件費は何円か？', hint: 'スタッフ人数×1人あたり月給で分解。社会保険料の事業主負担（給与の約15%）も上乗せして考えよう。', difficulty: 'basic', domain: 'cost' },
  // idx 51: basic / flow
  { question: '昼12時台に、全国の牛丼チェーン店内で同時に食事している客は何人か？', hint: '店舗数×1店舗の客席数×昼ピークの満席率で、その瞬間に店内にいる人数を概算する。', difficulty: 'basic', domain: 'flow' },
  // idx 52: basic / unit
  { question: '街の個人経営パン屋の1日の売上は何円か？', hint: '1日の来店客数×客単価で分解。朝・昼の波と、1人が複数個買う点を意識しよう。', difficulty: 'basic', domain: 'unit' },
  // idx 53: basic / market
  { question: '日本の文房具市場の年間規模は何円か？', hint: '人口×1人あたり年間文房具支出で分解。学生・オフィス需要が中心で、単価は低いが購入頻度が高い。', difficulty: 'basic', domain: 'market' },
  // idx 54: standard / cost
  { question: 'コンビニ1店舗の1ヶ月の運営コスト（人件費＋光熱費＋本部ロイヤリティ）は何円か？', hint: '24時間営業の人件費（時給×シフト人数×時間）＋光熱費＋売上連動のロイヤリティで分解。', difficulty: 'standard', domain: 'cost' },
  // idx 55: standard / flow
  { question: '平日朝の通勤ラッシュ時、首都圏の鉄道に同時に乗車している人は何人か？', hint: '首都圏の鉄道通勤者数×ピーク時間帯に電車内にいる比率で、その瞬間の乗車人数を概算する。', difficulty: 'standard', domain: 'flow' },
  // idx 56: standard / cost
  { question: '中規模スーパー1店舗の年間の食品廃棄ロスは何円分か？', hint: '年間売上×生鮮・惣菜の構成比×その廃棄率で分解。値引きシール後も売れ残る分を意識しよう。', difficulty: 'standard', domain: 'cost' },
  // idx 57: standard / volume
  { question: '日本で1年間に消費される使い捨て割り箸は何膳か？', hint: '外食・中食の年間利用回数×割り箸が出る比率で分解。コンビニ弁当・テイクアウトも含めよう。', difficulty: 'standard', domain: 'volume' },
  // idx 58: advanced / cost
  { question: '東京の中規模オフィスビル（10階建て）の年間運営コストは何円か？', hint: '延床面積から、清掃・警備・設備保守・エレベータ・光熱費・固定資産税に分けて積み上げる。1坪あたり年間管理費の感覚を持とう。', difficulty: 'advanced', domain: 'cost' },
  // idx 59: advanced / flow
  { question: '日本国内で今この瞬間に「配送中（集荷済み・未配達）」の宅配荷物は何個あるか？', hint: '1日の宅配取扱個数×荷物が物流網に滞在する平均日数で、ストックとしての滞留個数を概算する（フロー×滞在時間＝ストック）。', difficulty: 'advanced', domain: 'flow' },
  // idx 60: advanced / unit
  { question: '大手回転寿司チェーン1店舗の年間営業利益は何円か？', hint: '年間売上から原価（売上の約45%）・人件費・賃料・光熱費を引いて利益を出す。低原価率と高回転がカギ。', difficulty: 'advanced', domain: 'unit' },
  // idx 61: advanced / unit
  { question: '個人開業の歯科医院1院の年間営業利益は何円か？', hint: '1日の患者数×診療単価×診療日数で売上を出し、人件費・材料費・賃料・設備リース料を引く。保険診療と自費診療の単価差も意識。', difficulty: 'advanced', domain: 'unit' },
  // ── 2026-06-14 追加: フェルミ100問（コンサル系＋古典） ──
  { question: '日本の化粧品（スキンケア＋メイクアップ）市場の年間規模は何円か？', hint: '対象人口（主に女性＋一部男性）×化粧品を使う割合×1人あたり年間支出 で分解。スキンケアとメイクで単価差が大きい点も意識しよう。', difficulty: 'standard', domain: 'market', theme: '化粧品' },
  { question: '日本のアパレル（衣料品小売）市場の年間規模は何円か？', hint: '人口×1人あたり年間衣料支出 で分解。世代・性別で購入頻度と単価が異なる。トップ・ボトム・アウターの点数感も意識しよう。', difficulty: 'standard', domain: 'market', theme: 'アパレル' },
  { question: '日本の家具・インテリア市場の年間規模は何円か？', hint: '世帯数×買い替え・新規購入する世帯の割合×1世帯あたり年間家具支出 で分解。引越し・新生活の発生率が需要のカギ。', difficulty: 'standard', domain: 'market', theme: '家具' },
  { question: '日本の100円ショップ業界の年間総売上は何円か？', hint: '全国店舗数×1店舗の1日売上×営業日数 で分解。客単価は数百円だが来店頻度と購入点数が多い点を意識しよう。', difficulty: 'basic', domain: 'unit', theme: '100均' },
  { question: '日本のクリーニング（洗濯代行）業界の年間市場規模は何円か？', hint: '世帯数×クリーニングを利用する世帯割合×1世帯あたり年間利用回数×1回あたり単価 で分解。スーツ・コート・ワイシャツなど点数と単価の構成を意識しよう。', difficulty: 'standard', domain: 'market', theme: 'クリーニング' },
  { question: '日本のコインランドリー店舗の1店舗あたり年間売上は何円か？', hint: '設置台数（洗濯機＋乾燥機）×1台の1日稼働回数×1回あたり料金×365日 で分解。週末・梅雨時の稼働の偏りも意識しよう。', difficulty: 'standard', domain: 'unit', theme: 'コインランドリー' },
  { question: '日本の書店（紙の本のリアル店舗）の年間総売上は何円か？', hint: '全国書店数×1店舗の1日売上×営業日数 で分解。雑誌・コミック・書籍の構成比と客単価を意識しよう。電子・ネット書店との代替も差し引いて考える。', difficulty: 'basic', domain: 'unit', theme: '書店' },
  { question: '日本の玩具（おもちゃ）市場の年間規模は何円か？', hint: '対象となる子ども人口×1人あたり年間玩具支出 で分解。クリスマス・誕生日に支出が集中する点と、大人向けホビーの上乗せも意識しよう。', difficulty: 'basic', domain: 'market', theme: '玩具' },
  { question: '日本のサプリメント（健康食品）市場の年間規模は何円か？', hint: '成人人口×サプリ常用率×1人あたり年間サプリ支出 で分解。定期購入（サブスク）と都度購入で単価感が違う点を意識しよう。', difficulty: 'standard', domain: 'market', theme: 'サプリ' },
  { question: '日本の中食（惣菜・弁当などの調理済み食品）市場の年間規模は何円か？', hint: '人口×中食を利用する人の割合×1人あたり年間中食支出 で分解。コンビニ・スーパー惣菜・弁当店など販路の広さを意識しよう。', difficulty: 'standard', domain: 'market', theme: '中食' },
  { question: '日本のネイルサロン業界の年間市場規模は何円か？', hint: '利用者数×1人あたり年間来店回数×1回あたり施術単価 で分解。利用はほぼ女性に偏り、定期メンテで来店頻度が高い点を意識しよう。', difficulty: 'standard', domain: 'market', theme: 'ネイルサロン' },
  { question: '日本のリユース（中古品・古着）小売市場の年間規模は何円か？', hint: '人口×中古品を買う人の割合×1人あたり年間中古購入額 で分解。フリマアプリと実店舗の両チャネルを足し合わせよう。', difficulty: 'standard', domain: 'market', theme: 'リユース' },
  { question: '日本の学習塾・予備校業界の年間市場規模は何円か？', hint: '小中高生人口×通塾率×1人あたり年間塾費用 で分解。学年が上がるほど通塾率と単価が高くなる点を意識しよう。', difficulty: 'standard', domain: 'market', theme: '学習塾' },
  { question: '日本国内のクラウドインフラ（IaaS/PaaS）市場の年間売上規模は何円か？', hint: '日本の法人数×クラウド導入率×1社あたり年間クラウド支出 で分解。中小企業は数万円規模、大企業は数億円規模と支出が大きく偏る点に注意。', difficulty: 'advanced', domain: 'market', theme: 'クラウドインフラ' },
  { question: '日本国内のサイバーセキュリティ市場の年間規模は何円か？', hint: '法人数×セキュリティ対策実施率×1社あたり年間セキュリティ支出 で分解。製品（ソフト/機器）とサービス（監視・コンサル）の両方を含めよう。', difficulty: 'advanced', domain: 'market', theme: 'サイバーセキュリティ' },
  { question: '日本の人材紹介（転職エージェント）業界の年間総売上は何円か？', hint: '年間転職者数×エージェント経由比率×1人あたり紹介手数料（理論年収の約30〜35%）で分解。中途採用の年収水準がカギ。', difficulty: 'advanced', domain: 'market', theme: '人材紹介' },
  { question: '日本の会計ソフト（クラウド＋パッケージ）市場の年間規模は何円か？', hint: '法人数×会計ソフト利用率×1社あたり年間ソフト支出＋個人事業主分 で分解。中小はクラウド月額数千円、大企業はERP規模で単価差が大きい。', difficulty: 'standard', domain: 'market', theme: '会計ソフト' },
  { question: '日本の介護サービス（在宅＋施設）市場の年間規模は何円か？', hint: '要介護認定者数×サービス利用率×1人あたり年間介護費 で分解。在宅と施設入所で単価が大きく異なる点を意識しよう。', difficulty: 'advanced', domain: 'market', theme: '介護' },
  { question: '日本の調剤薬局業界の年間総売上（調剤報酬ベース）は何円か？', hint: '全国の調剤薬局店舗数×1店舗の1日処方箋枚数×処方箋1枚あたり単価×営業日数 で分解。技術料＋薬剤費を含めて考えよう。', difficulty: 'standard', domain: 'unit', theme: '調剤薬局' },
  { question: '日本の動物病院業界の年間総売上は何円か？', hint: '全国の動物病院数×1院の1日来院数×1回あたり診療単価×診療日数 で分解。ペット保険普及で単価が上昇している点も意識。', difficulty: 'standard', domain: 'unit', theme: '動物病院' },
  { question: '日本の学習塾・予備校業界の年間市場規模は何円か？', hint: '小中高生人口×通塾率×1人あたり年間塾費用 で分解。学年（受験学年は高単価）や個別/集団の形態差も意識しよう。', difficulty: 'standard', domain: 'market', theme: '学習塾' },
  { question: '日本の物流倉庫（賃貸ロジスティクス施設）市場の年間賃料規模は何円か？', hint: '全国の物流倉庫の総延床面積×坪あたり月額賃料×12ヶ月 で分解。EC拡大で大型物流施設の供給が増えている点を意識。', difficulty: 'advanced', domain: 'market', theme: '物流倉庫' },
  { question: '日本のキャッシュレス決済の年間取扱高（決済額）は何円か？', hint: '個人消費支出総額×キャッシュレス比率 で分解。クレジット＋電子マネー＋コード決済の構成を意識しよう。', difficulty: 'standard', domain: 'market', theme: '決済' },
  { question: '日本の中古品リユース（二次流通）市場の年間規模は何円か？', hint: '人口×フリマ/中古売買利用率×1人あたり年間取引額 で分解。フリマアプリ・店舗買取・ネットオークションの合計で考えよう。', difficulty: 'standard', domain: 'market', theme: '中古品リユース' },
  { question: '日本のオンライン教育（社会人向けeラーニング・リスキリング）市場の年間規模は何円か？', hint: '労働力人口×受講率×1人あたり年間受講料 で分解。個人課金と法人（企業研修）導入の両方を含めよう。', difficulty: 'standard', domain: 'market', theme: 'オンライン教育(社会人)' },
  { question: '日本の健康診断・人間ドック市場の年間規模は何円か？', hint: '対象人口（就労者＋希望者）×受診率×1人あたり受診単価 で分解。定期健診（低単価・高受診率）と人間ドック（高単価）を分けて考えよう。', difficulty: 'standard', domain: 'market', theme: '健康診断' },
  { question: '国内のある大規模空港の保安検査場が、朝のピーク1時間に処理する旅客は何人か？', hint: '検査レーン数×1レーンの1時間処理人数で分解。1レーンは1人あたり処理時間（約15〜20秒）の逆数で時間あたり人数が出る。', difficulty: 'standard', domain: 'flow', theme: '保安検査スループット' },
  { question: '大手通販企業のコールセンターが1日に応答する入電件数は何件か？', hint: '稼働オペレーター数×1人/時の処理件数×1日の稼働時間で分解。1件あたり平均通話時間（約5〜8分）から1時間あたり件数を出す。', difficulty: 'standard', domain: 'flow', theme: 'コールセンター処理量' },
  { question: 'EC物流センター1拠点が1日に出荷する商品の梱包個数は何個か？', hint: 'ピッカー数×1人/時のピック件数×稼働時間、または出荷ライン数×ラインのスループットで分解。繁忙期と平常期の差も意識。', difficulty: 'standard', domain: 'flow', theme: '物流センター出荷' },
  { question: '都市銀行のATM1台が1日に処理する取引件数は何件か？', hint: '稼働時間×1時間あたり利用件数で分解。1件あたり所要時間（約1〜2分）とピーク時間帯の混雑から平均利用率を見積もる。', difficulty: 'basic', domain: 'flow', theme: 'ATM稼働' },
  { question: '大学病院1施設の外来診療科が1日に診察する患者数は何人か？', hint: '稼働診察室数×1室/日の患者数で分解。1患者あたり診察時間（約10〜15分）と午前中心の診療時間から1室の処理数を出す。', difficulty: 'standard', domain: 'flow', theme: '病院外来数' },
  { question: '大型スーパーのレジ1台が、夕方ピークの1時間に処理する会計件数は何件か？', hint: '1人あたり会計時間（約1〜2分）の逆数で1時間あたり件数を出し、レジの待ち行列が常に埋まる前提で稼働率をかける。', difficulty: 'basic', domain: 'flow', theme: 'レジ処理' },
  { question: '都市間高速道路のある1区間を、平日24時間に通過する車両は何台か？', hint: '車線数×1車線あたり1時間の交通量×時間帯別の係数で分解。ピーク時は1車線あたり処理容量（約1,800〜2,000台/時）に近づく。', difficulty: 'standard', domain: 'flow', theme: '高速道路交通量' },
  { question: '大規模データセンター1施設が常時消費している電力は何kWか？', hint: 'ラック数×1ラックあたり消費電力×PUE（電力使用効率, 約1.3〜1.5）で分解。IT機器の電力に冷却分を上乗せして総電力を出す。', difficulty: 'advanced', domain: 'volume', theme: 'データセンタ電力' },
  { question: '大手宅配会社のドライバー1人が1日に配達する荷物は何個か？', hint: '稼働時間×1時間あたり配達個数で分解。1個あたり所要時間（移動＋手渡し, 約3〜5分）と再配達分の差し引きも意識する。', difficulty: 'basic', domain: 'flow', theme: 'ラストワンマイル処理' },
  { question: 'テーマパークの人気アトラクション1基が、1日に乗せられる来園者は何人か？', hint: '1サイクルの定員×1時間あたりサイクル数×運営時間で分解。乗降・安全確認込みの1サイクル時間からスループットを出す。', difficulty: 'standard', domain: 'flow', theme: 'アトラクション処理能力' },
  { question: '繁忙時間帯に、大手フードデリバリーのある都市内で同時に配達中の注文は何件あるか？', hint: '1時間あたり注文数×1件が配達に要する平均時間（約30分=0.5時間）で、同時に走っている注文数（フロー×滞在時間＝ストック）を概算する。', difficulty: 'advanced', domain: 'flow', theme: 'デリバリー同時稼働' },
  { question: '大手銀行のコールセンターで、入電のピーク10分間に「待ち行列」に並んでいる顧客は平均何人か？', hint: '1分あたり入電数×平均待ち時間（分）で、待ち行列の長さ（到着率×滞在時間＝行列内人数）を概算する。応答可能オペレーター数の不足分が待ちを生む。', difficulty: 'advanced', domain: 'flow', theme: '待ち行列の長さ' },
  { question: '24時間ジム1店舗が黒字化するために必要な会員数は何人か？', hint: '月間の固定費（賃料＋人件費＋マシンリース＋光熱費）÷ 会員1人あたり月会費で、損益分岐の会員数を出す（固定費 ÷ 単価）。', difficulty: 'standard', domain: 'unit', theme: '損益分岐' },
  { question: '動画サブスク1契約者の生涯価値（LTV）は何円か？', hint: '月額料金 × 平均継続月数 × 粗利率 で1人あたりの生涯価値を出す（継続月数は 1 ÷ 月次解約率で近似）。', difficulty: 'standard', domain: 'unit', theme: 'LTV' },
  { question: '国内主要都市間の新規航空1路線が年間に見込める潜在旅客数は何人か？', hint: '両都市圏の人口 × 年間に相手都市へ移動する人の割合 × 航空機の利用分担率 で潜在需要を出す（新幹線・高速バスとの分担に注意）。', difficulty: 'advanced', domain: 'market', theme: '路線需要' },
  { question: '郊外ロードサイドに新規出店するファミリーレストラン1店舗の年商見込みは何円か？', hint: '商圏人口 × 1人あたり年間来店回数 × 客単価 で年商を見積もる（商圏は車5分圏で設定）。', difficulty: 'standard', domain: 'unit', theme: '新規出店' },
  { question: '年間売上12億円のSaaS企業の粗利（売上総利益）は何円か？', hint: '年間売上 × 粗利率 で算出。粗利率はクラウド原価（サーバ・サポート・決済手数料）を売上から引いた残りで考える（SaaSは粗利率が高い）。', difficulty: 'advanced', domain: 'cost', theme: '粗利' },
  { question: 'サブスクアプリが1人の有料会員獲得コスト（CAC）を回収するまで何ヶ月かかるか？', hint: 'CAC ÷（月額料金 × 粗利率）で回収月数を出す（広告費 ÷ 会員あたり月次粗利）。', difficulty: 'advanced', domain: 'unit', theme: 'CAC回収' },
  { question: '郊外に新設するEV急速充電ステーション（4口）が採算を取るには1日何台の充電が必要か？', hint: '月間の必要利益額（固定費）÷ 1回あたりの粗利（充電単価×（1−電気代原価率））÷ 30日 で1日の必要台数を出す。', difficulty: 'advanced', domain: 'flow', theme: 'EV充電採算' },
  { question: '新規参入する家事代行サービスが都市部で狙える年間市場規模は何円か？', hint: '対象世帯数（共働き・高所得）× 利用率 × 1世帯あたり年間支出 で市場規模を出す（潜在顧客の絞り込みが肝）。', difficulty: 'advanced', domain: 'market', theme: '市場参入' },
  { question: '新規出店したカフェ1店舗が初期投資（内装・設備）を回収するのに何年かかるか？', hint: '初期投資額 ÷ 年間営業利益 で回収年数を出す（年間営業利益＝年商 × 営業利益率）。', difficulty: 'standard', domain: 'cost', theme: '店舗回収' },
  { question: '無人コインランドリー1店舗の1ヶ月の売上は何円か？', hint: '洗濯機・乾燥機の台数 × 1台あたり1日稼働回数 × 1回単価 × 30日 で月商を出す（台数 × 稼働 × 単価）。', difficulty: 'basic', domain: 'unit', theme: 'コインランドリー' },
  { question: 'フランチャイズ本部が加盟店100店から年間に得るロイヤリティ収入は何円か？', hint: '加盟店数 × 1店舗の年商 × ロイヤリティ率 で本部収入を出す（店数 × 店年商 × 料率）。', difficulty: 'standard', domain: 'flow', theme: 'フランチャイズ' },
  { question: '新規参入アパレルEC（年商10億円）が1年間に抱える売れ残り在庫の評価損は何円か？', hint: '年間仕入原価 × 売れ残り率 × 値引き処分による損失率 で評価損を出す（原価 × 残率 × 損率）。', difficulty: 'advanced', domain: 'cost', theme: '在庫回転' },
  { question: 'ジャンボジェット機（ボーイング747クラス）の機内を空にして、ゴルフボールで隙間なく詰めると何個入るか？', hint: '機内のおおよその容積 ÷ ゴルフボール1個の占有体積（球の体積÷詰め込み効率0.6〜0.7）で分解。A÷B×充填率の型。', difficulty: 'standard', domain: 'volume', theme: '詰め込み・容積' },
  { question: '一般的な学校の教室1部屋を、ピンポン玉で天井まで隙間なく満たすには何個必要か？', hint: '教室の容積（床面積×天井高）÷ ピンポン玉1個の占有体積（球体積÷充填率）で分解。', difficulty: 'basic', domain: 'volume', theme: '詰め込み・容積' },
  { question: '東京ドームの内部空間を水で満たすには、何リットルの水が必要か？', hint: '東京ドームの容積（約124万m³）×（1m³＝1,000L）で分解。容積×単位換算の型。', difficulty: 'basic', domain: 'volume', theme: '巨大容積' },
  { question: '学校の25mプール1杯分の水は、おおよそ何リットルか？', hint: '縦×横×平均水深で容積（m³）を出し、1m³＝1,000Lで換算する。長方形プールの容積×単位換算の型。', difficulty: 'basic', domain: 'volume', theme: '巨大容積' },
  { question: '長さ100m・幅50m・厚さ1mの砂浜にある砂粒は、全部でおよそ何粒か？', hint: '砂浜の体積 ÷ 砂粒1個の体積（直径約0.3mmの立方体換算）で分解。充填率も掛ける。巨大体積÷微小体積の型。', difficulty: 'advanced', domain: 'volume', theme: '微小×巨大' },
  { question: '300ページの文庫本1冊には、おおよそ何文字が印刷されているか？', hint: '1ページの行数×1行の文字数×ページ数で分解。A×B×Cの型。', difficulty: 'basic', domain: 'volume', theme: '文字・印刷物' },
  { question: '蔵書20万冊の中規模図書館には、全部でおよそ何単語が収められているか？', hint: '蔵書数×1冊あたりの平均単語数（ページ数×1ページの単語数）で分解。A×（B×C）の型。', difficulty: 'standard', domain: 'volume', theme: '文字・蔵書' },
  { question: '通学用スクールバス1台の内部を空にしてテニスボールで満たすと、何個入るか？', hint: 'バス車内のおおよその容積（全長×幅×高さ）÷ テニスボール1個の占有体積（球体積÷充填率）で分解。', difficulty: 'standard', domain: 'volume', theme: '詰め込み・容積' },
  { question: '家庭用の冷蔵庫（容量約400L）の中を、1円玉で隙間なく満たすと何枚入るか？', hint: '冷蔵庫の容積 ÷ 1円玉1枚の占有体積（円柱体積÷充填率）で分解。容積÷単体積×充填率の型。', difficulty: 'standard', domain: 'volume', theme: '詰め込み・容積' },
  { question: '学校の25mプール1杯分の水には、おおよそ何滴分の水が入っているか？', hint: 'プールの総体積（mL換算）÷ 水1滴の体積で分解。1滴は約0.05mL。巨大体積÷微小体積の型。', difficulty: 'standard', domain: 'volume', theme: '微小×巨大' },
  { question: '大人が無理なく入れる満員のエレベーター1基には、ビー玉なら何個詰め込めるか？', hint: 'エレベーターのかご容積 ÷ ビー玉1個の占有体積（球体積÷充填率）で分解。', difficulty: 'basic', domain: 'volume', theme: '詰め込み・容積' },
  { question: '標準的なコンテナ船1隻が運ぶ砂利を全部数えると、小石はおよそ何個になるか？', hint: '船の積載容積 ÷ 小石1個の体積（直径約1cmの球換算）で分解。充填率も掛ける。巨大体積÷微小体積の型。', difficulty: 'advanced', domain: 'volume', theme: '微小×巨大' },
  { question: '標準的な20フィート海上コンテナ1個を、サッカーボールで隙間なく満たすと何個入るか？', hint: 'コンテナの内容積（約33m³）÷ サッカーボール1個の占有体積（球体積÷充填率）で分解。', difficulty: 'standard', domain: 'volume', theme: '詰め込み・容積' },
  { question: '人の頭髪は全部で約何本生えているか？', hint: '頭皮の面積×1cm²あたりの毛穴密度で分解。頭頂部だけでなく側頭・後頭まで含めた有毛面積で考える。', difficulty: 'basic', domain: 'volume', theme: '頭髪' },
  { question: '人が一生（80年）の間に打つ心拍の総回数は約何回か？', hint: '1分あたり心拍数×60分×24時間×365日×寿命で分解。安静時と活動時で多少変わるが代表値で概算する。', difficulty: 'basic', domain: 'flow', theme: '心拍' },
  { question: '人が一生（80年）の間にする呼吸の総回数は約何回か？', hint: '1分あたり呼吸数×60分×24時間×365日×寿命で分解。安静時の呼吸数を代表値に使う。', difficulty: 'basic', domain: 'flow', theme: '呼吸' },
  { question: '人が一生（80年）の間にするまばたきの総回数は約何回か？', hint: '1分あたりまばたき回数×起きている時間（分）×365日×寿命で分解。睡眠中はまばたきしない点に注意。', difficulty: 'standard', domain: 'flow', theme: 'まばたき' },
  { question: '成人の体は全部で約何個の細胞からできているか？', hint: '体重（≒水と組織の質量）÷細胞1個あたりの平均質量で分解。細胞の大きさを1辺10〜20μmの立方体と見て質量を見積もる。', difficulty: 'advanced', domain: 'volume', theme: '細胞数' },
  { question: '人の頭から1日に抜ける髪の毛は約何本か？', hint: '頭髪の総本数×1日に抜け落ちる割合で分解。髪は約数年で生え替わるサイクルがあり、その回転から日々の脱毛率を出す。', difficulty: 'standard', domain: 'flow', theme: '抜け毛' },
  { question: '成人の体内を流れる血液は全部で約何リットルか？', hint: '体重×血液が占める割合（体重の約7〜8%）で分解。血液の密度は水とほぼ同じとみてkgからLへ換算する。', difficulty: 'basic', domain: 'volume', theme: '血液量' },
  { question: '人が一生（80年）の間に歩く距離は約何kmか？', hint: '1日あたりの歩数×歩幅でその日の距離を出し、365日×歩く年数（幼児期を除く）で積み上げる。', difficulty: 'standard', domain: 'unit', theme: '歩行距離' },
  { question: '中型犬が一生（約13年）の間に食べるドッグフードは合計で約何kgか？', hint: '1日あたりの給餌量×365日×寿命で分解。子犬期と成犬期で量が多少変わるが代表値で概算する。', difficulty: 'standard', domain: 'unit', theme: '犬の食事量' },
  { question: '人が一生（80年）の間に流す涙の総量は約何リットルか？', hint: '1日あたりの基礎分泌量×365日×寿命で分解。泣くときの大量分泌は例外として、目を潤すための日常分泌を主に見積もる。', difficulty: 'standard', domain: 'volume', theme: '涙' },
  { question: '人が一生（80年）の間に飲む水分（飲料）の総量は約何リットルか？', hint: '1日あたりの飲水量×365日×寿命で分解。食事に含まれる水分は除き、飲み物として口にする量を見積もる。', difficulty: 'standard', domain: 'volume', theme: '飲水量' },
  { question: '人の体の皮膚から1年間に剥がれ落ちる垢（角質細胞）は約何gか？', hint: '1日に剥がれ落ちる角質の質量×365日で分解。皮膚は約1ヶ月で入れ替わるため、表皮角質層の総質量÷入れ替わり日数で日々の量を出す。', difficulty: 'advanced', domain: 'flow', theme: '皮膚の代謝' },
  { question: '大きく育った1本のオーク（樫）の木には、葉が何枚ついているか？', hint: '太い枝の本数×太枝あたりの小枝数×小枝あたりの葉の枚数で分解。または「樹冠の体積×単位体積あたりの葉密度」でも近づける。', difficulty: 'standard', domain: 'volume', theme: '植物' },
  { question: '1回の夕立で、面積1平方キロメートルの土地に降る雨粒の総数は何粒か？', hint: '降水量（mm）×面積で総水量を出し、それを雨粒1粒の体積で割って分解。雨粒の直径を約2mmと仮定すると体積が出る。', difficulty: 'advanced', domain: 'volume', theme: '気象' },
  { question: '赤道に沿って地球を一周するには、人は何歩あるく必要があるか？', hint: '地球の円周÷1歩の歩幅で分解。円周は約4万km、歩幅は約0.7mと置く。', difficulty: 'basic', domain: 'unit', theme: '地理' },
  { question: '富士山を山ごと10トンダンプで運び去るには、トラックは何台必要か？', hint: '山の体積（円錐近似：底面積×高さ÷3）×岩石の密度で総質量を出し、1台の積載質量で割る。岩石密度は約2.6t/m³。', difficulty: 'advanced', domain: 'volume', theme: '地形' },
  { question: '地球上のすべての海水を、10リットルのバケツでくむと何杯分になるか？', hint: '海洋の総体積（海の面積×平均水深）をリットルに直し、バケツ1杯の容量で割る。1m³＝1000Lを使う。', difficulty: 'advanced', domain: 'volume', theme: '海洋' },
  { question: '晴れた夜空に、肉眼で見える星はおよそ何個か？', hint: '全天で肉眼で見える星の総数のうち、地平線より上の半分が見える。さらに光害や視界の悪さで実際に見える割合を掛けて分解。', difficulty: 'standard', domain: 'volume', theme: '天文' },
  { question: '地球全体で、1日に発生する落雷（地面への放電）はおよそ何回か？', hint: '「1秒あたりの地球全体の落雷回数」×1日の秒数で分解。あるいは同時に活動している雷雨の数×1雷雨あたりの放電頻度でも近づける。', difficulty: 'advanced', domain: 'flow', theme: '気象' },
  { question: '野球場ほどの広さの砂浜には、砂粒が何粒あるか？', hint: '砂浜の体積（面積×砂の深さ）を砂粒1粒の体積で割って分解。砂粒の直径を約0.5mmと仮定し、すき間（空隙率）も考慮する。', difficulty: 'advanced', domain: 'volume', theme: '海岸' },
  { question: '日本全国に、1年間に降る雨と雪を合わせた総水量は何トンか？', hint: '国土面積×年間平均降水量（深さ）で総体積を出し、水の密度（1トン/m³）で質量に直す。降水量はm単位に直すこと。', difficulty: 'standard', domain: 'flow', theme: '気象' },
  { question: '光の速さで進む宇宙船で、太陽から最も近い恒星まで行くには何年かかるか？', hint: 'その恒星までの距離÷光速で分解。距離をkmで置き、光速を約30万km/秒として秒数を出し、年に直す。', difficulty: 'advanced', domain: 'unit', theme: '天文' },
  { question: '上空に浮かぶ積雲ひとつには、水（雲粒）が合計で何トン含まれているか？', hint: '雲の体積（立方体や球で近似）×雲の水分密度で分解。積雲の差し渡しを約1kmと置くと体積が出る。水分密度は1m³あたり約0.5gと薄い。', difficulty: 'standard', domain: 'volume', theme: '気象' },
  { question: '森林1平方キロメートルに生息している昆虫はおよそ何匹か？', hint: '1平方メートルあたりの昆虫の個体数×面積（100万m²）で分解。土壌中・落ち葉・樹上を合わせた密度で考える。', difficulty: 'advanced', domain: 'volume', theme: '生態' },
  { question: '東京都内にピアノ調律師は何人いるか？', hint: '世帯数×ピアノ保有率×1台あたり年間調律回数で「年間の調律需要件数」を出し、調律師1人が年にこなせる件数で割る（A×B÷C）。', difficulty: 'standard', domain: 'market', theme: 'classic-piano-tuner' },
  { question: '日本全国にピアノ調律師は何人いるか？', hint: '全国のピアノ総保有台数×1台あたり年間調律回数で年間調律需要を出し、調律師1人の年間処理件数で割る（A×B÷C）。都市版を全国へスケールしてもよい。', difficulty: 'standard', domain: 'market', theme: 'classic-piano-tuner-national' },
  { question: '東京23区にあるマンホールの蓋は何枚あるか？', hint: '総道路延長÷マンホール1枚あたりの間隔で本数を概算する（下水・電気・通信など系統ごとに重なる点も意識）。距離÷間隔の型。', difficulty: 'standard', domain: 'unit', theme: 'classic-manholes' },
  { question: '日本全国に信号機（交差点）は何基あるか？', hint: '人口÷1万人あたり、つまり人口×1万人あたり信号機数で概算する（A×B）。市街地面積あたりの交差点数で出してもよい。', difficulty: 'standard', domain: 'unit', theme: 'classic-traffic-signals' },
  { question: '日本のパン屋・工場で1日に焼かれるパンは何個（何斤相当）か？', hint: '人口×パンを食べる人の割合×1人あたり1日のパン消費量（個・斤換算）で分解する。朝食・サンドイッチ・菓子パンを合算（A×B）。', difficulty: 'basic', domain: 'volume', theme: 'classic-bread-baked' },
  { question: '日本全国の自動販売機を1列に並べると、その総延長は何kmか？', hint: '全国の自販機台数×1台あたりの幅で総延長を出す（A×B）。台数は飲料以外も含めて概算。', difficulty: 'basic', domain: 'unit', theme: 'classic-vending-distance' },
  { question: '日本全国のタクシーが1日に走る総走行距離は何kmか？', hint: '全国のタクシー台数×1台あたり1日の走行距離で分解する（A×B）。実車・空車の両方を含む総走行で考える。', difficulty: 'standard', domain: 'flow', theme: 'classic-taxi-distance' },
  { question: 'カタツムリが日本列島を縦断（北海道から鹿児島まで）するのに何時間かかるか？', hint: '縦断距離÷カタツムリの移動速度で時間を出す（距離÷速度）。休まず進む前提の理論値で考える。', difficulty: 'standard', domain: 'unit', theme: 'classic-snail-japan' },
  { question: '東京23区にある街灯（道路照明灯）は何基あるか？', hint: '区内の道路総延長÷街灯1基あたりの設置間隔で本数を概算する（距離÷間隔）。', difficulty: 'standard', domain: 'unit', theme: 'classic-streetlights' },
  { question: '日本の理美容師が1日に行うヘアカットは合計で何件か？', hint: '人口÷平均来店間隔（日数）で1日の来店需要を出すか、理美容師数×1人1日の施術件数で出す（A÷B または A×B）。', difficulty: 'standard', domain: 'flow', theme: 'classic-haircuts-time' },
  { question: '1人の人間が一生のうちに伸びる髪の毛の総延長は何mか？（毛1本ではなく全頭分の合計）', hint: '髪の伸びる速さ×寿命で1本の生涯成長長を出し、頭髪の本数を掛ける（A×B×C）。抜け替わりを考慮した概算でよい。', difficulty: 'advanced', domain: 'volume', theme: 'classic-hair-length' },
  { question: '日本人が1年間に食べるお米は合計で何粒か？', hint: '国内の年間米消費量（重量）÷米1粒の重さで粒数に換算する（A÷B）。1合や茶碗1杯の粒数から積み上げてもよい。', difficulty: 'advanced', domain: 'volume', theme: 'classic-rice-grains' },
  { question: '日本で1年間に消費（購入）されるビニール傘は何本か？', hint: '人口×ビニール傘を使う人の割合×1人あたり年間ビニール傘購入本数で分解する（A×B）。雨の日に置き忘れ・買い直す頻度を意識。', difficulty: 'basic', domain: 'volume', theme: 'classic-umbrellas' },
]

const FERMI_POOL_EN: FermiQuestion[] = [
  // F19: global-topic pool (en). Approved & audited 50 questions (basic10/standard23/advanced17).
  // Source: scripts/dogfood/f19_final.json. Globalized to US / world figures (no JP-only topics, no ¥).
  // difficulty/domain tags migrated from f19_final.json (difficulty) + theme→domain mapping from §2-B.
  // idx 0: basic / market (market-sizing)
  { question: 'What is the annual revenue (USD) of the coffee-chain café market in the United States?', hint: 'Start from US adults who buy café coffee, multiply by visits per week and spend per visit, then annualize. Coffee drinkers vs. chain buyers is the first split.', difficulty: 'basic', domain: 'market', theme: 'market-sizing' },
  // idx 1: standard / flow (platform-supply-demand)
  { question: 'How many ride-hailing drivers are actively on the road at 6pm on a typical weekday across the United States?', hint: 'Estimate concurrent ride demand (rides happening at once) from daily rides ÷ active hours, then convert to drivers using utilization. Demand-side first, then supply.', difficulty: 'standard', domain: 'flow', theme: 'platform-supply-demand' },
  // idx 2: standard / unit (unit-economics)
  { question: 'What is the annual revenue (USD) of a single busy urban fast-food restaurant?', hint: 'Build from transactions per hour during peak and off-peak, average ticket, and operating hours per day, then annualize over operating days.', difficulty: 'standard', domain: 'unit', theme: 'unit-economics' },
  // idx 3: advanced / volume (national-sizing)
  { question: 'What is the annual revenue (USD) of the haircut and salon services market in the United States, estimated both top-down and bottom-up?', hint: 'Bottom-up: people × cuts/year × price. Top-down: number of salons × revenue per salon. Reconcile the two and explain the gap.', difficulty: 'advanced', domain: 'volume', theme: 'national-sizing' },
  // idx 4: basic / market (market-sizing)
  { question: 'What is the annual revenue (USD) of the pet food market in the United States?', hint: 'Households with pets × pets per household × annual food spend per pet. Split dogs vs. cats since spend per animal differs.', difficulty: 'basic', domain: 'market', theme: 'market-sizing' },
  // idx 5: advanced / flow (platform-concurrency)
  { question: 'How many people are watching a major video-streaming platform (e.g., a Netflix-scale service) simultaneously during global prime time?', hint: 'Start from subscriber base, daily active share, average daily watch time, then convert to concurrency at the global peak hour accounting for time zones.', difficulty: 'advanced', domain: 'flow', theme: 'platform-concurrency' },
  // idx 6: standard / volume (national-sizing)
  { question: 'How many gallons of gasoline are sold for passenger vehicles in the United States per year?', hint: 'Vehicles × annual miles driven × average fuel economy (miles per gallon). Use passenger cars/light trucks only.', difficulty: 'standard', domain: 'volume', theme: 'national-sizing' },
  // idx 7: standard / unit (unit-economics)
  { question: 'What is the annual revenue (USD) of a single 120-room mid-scale hotel running at typical occupancy?', hint: 'Rooms × occupancy × average daily rate × 365 for room revenue, then add a markup for food/beverage and other services.', difficulty: 'standard', domain: 'unit', theme: 'unit-economics' },
  // idx 8: advanced / volume (market-sizing → national-sizing path; mapped to volume)
  { question: 'How many smartphones are sold worldwide per year, estimated top-down and bottom-up?', hint: 'Bottom-up: installed base ÷ replacement cycle + new first-time buyers. Top-down: regional populations × penetration × turnover. Reconcile.', difficulty: 'advanced', domain: 'volume', theme: 'market-sizing' },
  // idx 9: standard / flow (platform-supply-demand)
  { question: 'How many food-delivery orders are placed through apps in the United States on a typical Friday evening (5–9pm)?', hint: 'Estimate ordering households in metros, the share that orders delivery on a peak Friday, and confine it to the 4-hour dinner window.', difficulty: 'standard', domain: 'flow', theme: 'platform-supply-demand' },
  // idx 10: basic / volume (national-sizing)
  { question: 'How many disposable diapers are used in the United States per year?', hint: 'Number of children still in diapers × diaper changes per day × 365. Anchor on births per year and the years a child stays in diapers.', difficulty: 'basic', domain: 'volume', theme: 'national-sizing' },
  // idx 11: advanced / unit (unit-economics)
  { question: 'What annual recurring revenue (USD) does a B2B SaaS startup reach 3 years after launch if it adds 200 paying customers per month at 2% monthly churn?', hint: 'Track the customer base month over month: additions minus churn compound into a partially-saturated base, then multiply by annual revenue per customer.', difficulty: 'advanced', domain: 'unit', theme: 'unit-economics' },
  // idx 12: standard / market (market-sizing)
  { question: 'How many airline passenger seats are sold (passenger boardings) worldwide per year?', hint: 'Start from annual passengers (trips, not unique people), or build from aircraft fleet × seats × flights/day × load factor. Cross-check the two.', difficulty: 'standard', domain: 'market', theme: 'market-sizing' },
  // idx 13: advanced / flow (platform-concurrency)
  { question: 'How many messages are sent across the world\'s largest messaging platform during its single busiest minute of the year?', hint: 'Annual or daily message volume → average per second, then apply a peak multiplier for an event (e.g., New Year) when many time zones celebrate at once.', difficulty: 'advanced', domain: 'flow', theme: 'platform-concurrency' },
  // idx 14: advanced / volume (national-sizing)
  { question: 'What is the total annual residential electricity consumption (kWh) in the United States, via household and via per-capita routes?', hint: 'Route A: households × kWh per household per year. Route B: population × per-capita residential kWh. Reconcile and note what differs.', difficulty: 'advanced', domain: 'volume', theme: 'national-sizing' },
  // idx 15: basic / market (market-sizing)
  { question: 'What is the annual retail revenue (USD) of the global chocolate market?', hint: 'Population in chocolate-consuming regions × kg consumed per person per year × retail price per kg. Weight consumption heavily toward wealthier regions.', difficulty: 'basic', domain: 'market', theme: 'market-sizing' },
  // idx 16: standard / unit (unit-economics)
  { question: 'What is the annual revenue (USD) of a single mid-size commercial fitness gym, and how many members visit per day?', hint: 'Revenue = members × monthly dues × 12, plus add-ons. Daily visits = members × the fraction who actually show up on an average day.', difficulty: 'standard', domain: 'unit', theme: 'unit-economics' },
  // idx 17: standard / flow (platform-supply-demand)
  { question: 'How many short-term-rental (e.g., Airbnb-style) listings are occupied on a peak summer Saturday night in the United States?', hint: 'Estimate total active US listings, then apply a high-season Saturday occupancy rate. Active supply first, then utilization.', difficulty: 'standard', domain: 'flow', theme: 'platform-supply-demand' },
  // idx 18: basic / volume (national-sizing)
  { question: 'How many cups of coffee (all sources: home, office, café) are consumed in the United States per day?', hint: 'Coffee-drinking adults × cups per drinker per day. Anchor on the share of adults who drink coffee and typical daily cups.', difficulty: 'basic', domain: 'volume', theme: 'national-sizing' },
  // idx 19: advanced / market (market-sizing)
  { question: 'What is the annual global revenue (USD) of the mobile-games market, via player route and via top-down app-store route?', hint: 'Player route: players × paying-user rate × annual spend per payer. Top-down: total consumer app-store spend × games share. Reconcile.', difficulty: 'advanced', domain: 'market', theme: 'market-sizing' },
  // idx 20: standard / unit (unit-economics)
  { question: 'What is the annual revenue (USD) of a single large suburban supermarket?', hint: 'Transactions per day (customers through checkout) × average basket size × operating days. Build the customer count from peak and off-peak flow.', difficulty: 'standard', domain: 'unit', theme: 'unit-economics' },
  // idx 21: standard / volume (national-sizing)
  { question: 'How many new passenger cars and light trucks are sold in the United States per year?', hint: 'Installed fleet ÷ average vehicle lifespan gives the replacement rate; add modest fleet growth. Anchor on total registered vehicles and how long they last.', difficulty: 'standard', domain: 'volume', theme: 'national-sizing' },
  // idx 22: advanced / flow (platform-concurrency)
  { question: 'How many search queries per second does the world\'s largest search engine handle at its global peak?', hint: 'Annual or daily query volume → average queries per second, then apply a modest peak factor since global usage smooths across time zones.', difficulty: 'advanced', domain: 'flow', theme: 'platform-concurrency' },
  // idx 23: basic / market (market-sizing)
  { question: 'What is the annual global box-office revenue (USD) for cinema?', hint: 'Cinema-going population × tickets per person per year × average ticket price, weighted toward regions with strong theater habits.', difficulty: 'basic', domain: 'market', theme: 'market-sizing' },
  // idx 24: advanced / unit (unit-economics)
  { question: 'What is the annual revenue (USD) of a single 8-stall EV fast-charging station at a busy highway location, and what stall utilization does that imply?', hint: 'Sessions/stall/day from operating hours, session length and utilization × energy or price per session × 365. Then sanity-check the implied utilization.', difficulty: 'advanced', domain: 'unit', theme: 'unit-economics' },
  // idx 25: basic / volume (industry-throughput)
  { question: 'How many pizzas are sold worldwide in a single day?', hint: 'Start from the major pizza-eating regions (US + Europe as the core), estimate slices or pies per person per week, then convert to a daily, global figure. The US alone is a useful anchor before scaling out.', difficulty: 'basic', domain: 'volume', theme: 'industry-throughput' },
  // idx 26: standard / volume (stock-flow)
  { question: 'How many personal computers (desktops + laptops) are shipped worldwide in one year?', hint: 'Work from the global installed base of PCs and an average replacement cycle, which is longer than for phones. Annual shipments roughly equal the active base divided by the replacement period, plus modest first-time demand.', difficulty: 'standard', domain: 'volume', theme: 'stock-flow' },
  // idx 27: basic / volume (industry-throughput)
  { question: 'How many cigarettes are consumed worldwide in one year?', hint: 'Estimate the global adult smoking population, then multiply by an average number of cigarettes per smoker per day and annualize. Smoking prevalence varies sharply by region.', difficulty: 'basic', domain: 'volume', theme: 'industry-throughput' },
  // idx 28: advanced / volume (stock-flow)
  { question: 'What is the cumulative number of solar panels (PV modules) ever installed worldwide?', hint: 'Convert total installed solar capacity (in gigawatts) into module count using an average wattage per panel. Cumulative capacity, not annual additions, is what you want here.', difficulty: 'advanced', domain: 'volume', theme: 'stock-flow' },
  // idx 29: advanced / volume (industry-throughput)
  { question: 'How many shipping containers (TEU) cross the world\'s oceans each year?', hint: 'Anchor on global container port throughput, then recognize that each box is handled multiple times (load, transship, unload) so port moves overstate unique voyages. Reason from trade volume per capita as a cross-check.', difficulty: 'advanced', domain: 'volume', theme: 'industry-throughput' },
  // idx 30: standard / market (global-tam)
  { question: 'What is the global annual revenue of the bottled-water industry (USD)?', hint: 'Multiply the drinking population by liters of bottled water consumed per person per year by an average price per liter. Developed markets drive both volume and price.', difficulty: 'standard', domain: 'market', theme: 'global-tam' },
  // idx 31: standard / volume (industry-throughput)
  { question: 'How many metric tons of air cargo are transported worldwide in one year?', hint: 'Anchor on global air-freight tonne-kilometers, or build from world population times an average kg of air-freighted goods per person per year. Recognize air cargo is a small but high-value slice of total freight.', difficulty: 'standard', domain: 'volume', theme: 'industry-throughput' },
  // idx 32: advanced / cost (cost-ops)
  { question: 'What is the total cost of running the world\'s data centers in electricity per year (USD)?', hint: 'Combine global data-center electricity consumption (in terawatt-hours) with an average industrial electricity price per kWh. Energy use is the dominant operating cost lever.', difficulty: 'advanced', domain: 'cost', theme: 'cost-ops' },
  // idx 33: basic / volume (industry-throughput)
  { question: 'How many pairs of shoes are manufactured worldwide in one year?', hint: 'Use world population times an average number of new pairs bought per person per year, recognizing rich and poor regions differ several-fold in purchase rate.', difficulty: 'basic', domain: 'volume', theme: 'industry-throughput' },
  // idx 34: standard / volume (stock-flow)
  { question: 'What is the cumulative number of automobiles (passenger cars) on the road worldwide today?', hint: 'Combine regional vehicle-ownership rates (cars per 1,000 people) with population for high-, middle-, and low-ownership regions, then sum the fleets.', difficulty: 'standard', domain: 'volume', theme: 'stock-flow' },
  // idx 35: standard / volume (industry-throughput)
  { question: 'How many emails are sent worldwide in a single day?', hint: 'Multiply the number of email users by average emails sent per user per day, but remember a large share of total volume is automated and spam, not human-typed.', difficulty: 'standard', domain: 'volume', theme: 'industry-throughput' },
  // idx 36: standard / market (global-tam)
  { question: 'What is the global annual revenue of the fast-food (quick-service restaurant) industry (USD)?', hint: 'Estimate the world\'s regular fast-food customers, visits per person per year, and average ticket size. Developed markets dominate spend even where developing markets dominate headcount.', difficulty: 'standard', domain: 'market', theme: 'global-tam' },
  // idx 37: standard / volume (industry-throughput)
  { question: 'How many barrels of oil does the world consume in a single day?', hint: 'Anchor on world population and a weighted per-capita oil consumption, recognizing the US consumes far more per person than the global average. Cross-check against the well-known global daily figure.', difficulty: 'standard', domain: 'volume', theme: 'industry-throughput' },
  // idx 38: advanced / volume (stock-flow)
  { question: 'What is the cumulative number of credit and debit cards in circulation worldwide?', hint: 'Estimate the banked adult population, then multiply by an average number of payment cards held per person, which is several in developed markets and near zero in unbanked regions.', difficulty: 'advanced', domain: 'volume', theme: 'stock-flow' },
  // idx 39: basic / volume (industry-throughput)
  { question: 'How many cups (servings) of tea are consumed worldwide in a single day?', hint: 'Tea is concentrated in Asia, the Middle East, and the UK, so weight those regions heavily for cups per person per day rather than using a flat global average.', difficulty: 'basic', domain: 'volume', theme: 'industry-throughput' },
  // idx 40: standard / market (global-tam)
  { question: 'What is the global annual revenue of the pet-care market (food + vet + supplies, USD)?', hint: 'Combine the number of pet-owning households in developed regions with annual spend per pet, since spending is overwhelmingly concentrated in high-income markets.', difficulty: 'standard', domain: 'market', theme: 'global-tam' },
  // idx 41: standard / volume (industry-throughput)
  { question: 'How many flights (commercial aircraft departures) take off worldwide in a single day?', hint: 'Work backward from annual global passengers and an average passengers-per-flight figure to get flights per year, then divide by 365. Distinguish passenger flights from cargo/private.', difficulty: 'standard', domain: 'volume', theme: 'industry-throughput' },
  // idx 42: advanced / cost (cost-ops)
  { question: 'What is the annual operating cost of the global postal and parcel-delivery \'last mile\' (USD)?', hint: 'Estimate annual parcels delivered worldwide times an average last-mile cost per parcel, recognizing last mile is the costliest delivery segment per item.', difficulty: 'advanced', domain: 'cost', theme: 'cost-ops' },
  // idx 43: standard / volume (industry-throughput)
  { question: 'How many liters of milk are produced worldwide in one year?', hint: 'Anchor on world population and an average per-capita dairy-milk availability per year, weighting high-consumption regions (Europe, the Americas, South Asia) more heavily.', difficulty: 'standard', domain: 'volume', theme: 'industry-throughput' },
  // idx 44: advanced / market (global-tam)
  { question: 'What is the global total addressable market for online video streaming subscriptions (USD)?', hint: 'Multiply broadband-connected households worldwide by an estimated paying-subscriber rate, services per household, and average monthly fee × 12. Affordability caps adoption in lower-income regions.', difficulty: 'advanced', domain: 'market', theme: 'global-tam' },
  // idx 45: standard / volume (industry-throughput)
  { question: 'How many plastic bottles (PET beverage bottles) are produced worldwide in one year?', hint: 'Start from global bottled-beverage servings per person per year (water + soda) and scale by population, recognizing that one person can consume hundreds of bottles annually in heavy markets.', difficulty: 'standard', domain: 'volume', theme: 'industry-throughput' },
  // idx 46: standard / volume (stock-flow)
  { question: 'What is the cumulative number of active bank accounts worldwide?', hint: 'Estimate the banked adult population, then multiply by an average number of accounts (checking, savings, etc.) held per banked person, which is higher in developed markets.', difficulty: 'standard', domain: 'volume', theme: 'stock-flow' },
  // idx 47: advanced / market (global-tam)
  { question: 'What is the global annual retail revenue of the beer market (USD)?', hint: 'Combine the world\'s regular beer-drinking population with liters consumed per person per year and an average retail price per liter, weighting high-consumption regions and on-premise (bar) pricing.', difficulty: 'advanced', domain: 'market', theme: 'global-tam' },
  // idx 48: standard / volume (industry-throughput)
  { question: 'How many text/chat messages (SMS + messaging apps) are sent worldwide in a single day?', hint: 'Multiply the number of messaging-app users by an average messages-sent-per-user-per-day, recognizing that app messaging volume now dwarfs traditional SMS.', difficulty: 'standard', domain: 'volume', theme: 'industry-throughput' },
  // idx 49: advanced / market (global-tam)
  { question: 'What is the global annual electricity-generation revenue (utility sales to end users, USD)?', hint: 'Combine total world electricity consumption (in terawatt-hours) with an average retail price per kWh, blending cheap-power and expensive-power regions.', difficulty: 'advanced', domain: 'market', theme: 'global-tam' },
  // ── new 12 (cost / flow heavy・DF-F22) ──
  // idx 50: basic / cost (cost-structure)
  { question: 'What is the monthly labor cost (USD) of a 4-stylist hair salon in the United States?', hint: 'Staff count × monthly pay per stylist, then add payroll taxes and benefits (roughly +15–25% on top of wages).', difficulty: 'basic', domain: 'cost', theme: 'cost-structure' },
  // idx 51: basic / flow (platform-concurrency)
  { question: 'How many people are eating inside US fast-food restaurants at the same moment during the noon lunch peak?', hint: 'Number of outlets × seats per outlet × the fraction of seats filled at the lunch peak gives the headcount at one instant.', difficulty: 'basic', domain: 'flow', theme: 'platform-concurrency' },
  // idx 52: basic / unit (unit-economics)
  { question: 'What is the daily revenue (USD) of a single independent neighborhood bakery?', hint: 'Customers per day × average spend per customer. Account for the morning rush and the fact that one buyer takes several items.', difficulty: 'basic', domain: 'unit', theme: 'unit-economics' },
  // idx 53: basic / market (market-sizing)
  { question: 'What is the annual revenue (USD) of the office-supply market in the United States?', hint: 'Office workers + students × annual spend per person on paper, pens, and supplies. Low unit price but high repeat purchase.', difficulty: 'basic', domain: 'market', theme: 'market-sizing' },
  // idx 54: standard / cost (cost-structure)
  { question: 'What is the monthly operating cost (rent + labor + utilities) of a single US convenience store?', hint: 'Add up store rent, staff wages (hourly wage × shift hours × staff), and utilities. Build labor from the hours the store stays open.', difficulty: 'standard', domain: 'cost', theme: 'cost-structure' },
  // idx 55: standard / flow (platform-concurrency)
  { question: 'How many passengers are riding US public transit (bus + rail) at the same instant during the morning commute peak?', hint: 'Daily transit boardings → concentrate into the morning peak hour, then convert to riders in transit at one moment using average trip duration.', difficulty: 'standard', domain: 'flow', theme: 'platform-concurrency' },
  // idx 56: standard / cost (cost-structure)
  { question: 'What is the annual cost (USD) of unsold food thrown away by a single mid-size US supermarket?', hint: 'Annual store sales × the share that is fresh/perishable × the spoilage rate of that category. Include markdowns that still go unsold.', difficulty: 'standard', domain: 'cost', theme: 'cost-structure' },
  // idx 57: standard / volume (national-sizing)
  { question: 'How many disposable coffee cups are thrown away in the United States per year?', hint: 'Coffee-to-go drinkers × to-go cups per drinker per day × 365. Anchor on the share of daily coffee that is bought in a disposable cup.', difficulty: 'standard', domain: 'volume', theme: 'national-sizing' },
  // idx 58: advanced / cost (cost-structure)
  { question: 'What is the annual operating cost (USD) of a mid-size 10-story office building in a major US city?', hint: 'From rentable floor area, build up cleaning, security, HVAC/maintenance, elevators, utilities, insurance and property tax. Anchor on operating cost per square foot per year.', difficulty: 'advanced', domain: 'cost', theme: 'cost-structure' },
  // idx 59: advanced / flow (platform-supply-demand)
  { question: 'How many parcels are in transit (picked up but not yet delivered) across the United States at any given moment?', hint: 'Daily parcel volume × the average number of days a parcel spends in the network gives the stock in transit (flow × dwell time = stock).', difficulty: 'advanced', domain: 'flow', theme: 'platform-supply-demand' },
  // idx 60: advanced / unit (unit-economics)
  { question: 'What is the annual operating profit (USD) of a single full-service casual-dining restaurant?', hint: 'From annual revenue, subtract food cost (~30%), labor (~30%), and rent + utilities + overhead, leaving a thin single-digit margin. Build revenue from covers × ticket × days.', difficulty: 'advanced', domain: 'unit', theme: 'unit-economics' },
  // idx 61: advanced / unit (unit-economics)
  { question: 'What is the annual operating profit (USD) of a single-dentist private practice in the United States?', hint: 'Revenue = patients/day × revenue per visit × working days; then subtract staff pay, supplies/lab, rent, and equipment costs to reach profit.', difficulty: 'advanced', domain: 'unit', theme: 'unit-economics' },
  // ── 2026-06-14 追加: フェルミ100問（コンサル系＋古典） ──
  { question: 'What is the annual revenue (USD) of the cosmetics market (skincare + makeup) in the United States?', hint: 'Target population × share who buy cosmetics × annual spend per person. Skincare and makeup carry very different price points, so split them.', difficulty: 'standard', domain: 'market', theme: '化粧品' },
  { question: 'What is the annual revenue (USD) of the apparel retail market in the United States?', hint: 'Population × annual clothing spend per person. Purchase frequency and unit price vary by age and gender; think in items (tops, bottoms, outerwear) bought per year.', difficulty: 'standard', domain: 'market', theme: 'アパレル' },
  { question: 'What is the annual revenue (USD) of the furniture and home-furnishings market in the United States?', hint: 'Households × share that buy/replace furniture in a year × annual furniture spend per buying household. Moves and new households drive most demand.', difficulty: 'standard', domain: 'market', theme: '家具' },
  { question: 'What is the annual revenue (USD) of the dollar-store (single-price discount) industry in the United States?', hint: 'Number of stores × revenue per store per day × operating days. The ticket is small, but visit frequency and items per basket are high.', difficulty: 'basic', domain: 'unit', theme: '100均' },
  { question: 'What is the annual revenue (USD) of the dry-cleaning and laundry-service industry in the United States?', hint: 'Households × share that use the service × visits per household per year × spend per visit. Think about the mix of suits, coats, and shirts behind the average ticket.', difficulty: 'standard', domain: 'market', theme: 'クリーニング' },
  { question: 'What is the annual revenue (USD) of a single self-service laundromat?', hint: 'Machines installed (washers + dryers) × cycles per machine per day × price per cycle × 365. Weekends and rainy spells skew utilization.', difficulty: 'standard', domain: 'unit', theme: 'コインランドリー' },
  { question: 'What is the annual revenue (USD) of physical bookstores (brick-and-mortar) in the United States?', hint: 'Number of stores × revenue per store per day × operating days. Consider the mix of books, magazines, and the average ticket, and net out the shift to online/e-books.', difficulty: 'basic', domain: 'unit', theme: '書店' },
  { question: 'What is the annual revenue (USD) of the toy market in the United States?', hint: 'Children in the target age range × annual toy spend per child. Spending clusters around the holidays and birthdays; add a layer for adult-hobby toys.', difficulty: 'basic', domain: 'market', theme: '玩具' },
  { question: 'What is the annual revenue (USD) of the dietary-supplement market in the United States?', hint: 'Adult population × share who regularly take supplements × annual supplement spend per user. Subscription buyers and one-off buyers differ in spend.', difficulty: 'standard', domain: 'market', theme: 'サプリ' },
  { question: 'What is the annual revenue (USD) of the prepared-meal / ready-to-eat ("meal solutions") market in US grocery and convenience retail?', hint: 'Population × share who buy prepared meals × annual prepared-meal spend per person. Account for the breadth of channels: grocery deli, convenience stores, and meal counters.', difficulty: 'standard', domain: 'market', theme: '中食' },
  { question: 'What is the annual revenue (USD) of the nail-salon industry in the United States?', hint: 'Number of clients × visits per client per year × spend per visit. Demand skews heavily female, and regular upkeep means high visit frequency.', difficulty: 'standard', domain: 'market', theme: 'ネイルサロン' },
  { question: 'What is the annual revenue (USD) of the secondhand / resale retail market (used goods and thrift) in the United States?', hint: 'Population × share who buy used goods × annual secondhand spend per buyer. Sum both channels: online resale marketplaces and physical thrift/consignment stores.', difficulty: 'standard', domain: 'market', theme: 'リユース' },
  { question: 'What is the annual revenue (USD) of the private tutoring and test-prep industry in the United States?', hint: 'School-age population (K-12) × share who use tutoring/test prep × annual spend per student. Enrollment and price both rise toward college-prep years.', difficulty: 'standard', domain: 'market', theme: '学習塾' },
  { question: 'What is the annual revenue (USD) of the cloud infrastructure (IaaS/PaaS) market in the United States?', hint: 'Businesses × cloud-adoption rate × annual cloud spend per company. Spend is highly skewed: small firms spend thousands, large enterprises spend millions.', difficulty: 'advanced', domain: 'market', theme: 'クラウドインフラ' },
  { question: 'What is the annual revenue (USD) of the cybersecurity market in the United States?', hint: 'Businesses × the share that buys security × annual security spend per company. Include both products (software/appliances) and services (monitoring/consulting).', difficulty: 'advanced', domain: 'market', theme: 'サイバーセキュリティ' },
  { question: 'What is the annual revenue (USD) of the recruiting / staffing-placement (executive search) industry in the United States?', hint: 'Annual hires × share placed via agencies × fee per hire (roughly 20-30% of first-year salary). The salary level of placed roles drives the total.', difficulty: 'advanced', domain: 'market', theme: '人材紹介' },
  { question: 'What is the annual revenue (USD) of the accounting-software (cloud + packaged) market in the United States?', hint: 'Businesses × accounting-software adoption × annual spend per company, plus sole proprietors. Small firms pay tens of dollars a month; enterprises pay far more.', difficulty: 'standard', domain: 'market', theme: '会計ソフト' },
  { question: 'What is the annual revenue (USD) of the senior-care / long-term-care services market (home care + facilities) in the United States?', hint: 'People needing care × the share using paid services × annual care cost per person. Home care and residential facilities have very different price points.', difficulty: 'advanced', domain: 'market', theme: '介護' },
  { question: 'What is the annual revenue (USD) of the retail pharmacy (prescription-dispensing) industry in the United States?', hint: 'Number of pharmacies × prescriptions filled per store per day × revenue per prescription × operating days. Include both the drug cost and the dispensing fee.', difficulty: 'standard', domain: 'unit', theme: '調剤薬局' },
  { question: 'What is the annual revenue (USD) of the veterinary-clinic industry in the United States?', hint: 'Number of clinics × patients per clinic per day × revenue per visit × operating days. Rising pet-insurance adoption pushes per-visit spend up.', difficulty: 'standard', domain: 'unit', theme: '動物病院' },
  { question: 'What is the annual revenue (USD) of the private tutoring / test-prep (cram school) market in the United States?', hint: 'School-age children × the share who use paid tutoring × annual spend per child. Exam-year and one-on-one formats command much higher prices.', difficulty: 'standard', domain: 'market', theme: '学習塾' },
  { question: 'What is the annual rental revenue (USD) of the logistics-warehouse (industrial real estate) market in the United States?', hint: 'Total warehouse floor area × rent per square foot per year. E-commerce growth keeps expanding the supply of large fulfillment facilities.', difficulty: 'advanced', domain: 'market', theme: '物流倉庫' },
  { question: 'What is the annual total payment volume (USD) processed through cashless payments in the United States?', hint: 'Total personal consumption spending × the cashless share. Split across credit/debit cards, mobile wallets, and other digital rails.', difficulty: 'standard', domain: 'market', theme: '決済' },
  { question: 'What is the annual gross merchandise value (USD) of the secondhand / resale (reuse) market in the United States?', hint: 'Population × the share who buy or sell used goods × annual transaction value per person. Sum resale apps, consignment/thrift, and online auctions.', difficulty: 'standard', domain: 'market', theme: '中古品リユース' },
  { question: 'What is the annual revenue (USD) of the online professional-education / corporate e-learning (reskilling) market in the United States?', hint: 'Workforce × the share taking courses × annual spend per learner. Include both individual subscriptions and employer-paid corporate training.', difficulty: 'standard', domain: 'market', theme: 'オンライン教育(社会人)' },
  { question: 'What is the annual revenue (USD) of the preventive health-checkup / executive-physical market in the United States?', hint: 'Eligible adults × checkup rate × price per checkup. Separate routine annual physicals (cheap, common) from comprehensive screenings (expensive).', difficulty: 'standard', domain: 'market', theme: '健康診断' },
  { question: 'How many passengers does a large airport\'s security screening checkpoint process during its busy morning hour?', hint: 'Lanes × passengers per lane per hour. Per-lane throughput is the inverse of seconds per passenger (about 15-20s), so one lane clears a few hundred per hour.', difficulty: 'standard', domain: 'flow', theme: '保安検査スループット' },
  { question: 'How many customer calls does a large retailer\'s call center answer in a single day?', hint: 'Agents on shift × calls handled per agent per hour × operating hours. Get calls-per-hour from average handle time (about 5-8 min per call).', difficulty: 'standard', domain: 'flow', theme: 'コールセンター処理量' },
  { question: 'How many packages does a single e-commerce fulfillment center ship out in one day?', hint: 'Pickers × picks per picker per hour × hours, or packing lines × line throughput. Mind the gap between peak-season and normal volume.', difficulty: 'standard', domain: 'flow', theme: '物流センター出荷' },
  { question: 'How many transactions does a single bank ATM handle in one day?', hint: 'Operating hours × transactions per hour. Estimate utilization from time per transaction (about 1-2 min) and how busy the peak hours are.', difficulty: 'basic', domain: 'flow', theme: 'ATM稼働' },
  { question: 'How many outpatients does a large teaching hospital see in a single day?', hint: 'Exam rooms in use × patients per room per day. Get per-room volume from minutes per patient (about 10-15) and the mostly-morning clinic hours.', difficulty: 'standard', domain: 'flow', theme: '病院外来数' },
  { question: 'How many checkouts does a single supermarket register process during the busy evening hour?', hint: 'Invert time per checkout (about 1-2 min) for transactions per hour, then apply a utilization factor assuming the queue stays full during the peak.', difficulty: 'basic', domain: 'flow', theme: 'レジ処理' },
  { question: 'How many vehicles pass a single segment of an intercity highway over 24 hours on a weekday?', hint: 'Lanes × vehicles per lane per hour × an hourly profile across the day. At peak, a lane approaches its capacity of about 1,800-2,000 vehicles/hour.', difficulty: 'standard', domain: 'flow', theme: '高速道路交通量' },
  { question: 'What is the steady-state power draw (kW) of a single large data center?', hint: 'Racks × power per rack × PUE (about 1.3-1.5). Take the IT load and gross it up for cooling and overhead to reach total facility power.', difficulty: 'advanced', domain: 'volume', theme: 'データセンタ電力' },
  { question: 'How many parcels does one delivery driver drop off in a single working day?', hint: 'Working hours × deliveries per hour. Derive deliveries-per-hour from minutes per stop (drive + handoff, about 3-5 min) and net out failed/redelivery attempts.', difficulty: 'basic', domain: 'flow', theme: 'ラストワンマイル処理' },
  { question: 'How many guests can a single popular theme-park ride carry in one operating day?', hint: 'Riders per cycle × cycles per hour × operating hours. Get throughput from the full cycle time including loading, unloading and safety checks.', difficulty: 'standard', domain: 'flow', theme: 'アトラクション処理能力' },
  { question: 'How many food-delivery orders are out for delivery simultaneously in a major city during the dinner peak?', hint: 'Orders per hour × average time each order spends in delivery (about 30 min = 0.5 h) gives the count in flight at once (flow × dwell time = stock).', difficulty: 'advanced', domain: 'flow', theme: 'デリバリー同時稼働' },
  { question: 'On average, how many callers are waiting in the queue during the busiest 10 minutes at a large bank\'s call center?', hint: 'Calls arriving per minute × average wait time in minutes gives the queue length (arrival rate × wait = number waiting). The shortfall of available agents drives the wait.', difficulty: 'advanced', domain: 'flow', theme: '待ち行列の長さ' },
  { question: 'How many members does a 24-hour gym location need just to break even each month?', hint: 'Monthly fixed costs (rent + staff + equipment lease + utilities) ÷ monthly dues per member gives the break-even membership (fixed cost ÷ price).', difficulty: 'standard', domain: 'unit', theme: '損益分岐' },
  { question: 'What is the lifetime value (LTV) of a single video-subscription customer (USD)?', hint: 'Monthly price × average months retained × gross margin. Approximate months retained as 1 ÷ monthly churn rate.', difficulty: 'standard', domain: 'unit', theme: 'LTV' },
  { question: 'How many potential annual passengers could a new airline route between two major cities capture?', hint: 'Combined metro populations × share who travel to the other city per year × air\'s share of trips (vs. rail/car). Modal split is the key cut.', difficulty: 'advanced', domain: 'market', theme: '路線需要' },
  { question: 'What annual revenue can a newly opened suburban roadside family restaurant expect (USD)?', hint: 'Trade-area population × visits per resident per year × average ticket. Define the trade area as a 5-minute drive radius.', difficulty: 'standard', domain: 'unit', theme: '新規出店' },
  { question: 'What is the gross profit of a SaaS company with $12M in annual revenue (USD)?', hint: 'Annual revenue × gross margin. Gross margin is revenue minus cloud/hosting, support, and payment-processing cost of goods sold (SaaS margins run high).', difficulty: 'advanced', domain: 'cost', theme: '粗利' },
  { question: 'How many months does it take a subscription app to recover the cost of acquiring one paying customer (CAC)?', hint: 'CAC ÷ (monthly price × gross margin) gives the payback period in months (ad spend ÷ monthly gross profit per member).', difficulty: 'advanced', domain: 'unit', theme: 'CAC回収' },
  { question: 'How many charging sessions per day does a new 4-stall suburban EV fast-charging station need to break even?', hint: 'Monthly fixed cost ÷ gross profit per session (session price × (1 − electricity cost ratio)) ÷ 30 days gives the sessions needed per day.', difficulty: 'advanced', domain: 'flow', theme: 'EV充電採算' },
  { question: 'What annual market size could a new home-cleaning service target in major urban areas (USD)?', hint: 'Target households (dual-income, higher-income) × adoption rate × annual spend per household. Narrowing the addressable customer base is the key step.', difficulty: 'advanced', domain: 'market', theme: '市場参入' },
  { question: 'How many years does it take a newly opened café to recoup its build-out investment (fit-out + equipment)?', hint: 'Initial investment ÷ annual operating profit gives the payback period (annual operating profit = annual revenue × operating margin).', difficulty: 'standard', domain: 'cost', theme: '店舗回収' },
  { question: 'What is the monthly revenue of a single unattended self-service laundromat (USD)?', hint: 'Number of washers + dryers × cycles per machine per day × price per cycle × 30 days (machines × utilization × price).', difficulty: 'basic', domain: 'unit', theme: 'コインランドリー' },
  { question: 'What annual royalty income does a franchise headquarters earn from 100 franchised stores (USD)?', hint: 'Number of stores × annual revenue per store × royalty rate gives HQ income (stores × store revenue × rate).', difficulty: 'standard', domain: 'flow', theme: 'フランチャイズ' },
  { question: 'How much inventory write-down does a new apparel e-commerce brand ($10M revenue) take on unsold stock per year (USD)?', hint: 'Annual cost of goods × unsold share × loss rate from markdown clearance gives the write-down (COGS × leftover rate × loss rate).', difficulty: 'advanced', domain: 'cost', theme: '在庫回転' },
  { question: 'If you emptied a Boeing 747-class jumbo jet and packed its interior with golf balls, about how many would fit?', hint: 'Cabin+cargo volume ÷ volume occupied by one golf ball (ball volume ÷ packing efficiency ~0.6–0.7). The A ÷ B × fill-rate pattern.', difficulty: 'standard', domain: 'volume', theme: '詰め込み・容積' },
  { question: 'How many ping-pong balls would it take to fill an ordinary school classroom up to the ceiling?', hint: 'Room volume (floor area × ceiling height) ÷ volume occupied per ball (ball volume ÷ packing efficiency).', difficulty: 'basic', domain: 'volume', theme: '詰め込み・容積' },
  { question: 'How many liters of water would it take to completely fill a domed baseball stadium (Tokyo Dome scale, ~1.24 million m³)?', hint: 'Stadium interior volume × (1 m³ = 1,000 L). The volume × unit-conversion pattern.', difficulty: 'basic', domain: 'volume', theme: '巨大容積' },
  { question: 'About how many liters of water fill a standard 25-meter swimming pool?', hint: 'Length × width × average depth gives volume in m³; convert with 1 m³ = 1,000 L.', difficulty: 'basic', domain: 'volume', theme: '巨大容積' },
  { question: 'Roughly how many grains of sand are in a beach section 100 m long, 50 m wide, and 1 m deep?', hint: 'Beach volume ÷ volume of a single grain (treat a ~0.3 mm grain as a tiny cube), times packing efficiency. The big-volume ÷ tiny-volume pattern.', difficulty: 'advanced', domain: 'volume', theme: '微小×巨大' },
  { question: 'About how many characters are printed in a single 300-page paperback (Japanese bunko-style) novel?', hint: 'Lines per page × characters per line × number of pages. The A × B × C pattern.', difficulty: 'basic', domain: 'volume', theme: '文字・印刷物' },
  { question: 'A mid-size public library holds about 200,000 books. Roughly how many words are stored across all of them?', hint: 'Number of books × average words per book (pages × words per page). The A × (B × C) pattern.', difficulty: 'standard', domain: 'volume', theme: '文字・蔵書' },
  { question: 'If you emptied a full-size school bus and filled it with tennis balls, about how many would fit?', hint: 'Bus interior volume (length × width × height) ÷ volume occupied per ball (ball volume ÷ packing efficiency).', difficulty: 'standard', domain: 'volume', theme: '詰め込み・容積' },
  { question: 'How many coins (penny-size) would it take to pack a home refrigerator (about 400 L) completely full?', hint: 'Fridge volume ÷ volume occupied per coin (coin cylinder volume ÷ packing efficiency).', difficulty: 'standard', domain: 'volume', theme: '詰め込み・容積' },
  { question: 'About how many individual drops of water make up a full 25-meter swimming pool?', hint: 'Total pool volume (in mL) ÷ volume of one drop (~0.05 mL). The big-volume ÷ tiny-volume pattern.', difficulty: 'standard', domain: 'volume', theme: '微小×巨大' },
  { question: 'How many marbles would fit inside a single passenger elevator car packed completely full?', hint: 'Elevator car volume ÷ volume occupied per marble (sphere volume ÷ packing efficiency).', difficulty: 'basic', domain: 'volume', theme: '詰め込み・容積' },
  { question: 'If a large container ship were loaded entirely with gravel, roughly how many individual pebbles would it carry?', hint: 'Cargo volume ÷ volume of one pebble (treat as a ~1 cm sphere), times packing efficiency. The big-volume ÷ tiny-volume pattern.', difficulty: 'advanced', domain: 'volume', theme: '微小×巨大' },
  { question: 'How many soccer balls would it take to fill a standard 20-foot shipping container?', hint: 'Container internal volume (~33 m³) ÷ volume occupied per ball (sphere volume ÷ packing efficiency).', difficulty: 'standard', domain: 'volume', theme: '詰め込み・容積' },
  { question: 'About how many hairs are growing on a human head?', hint: 'Scalp area × hair-follicle density per cm². Estimate the haired area (not the whole head surface) times follicles per cm².', difficulty: 'basic', domain: 'volume', theme: '頭髪' },
  { question: 'About how many times does a human heart beat over a lifetime (80 years)?', hint: 'Beats per minute × 60 × 24 × 365 × years. Use a representative resting/active average rate.', difficulty: 'basic', domain: 'flow', theme: '心拍' },
  { question: 'About how many breaths does a human take over a lifetime (80 years)?', hint: 'Breaths per minute × 60 × 24 × 365 × years. Use a typical resting breathing rate.', difficulty: 'basic', domain: 'flow', theme: '呼吸' },
  { question: 'About how many times does a human blink over a lifetime (80 years)?', hint: 'Blinks per minute × waking minutes per day × 365 × years. Remember you don\'t blink while asleep.', difficulty: 'standard', domain: 'flow', theme: 'まばたき' },
  { question: 'About how many cells make up an adult human body?', hint: 'Body mass ÷ average mass of one cell. Model a typical cell as a cube ~10-20 μm on a side to estimate its mass.', difficulty: 'advanced', domain: 'volume', theme: '細胞数' },
  { question: 'About how many hairs fall out of a human head per day?', hint: 'Total head hairs × the fraction shed each day. Hair cycles over a few years, so derive the daily shed rate from that turnover.', difficulty: 'standard', domain: 'flow', theme: '抜け毛' },
  { question: 'About how many liters of blood are in an adult human body?', hint: 'Body mass × the fraction that is blood (about 7-8% of body weight). Blood density is close to water, so convert kg to L directly.', difficulty: 'basic', domain: 'volume', theme: '血液量' },
  { question: 'About how many kilometers does a person walk in a lifetime (80 years)?', hint: 'Steps per day × stride length gives daily distance; multiply by 365 × the walking years (exclude infancy).', difficulty: 'standard', domain: 'unit', theme: '歩行距離' },
  { question: 'About how many kilograms of food does a medium-size dog eat over its lifetime (about 13 years)?', hint: 'Daily food amount × 365 × lifespan. Puppy and adult intake differ a bit, but use a representative daily figure.', difficulty: 'standard', domain: 'unit', theme: '犬の食事量' },
  { question: 'About how many liters of tears does a human produce over a lifetime (80 years)?', hint: 'Daily basal tear production × 365 × lifespan. Focus on the everyday secretion that keeps the eye moist, treating crying as a minor add-on.', difficulty: 'standard', domain: 'volume', theme: '涙' },
  { question: 'About how many liters of liquid (drinks) does a person consume over a lifetime (80 years)?', hint: 'Daily fluid intake × 365 × lifespan. Count only what you drink, excluding the water inside food.', difficulty: 'standard', domain: 'volume', theme: '飲水量' },
  { question: 'About how many grams of dead skin cells does a human shed in one year?', hint: 'Daily shed skin mass × 365. Skin renews roughly monthly, so divide the mass of the outer skin layer by the turnover days to get the daily amount.', difficulty: 'advanced', domain: 'flow', theme: '皮膚の代謝' },
  { question: 'How many leaves are on a single large, mature oak tree?', hint: 'Decompose as main branches × twigs per branch × leaves per twig. Alternatively, crown volume × leaf density per unit volume.', difficulty: 'standard', domain: 'volume', theme: '植物' },
  { question: 'How many individual raindrops fall on one square kilometer of land during a single thunderstorm?', hint: 'Total water = rainfall depth (mm) × area; divide by the volume of one drop. A ~2mm-diameter drop gives the per-drop volume.', difficulty: 'advanced', domain: 'volume', theme: '気象' },
  { question: 'How many steps would a person take to walk all the way around the Earth along the equator?', hint: 'Earth\'s circumference ÷ stride length. Circumference is about 40,000km and a stride is about 0.7m.', difficulty: 'basic', domain: 'unit', theme: '地理' },
  { question: 'How many 10-tonne dump trucks would it take to haul away an entire mountain the size of Mt. Fuji?', hint: 'Cone volume (base area × height ÷ 3) × rock density gives total mass; divide by per-truck load. Rock density is ~2.6 t/m³.', difficulty: 'advanced', domain: 'volume', theme: '地形' },
  { question: 'How many 10-liter buckets would it take to scoop up all the seawater on Earth?', hint: 'Ocean volume (ocean area × average depth) converted to liters, divided by bucket capacity. Use 1m³ = 1000L.', difficulty: 'advanced', domain: 'volume', theme: '海洋' },
  { question: 'On a clear night, roughly how many stars can be seen with the naked eye at one time?', hint: 'Of all naked-eye stars across the whole sky, only the half above the horizon is visible; then multiply by the fraction actually seen given light pollution and haze.', difficulty: 'standard', domain: 'volume', theme: '天文' },
  { question: 'Roughly how many cloud-to-ground lightning strikes hit the Earth in a single day?', hint: 'Lightning strikes per second worldwide × seconds per day. Alternatively, active thunderstorms at once × flash rate per storm.', difficulty: 'advanced', domain: 'flow', theme: '気象' },
  { question: 'How many grains of sand are in a beach the size of a baseball field?', hint: 'Beach volume (area × sand depth) ÷ volume of one grain. Assume a ~0.5mm grain and account for the gaps between grains (porosity).', difficulty: 'advanced', domain: 'volume', theme: '海岸' },
  { question: 'What is the total mass, in tonnes, of all the rain and snow that falls on Japan in one year?', hint: 'Land area × annual precipitation depth = total volume; convert to mass with water density (1 tonne/m³). Convert precipitation to meters.', difficulty: 'standard', domain: 'flow', theme: '気象' },
  { question: 'Traveling at the speed of light, how many years would it take to reach the nearest star to the Sun?', hint: 'Distance to the star ÷ speed of light. Take distance in km and light speed as ~300,000 km/s to get seconds, then convert to years.', difficulty: 'advanced', domain: 'unit', theme: '天文' },
  { question: 'How many tonnes of water are contained in a single fluffy cumulus cloud floating in the sky?', hint: 'Cloud volume (approximate as a cube or sphere) × liquid-water density of the cloud. A ~1km-wide cumulus sets the volume; water content is only ~0.5g per m³.', difficulty: 'standard', domain: 'volume', theme: '気象' },
  { question: 'Roughly how many insects live in one square kilometer of forest?', hint: 'Insects per square meter × area (1,000,000 m²). Use a density that combines soil, leaf litter, and tree-dwelling insects.', difficulty: 'advanced', domain: 'volume', theme: '生態' },
  { question: 'How many piano tuners are there in the city of Chicago?', hint: 'Households × share owning a piano × tunings per piano per year gives annual tuning demand; divide by the jobs one tuner can do per year (A×B÷C).', difficulty: 'standard', domain: 'market', theme: 'classic-piano-tuner' },
  { question: 'How many piano tuners are there in the entire United States?', hint: 'Total pianos nationwide × tunings per piano per year gives annual demand; divide by jobs one tuner handles per year (A×B÷C). You can scale a single-city estimate up to the nation.', difficulty: 'standard', domain: 'market', theme: 'classic-piano-tuner-national' },
  { question: 'How many manhole covers are there in New York City?', hint: 'Total street length ÷ average spacing between manholes gives the count; remember multiple utility systems (sewer, electric, telecom) overlap. Distance ÷ spacing pattern.', difficulty: 'standard', domain: 'unit', theme: 'classic-manholes' },
  { question: 'How many traffic signals (signalized intersections) are there in the United States?', hint: 'Estimate per population or per urban road length. Population × signals per 10,000 people is the simplest form (A×B).', difficulty: 'standard', domain: 'unit', theme: 'classic-traffic-signals' },
  { question: 'How many loaves of bread are baked in the United States in a single day?', hint: 'Population × share who eat bread daily × bread eaten per person per day (in loaves-equivalent), summing breakfast, sandwiches, and rolls (A×B).', difficulty: 'basic', domain: 'volume', theme: 'classic-bread-baked' },
  { question: 'If you lined up all the vending machines in Japan side by side, how many kilometers long would the row be?', hint: 'Number of vending machines × width per machine gives total length (A×B). Japan has an unusually high machine count.', difficulty: 'basic', domain: 'unit', theme: 'classic-vending-distance' },
  { question: 'What is the total distance driven by all taxis and ride-hail cars in New York City in one day?', hint: 'Number of cabs × distance driven per cab per day (A×B). Use total miles including both occupied and empty cruising.', difficulty: 'standard', domain: 'flow', theme: 'classic-taxi-distance' },
  { question: 'How many hours would it take a snail to crawl across the United States, from coast to coast?', hint: 'Cross-country distance ÷ snail crawl speed gives the time (distance ÷ speed). Assume non-stop, theoretical movement.', difficulty: 'standard', domain: 'unit', theme: 'classic-snail-japan' },
  { question: 'How many street lights are there in the city of London?', hint: 'Total street length ÷ spacing between lamp posts gives the count (distance ÷ spacing).', difficulty: 'standard', domain: 'unit', theme: 'classic-streetlights' },
  { question: 'How many haircuts are performed across the United States in a single day?', hint: 'Population ÷ average days between haircuts gives daily demand; or stylists × cuts per stylist per day (A÷B or A×B).', difficulty: 'standard', domain: 'flow', theme: 'classic-haircuts-time' },
  { question: 'What is the total length of hair a single person grows over a lifetime, summed across every strand on the head?', hint: 'Hair growth rate × lifespan gives one strand\'s lifetime growth; multiply by the number of hairs on the head (A×B×C).', difficulty: 'advanced', domain: 'volume', theme: 'classic-hair-length' },
  { question: 'How many individual grains of rice are eaten in Japan in one year?', hint: 'Annual rice consumption by weight ÷ weight of one grain converts to grain count (A÷B). You can build up from grains per bowl.', difficulty: 'advanced', domain: 'volume', theme: 'classic-rice-grains' },
  { question: 'How many cheap umbrellas are bought in the United Kingdom in one year?', hint: 'Population × share who buy umbrellas × umbrellas bought per person per year (A×B). Account for how often rainy-day umbrellas get lost and rebought.', difficulty: 'basic', domain: 'volume', theme: 'classic-umbrellas' },
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
  // 50: 美容室4人の月人件費
  [{ label: 'スタッフ人数', value: '4人' }, { label: '美容師の平均月給（参考）', value: '約25〜30万円' }, { label: '社会保険の事業主負担（参考）', value: '給与の約15%' }],
  // 51: 牛丼チェーン昼ピークの同時食事人数
  [{ label: '牛丼チェーン総店舗数（参考）', value: '約4,000〜5,000店' }, { label: '1店舗の客席数（参考）', value: '約30〜50席' }, { label: '昼ピークの満席率（参考）', value: '約70〜90%' }],
  // 52: 個人経営パン屋の1日売上
  [{ label: '1日の来店客数（参考）', value: '約150〜300人' }, { label: '客単価（参考）', value: '約700〜1,000円' }, { label: '営業時間', value: '約8〜10時間' }],
  // 53: 文房具市場の年間規模
  [{ label: '日本の人口', value: '約1.24億人' }, { label: '1人あたり年間文房具支出（参考）', value: '約3,000〜5,000円' }, { label: '需要の中心', value: '学生・オフィス' }],
  // 54: コンビニ1店舗の月運営コスト
  [{ label: 'アルバイト時給（参考）', value: '約1,100円' }, { label: '24時間の必要シフト延べ時間（参考）', value: '約40〜50人時/日' }, { label: '光熱費（参考）', value: '約30〜50万円/月' }, { label: '本部ロイヤリティ', value: '粗利の約40〜60%' }],
  // 55: 朝ラッシュの首都圏鉄道同時乗車人数
  [{ label: '首都圏の鉄道通勤者数（参考）', value: '約2,000万人' }, { label: '朝ピーク時間帯', value: '約1〜2時間' }, { label: 'ピーク時に電車内にいる比率（参考）', value: '約20〜30%' }],
  // 56: 中規模スーパーの年間食品廃棄ロス
  [{ label: '1店舗の年間売上（参考）', value: '約10〜20億円' }, { label: '生鮮・惣菜の構成比（参考）', value: '約40%' }, { label: 'その廃棄率（参考）', value: '約2〜5%' }],
  // 57: 使い捨て割り箸の年間消費膳数
  [{ label: '日本の人口', value: '約1.24億人' }, { label: '1人/日の外食・中食での割り箸（参考）', value: '約0.3〜0.5膳' }, { label: '国内消費量（参考）', value: '年約200億膳規模' }],
  // 58: 中規模オフィスビルの年間運営コスト
  [{ label: '延床面積（参考）', value: '約3,000〜5,000坪' }, { label: '年間管理運営費（参考）', value: '約2〜4万円/坪・年' }, { label: '主な内訳', value: '清掃、警備、設備保守、光熱費、固定資産税' }],
  // 59: 配送中の宅配荷物の滞留個数
  [{ label: '日本の宅配年間取扱個数（参考）', value: '約50億個' }, { label: '1日あたり取扱個数（参考）', value: '約1,300〜1,400万個' }, { label: '物流網での滞在日数（参考）', value: '約1〜2日' }],
  // 60: 回転寿司チェーン1店舗の年間営業利益
  [{ label: '1店舗の年間売上（参考）', value: '約2〜3億円' }, { label: '原価率（参考）', value: '約45%' }, { label: '人件費率（参考）', value: '約20〜25%' }, { label: '営業利益率（参考）', value: '約5〜10%' }],
  // 61: 個人歯科医院1院の年間営業利益
  [{ label: '1院の年間売上（参考）', value: '約5,000万〜1億円' }, { label: '1日の患者数（参考）', value: '約20〜40人' }, { label: '主な経費', value: '人件費、材料費、賃料、設備リース' }, { label: '営業利益率（参考）', value: '約20〜30%' }],
  // ── 2026-06-14 追加: フェルミ100問（コンサル系＋古典） ──
  [{ label: '日本の成人女性人口（参考）', value: '約5,000万人' }, { label: '化粧品を日常使用する割合（参考）', value: '約70〜80%' }, { label: '1人あたり年間化粧品支出（参考）', value: '約2〜4万円' }],
  [{ label: '日本の人口', value: '約1.2億人' }, { label: '1人あたり年間衣料支出（参考）', value: '約6〜10万円' }, { label: '年間購入点数（参考）', value: '約15〜25点' }],
  [{ label: '日本の世帯数', value: '約5,500万世帯' }, { label: '年間に家具を買う世帯割合（参考）', value: '約30〜40%' }, { label: '購入世帯の年間家具支出（参考）', value: '約3〜6万円' }],
  [{ label: '国内100円ショップ店舗数（参考）', value: '約8,000〜9,000店' }, { label: '1店舗の1日売上（参考）', value: '約20〜40万円' }, { label: '年間営業日', value: '約350日' }],
  [{ label: '日本の世帯数', value: '約5,500万世帯' }, { label: 'クリーニングを利用する世帯割合（参考）', value: '約40〜50%' }, { label: '1世帯あたり年間利用回数（参考）', value: '約5〜10回' }, { label: '1回あたり単価（参考）', value: '約1,000〜2,000円' }],
  [{ label: '1店舗の設置台数（参考）', value: '約15〜25台' }, { label: '1台の1日稼働回数（参考）', value: '約3〜6回' }, { label: '1回あたり料金（参考）', value: '約400〜700円' }],
  [{ label: '国内書店数（参考）', value: '約8,000〜10,000店' }, { label: '1店舗の1日売上（参考）', value: '約10〜30万円' }, { label: '年間営業日', value: '約350日' }],
  [{ label: '日本の0〜12歳人口（参考）', value: '約1,200万人' }, { label: '1人あたり年間玩具支出（参考）', value: '約1〜2万円' }, { label: '大人向けホビーの上乗せ（参考）', value: '約2〜3割' }],
  [{ label: '日本の成人人口（参考）', value: '約1億人' }, { label: 'サプリ常用率（参考）', value: '約25〜35%' }, { label: '1人あたり年間サプリ支出（参考）', value: '約1.5〜3万円' }],
  [{ label: '日本の人口', value: '約1.2億人' }, { label: '中食を日常利用する割合（参考）', value: '約50〜60%' }, { label: '1人あたり年間中食支出（参考）', value: '約8〜15万円' }],
  [{ label: 'ネイルサロン利用者数（参考）', value: '約800〜1,000万人' }, { label: '1人あたり年間来店回数（参考）', value: '約6〜10回' }, { label: '1回あたり施術単価（参考）', value: '約6,000〜8,000円' }],
  [{ label: '日本の人口', value: '約1.2億人' }, { label: '中古品を買う人の割合（参考）', value: '約40〜50%' }, { label: '1人あたり年間中古購入額（参考）', value: '約2〜4万円' }],
  [{ label: '日本の小中高生人口（参考）', value: '約1,300万人' }, { label: '通塾率（参考・全学年平均）', value: '約30〜40%' }, { label: '1人あたり年間塾費用（参考）', value: '約20〜40万円' }],
  [{ label: '日本の法人数', value: '約400万社' }, { label: 'クラウド導入率（参考）', value: '約60〜70%' }, { label: '1社あたり年間クラウド支出（参考）', value: '約数万〜数億円（中小〜大企業）' }],
  [{ label: '日本の法人数', value: '約400万社' }, { label: 'セキュリティ対策実施率（参考）', value: '約50〜70%' }, { label: '1社あたり年間セキュリティ支出（参考）', value: '約10万〜数千万円' }],
  [{ label: '年間の転職者数（参考）', value: '約300〜350万人' }, { label: 'エージェント経由比率（参考）', value: '約20〜30%' }, { label: '紹介手数料（参考）', value: '理論年収の約30〜35%' }],
  [{ label: '日本の法人数', value: '約400万社' }, { label: '会計ソフト利用率（参考）', value: '約70〜80%' }, { label: '1社あたり年間支出（参考）', value: '約2万〜数十万円' }],
  [{ label: '要介護・要支援認定者数（参考）', value: '約700万人' }, { label: 'サービス利用率（参考）', value: '約70〜80%' }, { label: '1人あたり年間介護費（参考）', value: '約数十万〜数百万円' }],
  [{ label: '全国の調剤薬局店舗数（参考）', value: '約6万店' }, { label: '1店舗/日の処方箋枚数（参考）', value: '約30〜60枚' }, { label: '処方箋1枚あたり単価（参考）', value: '約7,000〜9,000円' }],
  [{ label: '全国の動物病院数（参考）', value: '約1.2万院' }, { label: '1院/日の来院数（参考）', value: '約15〜30件' }, { label: '1回あたり診療単価（参考）', value: '約5,000〜1万円' }],
  [{ label: '小中高生人口（参考）', value: '約1,300万人' }, { label: '通塾率（参考）', value: '約30〜40%' }, { label: '1人あたり年間塾費用（参考）', value: '約20万〜50万円' }],
  [{ label: '全国の物流施設総延床面積（参考）', value: '約数千万坪' }, { label: '坪あたり月額賃料（参考）', value: '約4,000〜6,000円' }, { label: '集計期間', value: '12ヶ月' }],
  [{ label: '日本の家計消費支出総額（参考）', value: '約300兆円/年' }, { label: 'キャッシュレス比率（参考）', value: '約40%' }, { label: '内訳', value: 'クレジット中心＋コード決済が拡大' }],
  [{ label: '日本の人口', value: '約1.24億人' }, { label: '中古売買利用率（参考）', value: '約30〜40%' }, { label: '1人あたり年間取引額（参考）', value: '約2万〜5万円' }],
  [{ label: '労働力人口', value: '約6,900万人' }, { label: 'eラーニング受講率（参考）', value: '約10〜20%' }, { label: '1人あたり年間受講料（参考）', value: '約1万〜10万円' }],
  [{ label: '対象人口（就労者＋成人, 参考）', value: '約6,000万人' }, { label: '年間受診率（参考）', value: '約60〜70%' }, { label: '1人あたり受診単価（参考）', value: '約1万〜5万円' }],
  [{ label: '大規模空港の検査レーン数（参考）', value: '約20〜40レーン' }, { label: '1人あたり処理時間（参考）', value: '約15〜20秒' }, { label: '1レーンの1時間処理人数（参考）', value: '約180〜240人' }],
  [{ label: '稼働オペレーター数（参考）', value: '約200〜400人' }, { label: '1件あたり平均通話時間（参考）', value: '約5〜8分' }, { label: '1日の稼働時間（参考）', value: '約10〜12時間' }],
  [{ label: '拠点の作業員数（参考）', value: '約500〜1,000人' }, { label: '1人/時のピック件数（参考）', value: '約60〜120件' }, { label: '1日の稼働時間（参考）', value: '約16〜20時間' }],
  [{ label: '1件あたり所要時間（参考）', value: '約1〜2分' }, { label: '1日の稼働時間（参考）', value: '約14〜18時間' }, { label: 'ピーク時の利用率（参考）', value: '約50〜70%' }],
  [{ label: '稼働診察室数（参考）', value: '約40〜80室' }, { label: '1患者あたり診察時間（参考）', value: '約10〜15分' }, { label: '外来診療時間（参考）', value: '約4〜6時間' }],
  [{ label: '1件あたり会計時間（参考）', value: '約1〜2分' }, { label: 'ピーク時の稼働率（参考）', value: '約80〜90%' }, { label: '1件あたり購入点数（参考）', value: '約10〜20点' }],
  [{ label: '片側車線数（参考）', value: '約2〜3車線' }, { label: '1車線あたり処理容量（参考）', value: '約1,800〜2,000台/時' }, { label: '平均稼働率（24時間平均, 参考）', value: '約30〜50%' }],
  [{ label: 'ラック数（参考）', value: '約2,000〜5,000ラック' }, { label: '1ラックあたり消費電力（参考）', value: '約5〜10kW' }, { label: 'PUE（電力使用効率, 参考）', value: '約1.3〜1.5' }],
  [{ label: '1個あたり所要時間（参考）', value: '約3〜5分' }, { label: '1日の配達稼働時間（参考）', value: '約7〜9時間' }, { label: '不在・再配達率（参考）', value: '約10〜15%' }],
  [{ label: '1サイクルの定員（参考）', value: '約20〜30人' }, { label: '1サイクル所要時間（乗降込み, 参考）', value: '約3〜5分' }, { label: '1日の運営時間（参考）', value: '約10〜12時間' }],
  [{ label: 'ピーク時の1時間あたり注文数（一都市, 参考）', value: '約2〜5万件' }, { label: '1件あたり配達所要時間（参考）', value: '約25〜35分' }, { label: 'ピークの継続時間（参考）', value: '約2〜3時間' }],
  [{ label: 'ピーク時の1分あたり入電数（参考）', value: '約30〜60件' }, { label: '平均待ち時間（参考）', value: '約3〜8分' }, { label: '応答可能オペレーター数（参考）', value: '約100〜200人' }],
  [{ label: '1店舗の月間固定費（参考）', value: '約150万〜250万円' }, { label: '月会費（参考）', value: '約7,000〜8,000円' }, { label: '無人運営の人件費比率（参考）', value: '固定費の約2〜3割' }],
  [{ label: '月額料金（参考）', value: '約1,000〜1,500円' }, { label: '月次解約率（参考）', value: '約3〜5%' }, { label: '粗利率（参考）', value: '約30〜40%' }],
  [{ label: '両都市圏の合計人口（参考）', value: '約500万〜1,000万人' }, { label: '年間に相手都市へ移動する割合（参考）', value: '約5〜15%' }, { label: '航空の交通分担率（参考）', value: '約10〜30%' }],
  [{ label: '商圏人口（車5分圏, 参考）', value: '約3万〜5万人' }, { label: '客単価（参考）', value: '約1,000〜1,500円' }, { label: '1人あたり年間来店回数（参考）', value: '約3〜6回' }],
  [{ label: '年間売上', value: '12億円' }, { label: 'SaaSの典型的粗利率（参考）', value: '約70〜80%' }, { label: '主な原価（クラウド・サポート）', value: '売上の約20〜30%' }],
  [{ label: '会員1人あたり獲得コスト（参考）', value: '約3,000〜6,000円' }, { label: '月額料金（参考）', value: '約500〜1,000円' }, { label: '粗利率（参考）', value: '約70〜80%' }],
  [{ label: '月間の固定費（償却＋運営, 参考）', value: '約30万〜60万円' }, { label: '1回あたり充電売上（参考）', value: '約1,000〜2,000円' }, { label: '電気代の原価率（参考）', value: '売上の約40〜50%' }],
  [{ label: '都市部の共働き・高所得世帯（参考）', value: '約300万〜500万世帯' }, { label: '家事代行の利用率（参考）', value: '約3〜8%' }, { label: '1世帯あたり年間支出（参考）', value: '約10万〜30万円' }],
  [{ label: '1店舗の初期投資（内装・設備, 参考）', value: '約1,000万〜2,500万円' }, { label: '1店舗の年商（参考）', value: '約3,000万〜5,000万円' }, { label: '営業利益率（参考）', value: '約8〜15%' }],
  [{ label: '1店舗の機器台数（洗濯＋乾燥, 参考）', value: '約10〜20台' }, { label: '1台あたり1日稼働回数（参考）', value: '約3〜5回' }, { label: '1回あたり単価（参考）', value: '約500〜800円' }],
  [{ label: '加盟店数', value: '100店' }, { label: '1店舗の年商（参考）', value: '約5,000万〜1億円' }, { label: 'ロイヤリティ率（参考）', value: '約3〜6%' }],
  [{ label: '年商', value: '10億円' }, { label: '原価率（参考）', value: '約40〜50%' }, { label: 'シーズン売れ残り率（参考）', value: '約20〜30%' }, { label: '処分時の損失率（参考）', value: '約50〜70%' }],
  [{ label: '747クラス機内のおおよその容積（客室＋貨物）', value: '約800〜1,000m³' }, { label: 'ゴルフボール直径', value: '約4.3cm（体積約42cm³）' }, { label: '球の詰め込み効率（参考）', value: '約60〜65%' }],
  [{ label: '教室のおおよその広さ', value: '約8m×8m×天井高3m（約190m³）' }, { label: 'ピンポン玉直径', value: '約4cm（体積約33cm³）' }, { label: '球の詰め込み効率（参考）', value: '約60〜65%' }],
  [{ label: '東京ドームの容積', value: '約124万m³' }, { label: '単位換算', value: '1m³＝1,000L' }],
  [{ label: 'プールのおおよその寸法', value: '約25m×13m×平均水深1.3m' }, { label: '単位換算', value: '1m³＝1,000L' }],
  [{ label: '砂浜の体積', value: '約5,000m³（100×50×1）' }, { label: '砂粒1個のおおよその直径', value: '約0.3mm（体積約0.000027cm³）' }, { label: '砂の充填効率（参考）', value: '約60%' }],
  [{ label: '1ページの行数（参考）', value: '約16〜18行' }, { label: '1行の文字数（参考）', value: '約40字' }, { label: '本文ページ数', value: '約300ページ' }],
  [{ label: '蔵書数', value: '約20万冊' }, { label: '1冊あたりの平均ページ数（参考）', value: '約250〜300ページ' }, { label: '1ページの単語数（参考）', value: '約300〜350語' }],
  [{ label: 'スクールバス車内のおおよその容積', value: '約45m³（約11m×2.4m×1.7m）' }, { label: 'テニスボール直径', value: '約6.7cm（体積約157cm³）' }, { label: '球の詰め込み効率（参考）', value: '約60〜65%' }],
  [{ label: '冷蔵庫の容積', value: '約400L（0.4m³）' }, { label: '1円玉の寸法（直径×厚み）', value: '約2cm×0.15cm（体積約0.47cm³）' }, { label: '充填効率（参考）', value: '約60%' }],
  [{ label: 'プールの水量', value: '約42万L（約4.2億mL）' }, { label: '水1滴の体積（参考）', value: '約0.05mL（1mLが約20滴）' }],
  [{ label: 'エレベーターかごのおおよその容積', value: '約4m³（約1.5m×1.5m×1.8m）' }, { label: 'ビー玉直径', value: '約1.5cm（体積約1.8cm³）' }, { label: '球の詰め込み効率（参考）', value: '約60〜65%' }],
  [{ label: '大型コンテナ船の積載容積（参考）', value: '約20万m³' }, { label: '小石1個のおおよその直径', value: '約1cm（体積約0.5cm³）' }, { label: '砂利の充填効率（参考）', value: '約60%' }],
  [{ label: '20フィートコンテナの内容積', value: '約33m³' }, { label: 'サッカーボール直径', value: '約22cm（体積約5,600cm³）' }, { label: '球の詰め込み効率（参考）', value: '約60〜65%' }],
  [{ label: '頭皮の有毛面積（参考）', value: '約600〜700cm²' }, { label: '毛穴密度（参考）', value: '約150〜200本/cm²' }, { label: '1本の太さ（参考）', value: '約0.08mm' }],
  [{ label: '安静時心拍数（参考）', value: '約60〜80回/分' }, { label: '1年の分数', value: '約53万分' }, { label: '寿命（参考）', value: '約80年' }],
  [{ label: '安静時呼吸数（参考）', value: '約12〜18回/分' }, { label: '1年の分数', value: '約53万分' }, { label: '寿命（参考）', value: '約80年' }],
  [{ label: 'まばたき回数（参考）', value: '約15〜20回/分' }, { label: '1日の覚醒時間（参考）', value: '約16時間' }, { label: '寿命（参考）', value: '約80年' }],
  [{ label: '成人の体重（参考）', value: '約60〜70kg' }, { label: '細胞の大きさ（参考）', value: '1辺約10〜20μm' }, { label: '細胞1個の質量（参考）', value: '約1〜3ナノグラム' }],
  [{ label: '頭髪の総本数（参考）', value: '約10万本' }, { label: '毛髪の寿命（参考）', value: '約2〜6年' }, { label: '1日の脱毛率（参考）', value: '約0.05〜0.1%' }],
  [{ label: '成人の体重（参考）', value: '約60〜70kg' }, { label: '血液の体重比（参考）', value: '約7〜8%' }, { label: '血液の密度（参考）', value: '約1.05kg/L' }],
  [{ label: '1日の歩数（参考）', value: '約5,000〜8,000歩' }, { label: '歩幅（参考）', value: '約0.6〜0.7m' }, { label: '歩く年数（参考）', value: '約75年' }],
  [{ label: '中型犬の体重（参考）', value: '約10〜15kg' }, { label: '1日の給餌量（参考）', value: '約200〜300g' }, { label: '寿命（参考）', value: '約13年' }],
  [{ label: '1日の基礎涙分泌量（参考）', value: '約0.5〜1mL' }, { label: '1年の日数', value: '365日' }, { label: '寿命（参考）', value: '約80年' }],
  [{ label: '1日の飲水量（参考）', value: '約1.5〜2L' }, { label: '1年の日数', value: '365日' }, { label: '寿命（参考）', value: '約80年' }],
  [{ label: '体表面積（参考）', value: '約1.7m²' }, { label: '1日に剥がれる角質（参考）', value: '約0.5〜1.5g' }, { label: '皮膚の入れ替わり周期（参考）', value: '約4週間' }],
  [{ label: '太い枝の本数（参考）', value: '約10〜20本' }, { label: '太枝あたりの小枝数（参考）', value: '約100〜200本' }, { label: '小枝あたりの葉数（参考）', value: '約20〜50枚' }],
  [{ label: '夕立の降水量（参考）', value: '約20mm（= 0.02m）' }, { label: '対象面積', value: '1km²（= 10⁶ m²）' }, { label: '雨粒1粒の直径（参考）', value: '約2mm（体積 約4mm³）' }],
  [{ label: '地球の赤道円周', value: '約4万km（4×10⁷ m）' }, { label: '1歩の歩幅（参考）', value: '約0.7m' }],
  [{ label: '富士山の高さ（参考の山体高）', value: '約3,000m' }, { label: '裾野の半径（参考）', value: '約15km' }, { label: '岩石の密度（参考）', value: '約2.6t/m³' }, { label: 'ダンプ1台の積載量', value: '10トン' }],
  [{ label: '海洋の表面積（参考）', value: '約3.6×10⁸ km²' }, { label: '海の平均水深（参考）', value: '約3,700m' }, { label: 'バケツ1杯の容量', value: '10L（= 0.01m³）' }],
  [{ label: '全天の肉眼可視星の総数（参考）', value: '約6,000個' }, { label: '地平線より上の割合', value: '約1/2' }, { label: '実際に見える割合（光害等, 参考）', value: '約1/2〜2/3' }],
  [{ label: '地球全体の落雷頻度（参考）', value: '約40〜50回/秒' }, { label: '1日の秒数', value: '約86,400秒' }],
  [{ label: '対象面積（球場規模, 参考）', value: '約1万m²' }, { label: '砂の深さ（参考）', value: '約1m' }, { label: '砂粒の直径（参考）', value: '約0.5mm（体積 約0.07mm³）' }, { label: '空隙率（すき間, 参考）', value: '約35%' }],
  [{ label: '日本の国土面積', value: '約38万km²（3.8×10¹¹ m²）' }, { label: '年間平均降水量（参考）', value: '約1,700mm（= 1.7m）' }, { label: '水の密度', value: '約1トン/m³' }],
  [{ label: '最も近い恒星までの距離（参考）', value: '約4×10¹³ km' }, { label: '光の速さ', value: '約30万km/秒' }, { label: '1年の秒数', value: '約3.15×10⁷秒' }],
  [{ label: '積雲の差し渡し（参考）', value: '約1km' }, { label: '雲の水分密度（参考）', value: '約0.5g/m³' }],
  [{ label: '1m²あたりの昆虫個体数（参考）', value: '約1,000〜10,000匹' }, { label: '対象面積', value: '1km²（= 10⁶ m²）' }],
  [{ label: '東京都の世帯数', value: '約700万世帯' }, { label: 'ピアノ保有率（参考）', value: '約3〜5%' }, { label: '1台あたり年間調律回数（参考）', value: '約1回' }, { label: '調律師1人の年間こなせる件数（参考）', value: '約800〜1,000件' }],
  [{ label: '全国のピアノ保有台数（参考）', value: '約200〜300万台' }, { label: '1台あたり年間調律回数（参考）', value: '約0.5〜1回' }, { label: '調律師1人の年間処理件数（参考）', value: '約800件' }],
  [{ label: '東京23区の道路総延長（参考）', value: '約12,000km' }, { label: 'マンホールの平均設置間隔（参考）', value: '約30〜50m' }, { label: '系統数（下水・電気・通信など, 参考）', value: '約2〜3系統' }],
  [{ label: '日本の人口', value: '約1億2,400万人' }, { label: '人口1万人あたり信号機数（参考）', value: '約15〜20基' }, { label: '信号機1基の平均間隔（市街地, 参考）', value: '約200〜400m' }],
  [{ label: '日本の人口', value: '約1億2,400万人' }, { label: 'パンを食べる人の割合（参考）', value: '約70%' }, { label: '1人あたり1日のパン消費（参考）', value: '約1〜1.5個相当' }],
  [{ label: '全国の自販機台数（参考）', value: '約400万台' }, { label: '自販機1台あたりの幅（参考）', value: '約1.0〜1.2m' }, { label: '参考：日本列島の長さ', value: '約3,000km' }],
  [{ label: '全国のタクシー台数（参考）', value: '約20〜23万台' }, { label: '1台あたり1日の走行距離（参考）', value: '約150〜250km' }, { label: '1日の稼働率（参考）', value: '約60〜70%' }],
  [{ label: '日本列島の縦断距離（参考）', value: '約3,000km' }, { label: 'カタツムリの移動速度（参考）', value: '約1mm/秒（約3.6m/時）' }, { label: '参考：1日＝24時間', value: '86,400秒' }],
  [{ label: '東京23区の道路総延長（参考）', value: '約12,000km' }, { label: '街灯の平均設置間隔（参考）', value: '約25〜40m' }, { label: '幹線・生活道路の比率（参考）', value: '約1:4' }],
  [{ label: '日本の人口', value: '約1億2,400万人' }, { label: '平均来店間隔（参考）', value: '約40〜60日' }, { label: '理美容師1人の1日施術件数（参考）', value: '約8〜12件' }],
  [{ label: '髪の伸びる速さ（参考）', value: '約1.0〜1.5cm/月' }, { label: '頭髪の本数（参考）', value: '約10万本' }, { label: '平均寿命（参考）', value: '約80年' }],
  [{ label: '国内の年間米消費量（参考）', value: '約700万トン' }, { label: '米1粒の重さ（参考）', value: '約0.02g' }, { label: '参考：茶碗1杯の米粒数', value: '約3,000〜3,500粒' }],
  [{ label: '日本の人口', value: '約1億2,400万人' }, { label: 'ビニール傘を使う人の割合（参考）', value: '約60〜70%' }, { label: '1人あたり年間ビニール傘購入（参考）', value: '約1〜2本' }],
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
  // 50: cost-structure (basic)
  [{ label: 'Salon staff', value: '4 stylists' }, { label: 'Monthly pay/stylist', value: '~$3,000–4,000' }, { label: 'Payroll add-on', value: '~+20%' }, { label: 'Worked estimate', value: '4 stylists × ~$3,500/mo ≈ $14,000 in wages; +~20% for payroll taxes/benefits → ~$17,000/month. Order: ~$10^4/month in labor.' }],
  // 51: platform-concurrency (basic)
  [{ label: 'US fast-food outlets', value: '~200,000' }, { label: 'Seats/outlet', value: '~40' }, { label: 'Lunch-peak fill', value: '~50–70%' }, { label: 'Worked estimate', value: '~200,000 outlets × ~40 seats × ~60% filled at the noon peak ≈ 4.8M people seated at once. Many outlets are drive-thru/takeout heavy, so dine-in concurrency is order ~10^6.' }],
  // 52: unit-economics (basic)
  [{ label: 'Customers/day', value: '~200–300' }, { label: 'Spend/customer', value: '~$8' }, { label: 'Open hours', value: '~8–10' }, { label: 'Worked estimate', value: '~250 customers/day × ~$8 average spend ≈ $2,000/day. Cross-check: a small bakery typically does ~$1,500–3,000/day → order of ~$10^3/day.' }],
  // 53: market-sizing (basic)
  [{ label: 'US', value: '~330M people' }, { label: 'Spend/person/yr', value: '~$40' }, { label: 'Demand', value: 'students + offices' }, { label: 'Worked estimate', value: '~330M people × ~$40/yr on stationery and supplies ≈ $13B. Cross-check vs. reported US office-supply/stationery retail (~$10–15B) → order of ~$10^10.' }],
  // 54: cost-structure (standard)
  [{ label: 'Clerk wage', value: '~$13/hr' }, { label: 'Daily staff-hours', value: '~40–50' }, { label: 'Utilities', value: '~$3,000/mo' }, { label: 'Worked estimate', value: 'Labor: ~45 staff-hours/day × ~$13 × 30 ≈ $17,500/mo; rent ~$6,000; utilities ~$3,000; misc ~$2,000 → ~$28,000/month operating cost. Order: tens of thousands USD/month.' }],
  // 55: platform-concurrency (standard)
  [{ label: 'US daily transit boardings', value: '~30M' }, { label: 'Morning peak', value: '~2 hours' }, { label: 'Avg trip', value: '~25 min' }, { label: 'Worked estimate', value: '~30M weekday boardings; ~25% fall in the morning peak hour → ~7.5M boardings/hour; each rider is aboard ~25 min (~0.4 hr) → ~3M people in transit at the peak instant. Order: ~10^6 concurrent riders.' }],
  // 56: cost-structure (standard)
  [{ label: 'Store annual sales', value: '~$20M' }, { label: 'Perishable share', value: '~40%' }, { label: 'Spoilage rate', value: '~2–5%' }, { label: 'Worked estimate', value: '$20M sales × ~40% perishable ($8M) × ~3% spoilage ≈ $240K/year thrown away. Cross-check: grocery shrink runs ~1–3% of total sales (~$200–600K on $20M) → order of hundreds of thousands USD/year.' }],
  // 57: national-sizing (standard)
  [{ label: 'US adults', value: '~250M' }, { label: 'Drink coffee daily', value: '~60%' }, { label: 'To-go share', value: '~1 cup/day for ~25%' }, { label: 'Worked estimate', value: '~150M daily coffee drinkers; ~25% buy ~1 disposable to-go cup/day → ~38M cups/day × 365 ≈ 14B cups/year. Commonly cited US figure is ~50B disposable cups/year incl. all beverages → order of ~10^10.' }],
  // 58: cost-structure (advanced)
  [{ label: 'Rentable area', value: '~150,000 sq ft' }, { label: 'OpEx/sq ft/yr', value: '~$8–12' }, { label: 'Cost lines', value: 'cleaning, security, HVAC, utilities, taxes' }, { label: 'Worked estimate', value: '~150,000 sq ft × ~$10/sq ft/yr operating expense ≈ $1.5M/year (cleaning, security, maintenance, utilities, insurance, property tax). Order: low single-digit millions USD/year.' }],
  // 59: platform-supply-demand (advanced)
  [{ label: 'US parcels/year', value: '~22B' }, { label: 'Parcels/day', value: '~60M' }, { label: 'Dwell in network', value: '~2–3 days' }, { label: 'Worked estimate', value: '~60M parcels/day × ~2.5 days average dwell in the network ≈ 150M parcels in transit at any moment (flow × dwell = stock). Order: ~10^8 parcels in transit.' }],
  // 60: unit-economics (advanced)
  [{ label: 'Restaurant annual sales', value: '~$2M' }, { label: 'Food cost', value: '~30%' }, { label: 'Labor', value: '~30%' }, { label: 'Worked estimate', value: '$2M revenue − ~30% food − ~30% labor − ~25% rent/utilities/overhead leaves ~10–15% pre-tax, but typical full-service margins run ~3–6% → ~$60–120K operating profit. Order: tens of thousands to ~$10^5 USD/year.' }],
  // 61: unit-economics (advanced)
  [{ label: 'Practice annual revenue', value: '~$800K' }, { label: 'Patients/day', value: '~20–30' }, { label: 'Overhead', value: '~60–65% of revenue' }, { label: 'Worked estimate', value: '~$800K revenue × ~35% net (after ~65% overhead for staff, supplies, lab, rent) ≈ ~$280K owner operating profit. Cross-check: solo-dentist practices commonly net ~$150–300K → order of ~$10^5/year.' }],
  // ── 2026-06-14 追加: フェルミ100問（コンサル系＋古典） ──
  [{ label: 'US adult women (approx.)', value: 'about 130 million' }, { label: 'Share who buy cosmetics (approx.)', value: 'about 70-80%' }, { label: 'Annual cosmetics spend per person (approx.)', value: 'about $200-400' }],
  [{ label: 'US population', value: 'about 330 million' }, { label: 'Annual clothing spend per person (approx.)', value: 'about $800-1,200' }, { label: 'Items bought per year (approx.)', value: 'about 50-70 items' }],
  [{ label: 'US households', value: 'about 130 million' }, { label: 'Share buying furniture per year (approx.)', value: 'about 30-40%' }, { label: 'Annual furniture spend per buying household (approx.)', value: 'about $400-800' }],
  [{ label: 'US dollar-store outlets (approx.)', value: 'about 35,000-40,000' }, { label: 'Revenue per store per day (approx.)', value: 'about $4,000-6,000' }, { label: 'Operating days per year', value: 'about 360' }],
  [{ label: 'US households', value: 'about 130 million' }, { label: 'Share of households using dry cleaning (approx.)', value: 'about 30-40%' }, { label: 'Visits per household per year (approx.)', value: 'about 5-10' }, { label: 'Spend per visit (approx.)', value: 'about $15-30' }],
  [{ label: 'Machines per laundromat (approx.)', value: 'about 20-40' }, { label: 'Cycles per machine per day (approx.)', value: 'about 3-6' }, { label: 'Price per cycle (approx.)', value: 'about $3-5' }],
  [{ label: 'US bookstores (approx.)', value: 'about 6,000-8,000' }, { label: 'Revenue per store per day (approx.)', value: 'about $2,000-4,000' }, { label: 'Operating days per year', value: 'about 350' }],
  [{ label: 'US children age 0-12 (approx.)', value: 'about 50 million' }, { label: 'Annual toy spend per child (approx.)', value: 'about $200-350' }, { label: 'Adult-hobby add-on (approx.)', value: 'about 20-30%' }],
  [{ label: 'US adult population (approx.)', value: 'about 260 million' }, { label: 'Share who regularly take supplements (approx.)', value: 'about 50-60%' }, { label: 'Annual supplement spend per user (approx.)', value: 'about $100-200' }],
  [{ label: 'US population', value: 'about 330 million' }, { label: 'Share buying prepared meals regularly (approx.)', value: 'about 50-60%' }, { label: 'Annual prepared-meal spend per person (approx.)', value: 'about $400-700' }],
  [{ label: 'US nail-salon clients (approx.)', value: 'about 30-40 million' }, { label: 'Visits per client per year (approx.)', value: 'about 6-12' }, { label: 'Spend per visit (approx.)', value: 'about $30-50' }],
  [{ label: 'US population', value: 'about 330 million' }, { label: 'Share who buy secondhand (approx.)', value: 'about 50-60%' }, { label: 'Annual secondhand spend per buyer (approx.)', value: 'about $150-300' }],
  [{ label: 'US K-12 students (approx.)', value: 'about 55 million' }, { label: 'Share using tutoring/test prep (approx.)', value: 'about 15-25%' }, { label: 'Annual spend per student (approx.)', value: 'about $1,000-2,500' }],
  [{ label: 'US businesses', value: 'approx. 33 million' }, { label: 'Cloud-adoption rate (ref.)', value: 'approx. 60-70%' }, { label: 'Annual cloud spend per company (ref.)', value: 'approx. $1k-$millions (SMB to enterprise)' }],
  [{ label: 'US businesses', value: 'approx. 33 million' }, { label: 'Security-adoption rate (ref.)', value: 'approx. 50-70%' }, { label: 'Annual security spend per company (ref.)', value: 'approx. $1k-$millions' }],
  [{ label: 'Hires placed via agencies (ref.)', value: 'approx. several million/yr' }, { label: 'Share placed via agencies (ref.)', value: 'approx. 15-25%' }, { label: 'Placement fee (ref.)', value: 'approx. 20-30% of first-year salary' }],
  [{ label: 'US businesses', value: 'approx. 33 million' }, { label: 'Accounting-software adoption (ref.)', value: 'approx. 70-80%' }, { label: 'Annual spend per company (ref.)', value: 'approx. $300-$10k+' }],
  [{ label: 'Adults needing long-term care (ref.)', value: 'tens of millions' }, { label: 'Share using paid services (ref.)', value: 'approx. 50-70%' }, { label: 'Annual care cost per person (ref.)', value: 'approx. $10k-$100k+' }],
  [{ label: 'US retail pharmacies (ref.)', value: 'approx. 60,000 stores' }, { label: 'Prescriptions per store per day (ref.)', value: 'approx. 150-250' }, { label: 'Revenue per prescription (ref.)', value: 'approx. $50-$80' }],
  [{ label: 'US veterinary clinics (ref.)', value: 'approx. 30,000-35,000' }, { label: 'Patients per clinic per day (ref.)', value: 'approx. 20-30' }, { label: 'Revenue per visit (ref.)', value: 'approx. $100-$250' }],
  [{ label: 'US school-age children (ref.)', value: 'approx. 50 million' }, { label: 'Share using paid tutoring (ref.)', value: 'approx. 10-20%' }, { label: 'Annual spend per child (ref.)', value: 'approx. $1,000-$3,000' }],
  [{ label: 'US warehouse floor area (ref.)', value: 'approx. 15-20 billion sq ft' }, { label: 'Rent per sq ft per year (ref.)', value: 'approx. $7-$12' }, { label: 'Period', value: '12 months' }],
  [{ label: 'US personal consumption (ref.)', value: 'approx. $18 trillion/yr' }, { label: 'Cashless share (ref.)', value: 'approx. 70-80%' }, { label: 'Mix', value: 'card-dominated, wallets growing' }],
  [{ label: 'US population', value: 'approx. 335 million' }, { label: 'Share buying/selling used (ref.)', value: 'approx. 40-50%' }, { label: 'Annual transaction value per person (ref.)', value: 'approx. $200-$500' }],
  [{ label: 'US workforce', value: 'approx. 165 million' }, { label: 'E-learning participation (ref.)', value: 'approx. 15-25%' }, { label: 'Annual spend per learner (ref.)', value: 'approx. $200-$1,000' }],
  [{ label: 'Eligible adults (ref.)', value: 'approx. 200 million' }, { label: 'Annual checkup rate (ref.)', value: 'approx. 50-70%' }, { label: 'Price per checkup (ref.)', value: 'approx. $100-$500' }],
  [{ label: 'Security lanes at a large airport', value: 'about 20-40 lanes' }, { label: 'Seconds per passenger', value: 'about 15-20 s' }, { label: 'Passengers per lane per hour', value: 'about 180-240' }],
  [{ label: 'Agents on shift', value: 'about 200-400' }, { label: 'Average handle time per call', value: 'about 5-8 min' }, { label: 'Operating hours per day', value: 'about 10-12 h' }],
  [{ label: 'Workers at the site', value: 'about 500-1,000' }, { label: 'Picks per worker per hour', value: 'about 60-120' }, { label: 'Operating hours per day', value: 'about 16-20 h' }],
  [{ label: 'Time per transaction', value: 'about 1-2 min' }, { label: 'Operating hours per day', value: 'about 14-18 h' }, { label: 'Peak-hour utilization', value: 'about 50-70%' }],
  [{ label: 'Exam rooms in use', value: 'about 40-80' }, { label: 'Minutes per patient', value: 'about 10-15 min' }, { label: 'Outpatient clinic hours', value: 'about 4-6 h' }],
  [{ label: 'Time per checkout', value: 'about 1-2 min' }, { label: 'Peak-hour utilization', value: 'about 80-90%' }, { label: 'Items per basket', value: 'about 10-20' }],
  [{ label: 'Lanes per direction', value: 'about 2-3' }, { label: 'Lane capacity', value: 'about 1,800-2,000 veh/h' }, { label: 'Average utilization (24h)', value: 'about 30-50%' }],
  [{ label: 'Racks at the site', value: 'about 2,000-5,000' }, { label: 'Power per rack', value: 'about 5-10 kW' }, { label: 'PUE', value: 'about 1.3-1.5' }],
  [{ label: 'Minutes per stop', value: 'about 3-5 min' }, { label: 'Delivery hours per day', value: 'about 7-9 h' }, { label: 'Failed/redelivery rate', value: 'about 10-15%' }],
  [{ label: 'Riders per cycle', value: 'about 20-30' }, { label: 'Cycle time (incl. load/unload)', value: 'about 3-5 min' }, { label: 'Operating hours per day', value: 'about 10-12 h' }],
  [{ label: 'Orders per hour at peak (one city)', value: 'about 20k-50k' }, { label: 'Delivery time per order', value: 'about 25-35 min' }, { label: 'Peak duration', value: 'about 2-3 h' }],
  [{ label: 'Calls arriving per minute at peak', value: 'about 30-60' }, { label: 'Average wait time', value: 'about 3-8 min' }, { label: 'Agents available', value: 'about 100-200' }],
  [{ label: 'Monthly fixed cost per location', value: '~$15,000–25,000' }, { label: 'Monthly dues per member', value: '~$30–40' }, { label: 'Staff share of fixed cost', value: '~20–30%' }],
  [{ label: 'Monthly price', value: '~$10–15' }, { label: 'Monthly churn rate', value: '~3–5%' }, { label: 'Gross margin', value: '~30–40%' }],
  [{ label: 'Combined metro population', value: '~5–10 million' }, { label: 'Annual cross-city travel share', value: '~5–15%' }, { label: 'Air modal share', value: '~10–30%' }],
  [{ label: 'Trade-area population (5-min drive)', value: '~30,000–50,000' }, { label: 'Average ticket', value: '~$12–18' }, { label: 'Visits per resident per year', value: '~3–6' }],
  [{ label: 'Annual revenue', value: '$12M' }, { label: 'Typical SaaS gross margin', value: '~70–80%' }, { label: 'COGS (cloud + support)', value: '~20–30% of revenue' }],
  [{ label: 'Customer acquisition cost', value: '~$30–60' }, { label: 'Monthly price', value: '~$5–10' }, { label: 'Gross margin', value: '~70–80%' }],
  [{ label: 'Monthly fixed cost (depreciation + ops)', value: '~$3,000–6,000' }, { label: 'Revenue per session', value: '~$8–16' }, { label: 'Electricity cost ratio', value: '~40–50% of revenue' }],
  [{ label: 'Urban dual-income / high-income households', value: '~3–5 million' }, { label: 'Cleaning-service adoption rate', value: '~3–8%' }, { label: 'Annual spend per household', value: '~$1,500–3,000' }],
  [{ label: 'Initial build-out investment', value: '~$80,000–200,000' }, { label: 'Annual revenue per café', value: '~$200,000–350,000' }, { label: 'Operating margin', value: '~8–15%' }],
  [{ label: 'Machines per location (wash + dry)', value: '~10–20' }, { label: 'Cycles per machine per day', value: '~3–5' }, { label: 'Price per cycle', value: '~$3–5' }],
  [{ label: 'Number of stores', value: '100' }, { label: 'Annual revenue per store', value: '~$800,000–1.5M' }, { label: 'Royalty rate', value: '~3–6%' }],
  [{ label: 'Annual revenue', value: '$10M' }, { label: 'Cost-of-goods ratio', value: '~40–50%' }, { label: 'Season leftover rate', value: '~20–30%' }, { label: 'Loss rate on clearance', value: '~50–70%' }],
  [{ label: 'Approx. interior volume of a 747 (cabin + cargo)', value: 'about 800–1,000 m³' }, { label: 'Golf ball diameter', value: 'about 4.3 cm (volume ~42 cm³)' }, { label: 'Sphere packing efficiency (ref.)', value: 'about 60–65%' }],
  [{ label: 'Approx. classroom size', value: 'about 8m × 8m × 3m high (~190 m³)' }, { label: 'Ping-pong ball diameter', value: 'about 4 cm (volume ~33 cm³)' }, { label: 'Sphere packing efficiency (ref.)', value: 'about 60–65%' }],
  [{ label: 'Stadium dome interior volume', value: 'about 1.24 million m³' }, { label: 'Unit conversion', value: '1 m³ = 1,000 L' }],
  [{ label: 'Approx. pool dimensions', value: 'about 25m × 13m × 1.3m average depth' }, { label: 'Unit conversion', value: '1 m³ = 1,000 L' }],
  [{ label: 'Beach section volume', value: 'about 5,000 m³ (100×50×1)' }, { label: 'Approx. grain diameter', value: 'about 0.3 mm (volume ~2.7×10⁻⁵ cm³)' }, { label: 'Sand packing efficiency (ref.)', value: 'about 60%' }],
  [{ label: 'Lines per page (ref.)', value: 'about 16–18 lines' }, { label: 'Characters per line (ref.)', value: 'about 40' }, { label: 'Text pages', value: 'about 300' }],
  [{ label: 'Number of books', value: 'about 200,000' }, { label: 'Average pages per book (ref.)', value: 'about 250–300' }, { label: 'Words per page (ref.)', value: 'about 300–350' }],
  [{ label: 'Approx. school bus interior volume', value: 'about 45 m³ (~11m × 2.4m × 1.7m)' }, { label: 'Tennis ball diameter', value: 'about 6.7 cm (volume ~157 cm³)' }, { label: 'Sphere packing efficiency (ref.)', value: 'about 60–65%' }],
  [{ label: 'Refrigerator volume', value: 'about 400 L (0.4 m³)' }, { label: 'Coin size (diameter × thickness)', value: 'about 1.9cm × 0.15cm (volume ~0.43 cm³)' }, { label: 'Packing efficiency (ref.)', value: 'about 60%' }],
  [{ label: 'Pool water volume', value: 'about 420,000 L (~4.2×10⁸ mL)' }, { label: 'Volume of one drop (ref.)', value: 'about 0.05 mL (~20 drops per mL)' }],
  [{ label: 'Approx. elevator car volume', value: 'about 4 m³ (~1.5m × 1.5m × 1.8m)' }, { label: 'Marble diameter', value: 'about 1.5 cm (volume ~1.8 cm³)' }, { label: 'Sphere packing efficiency (ref.)', value: 'about 60–65%' }],
  [{ label: 'Large container ship cargo volume (ref.)', value: 'about 200,000 m³' }, { label: 'Approx. pebble diameter', value: 'about 1 cm (volume ~0.5 cm³)' }, { label: 'Gravel packing efficiency (ref.)', value: 'about 60%' }],
  [{ label: '20-foot container internal volume', value: 'about 33 m³' }, { label: 'Soccer ball diameter', value: 'about 22 cm (volume ~5,600 cm³)' }, { label: 'Sphere packing efficiency (ref.)', value: 'about 60–65%' }],
  [{ label: 'Haired scalp area (ref.)', value: 'about 600-700 cm²' }, { label: 'Follicle density (ref.)', value: 'about 150-200 hairs/cm²' }, { label: 'Hair diameter (ref.)', value: 'about 0.08 mm' }],
  [{ label: 'Resting heart rate (ref.)', value: 'about 60-80 bpm' }, { label: 'Minutes per year', value: 'about 525,600 min' }, { label: 'Lifespan (ref.)', value: 'about 80 years' }],
  [{ label: 'Resting breathing rate (ref.)', value: 'about 12-18 breaths/min' }, { label: 'Minutes per year', value: 'about 525,600 min' }, { label: 'Lifespan (ref.)', value: 'about 80 years' }],
  [{ label: 'Blink rate (ref.)', value: 'about 15-20 blinks/min' }, { label: 'Waking hours per day (ref.)', value: 'about 16 hours' }, { label: 'Lifespan (ref.)', value: 'about 80 years' }],
  [{ label: 'Adult body mass (ref.)', value: 'about 60-70 kg' }, { label: 'Typical cell size (ref.)', value: 'about 10-20 μm per side' }, { label: 'Mass of one cell (ref.)', value: 'about 1-3 nanograms' }],
  [{ label: 'Total head hairs (ref.)', value: 'about 100,000' }, { label: 'Hair lifespan (ref.)', value: 'about 2-6 years' }, { label: 'Daily shed rate (ref.)', value: 'about 0.05-0.1%' }],
  [{ label: 'Adult body mass (ref.)', value: 'about 60-70 kg' }, { label: 'Blood as share of body weight (ref.)', value: 'about 7-8%' }, { label: 'Blood density (ref.)', value: 'about 1.05 kg/L' }],
  [{ label: 'Steps per day (ref.)', value: 'about 5,000-8,000' }, { label: 'Stride length (ref.)', value: 'about 0.6-0.7 m' }, { label: 'Walking years (ref.)', value: 'about 75 years' }],
  [{ label: 'Medium dog weight (ref.)', value: 'about 10-15 kg' }, { label: 'Daily food amount (ref.)', value: 'about 200-300 g' }, { label: 'Lifespan (ref.)', value: 'about 13 years' }],
  [{ label: 'Daily basal tear output (ref.)', value: 'about 0.5-1 mL' }, { label: 'Days per year', value: '365 days' }, { label: 'Lifespan (ref.)', value: 'about 80 years' }],
  [{ label: 'Daily fluid intake (ref.)', value: 'about 1.5-2 L' }, { label: 'Days per year', value: '365 days' }, { label: 'Lifespan (ref.)', value: 'about 80 years' }],
  [{ label: 'Body surface area (ref.)', value: 'about 1.7 m²' }, { label: 'Skin shed per day (ref.)', value: 'about 0.5-1.5 g' }, { label: 'Skin turnover cycle (ref.)', value: 'about 4 weeks' }],
  [{ label: 'Main branches (approx.)', value: 'about 10-20' }, { label: 'Twigs per main branch (approx.)', value: 'about 100-200' }, { label: 'Leaves per twig (approx.)', value: 'about 20-50' }],
  [{ label: 'Storm rainfall (approx.)', value: 'about 20mm (0.02m)' }, { label: 'Area', value: '1km² (10⁶ m²)' }, { label: 'Raindrop diameter (approx.)', value: 'about 2mm (volume ~4mm³)' }],
  [{ label: 'Earth\'s equatorial circumference', value: 'about 40,000km (4×10⁷ m)' }, { label: 'Stride length (approx.)', value: 'about 0.7m' }],
  [{ label: 'Mountain height (above base, approx.)', value: 'about 3,000m' }, { label: 'Base radius (approx.)', value: 'about 15km' }, { label: 'Rock density (approx.)', value: 'about 2.6 t/m³' }, { label: 'Load per truck', value: '10 tonnes' }],
  [{ label: 'Ocean surface area (approx.)', value: 'about 3.6×10⁸ km²' }, { label: 'Average ocean depth (approx.)', value: 'about 3,700m' }, { label: 'Bucket capacity', value: '10L (0.01m³)' }],
  [{ label: 'Naked-eye stars over whole sky (approx.)', value: 'about 6,000' }, { label: 'Fraction above the horizon', value: 'about 1/2' }, { label: 'Fraction actually visible (haze/light, approx.)', value: 'about 1/2-2/3' }],
  [{ label: 'Global lightning rate (approx.)', value: 'about 40-50 strikes/sec' }, { label: 'Seconds per day', value: 'about 86,400' }],
  [{ label: 'Area (ballpark scale, approx.)', value: 'about 10,000m²' }, { label: 'Sand depth (approx.)', value: 'about 1m' }, { label: 'Grain diameter (approx.)', value: 'about 0.5mm (volume ~0.07mm³)' }, { label: 'Porosity (gaps, approx.)', value: 'about 35%' }],
  [{ label: 'Land area of Japan', value: 'about 380,000km² (3.8×10¹¹ m²)' }, { label: 'Annual precipitation (approx.)', value: 'about 1,700mm (1.7m)' }, { label: 'Density of water', value: 'about 1 tonne/m³' }],
  [{ label: 'Distance to nearest star (approx.)', value: 'about 4×10¹³ km' }, { label: 'Speed of light', value: 'about 300,000 km/s' }, { label: 'Seconds per year', value: 'about 3.15×10⁷' }],
  [{ label: 'Cumulus cloud size (approx.)', value: 'about 1km across' }, { label: 'Cloud liquid-water density (approx.)', value: 'about 0.5g/m³' }],
  [{ label: 'Insects per m² (approx.)', value: 'about 1,000-10,000' }, { label: 'Area', value: '1km² (10⁶ m²)' }],
  [{ label: 'Households in Chicago (metro)', value: 'about 3.5 million' }, { label: 'Share owning a piano (approx.)', value: 'about 2-5%' }, { label: 'Tunings per piano per year (approx.)', value: 'about 1' }, { label: 'Jobs one tuner does per year (approx.)', value: 'about 800-1,000' }],
  [{ label: 'Pianos in the US (approx.)', value: 'about 10-20 million' }, { label: 'Tunings per piano per year (approx.)', value: 'about 0.5-1' }, { label: 'Jobs one tuner does per year (approx.)', value: 'about 800-1,000' }],
  [{ label: 'Total street length in NYC (approx.)', value: 'about 10,000 km (6,000 mi)' }, { label: 'Average spacing between manholes (approx.)', value: 'about 30-60 m' }, { label: 'Number of utility systems (approx.)', value: 'about 2-3' }],
  [{ label: 'US population', value: 'about 330 million' }, { label: 'Signals per 10,000 people (approx.)', value: 'about 10' }, { label: 'Spacing between signals in urban areas (approx.)', value: 'about 0.2-0.5 km' }],
  [{ label: 'US population', value: 'about 330 million' }, { label: 'Share who eat bread daily (approx.)', value: 'about 80%' }, { label: 'Bread per person per day (loaf-equivalent, approx.)', value: 'about 0.1-0.2 loaf' }],
  [{ label: 'Vending machines in Japan (approx.)', value: 'about 4 million' }, { label: 'Width per machine (approx.)', value: 'about 1.0-1.2 m' }, { label: 'Reference: length of Japan', value: 'about 3,000 km' }],
  [{ label: 'Taxis + for-hire vehicles in NYC (approx.)', value: 'about 100,000' }, { label: 'Distance per vehicle per day (approx.)', value: 'about 150-250 km (90-150 mi)' }, { label: 'Share active on a given day (approx.)', value: 'about 60-70%' }],
  [{ label: 'Coast-to-coast distance (approx.)', value: 'about 4,500 km (2,800 mi)' }, { label: 'Snail crawl speed (approx.)', value: 'about 1 mm/s (about 3.6 m/h)' }, { label: 'Reference: 1 day = 24 hours', value: '86,400 seconds' }],
  [{ label: 'Total street length in London (approx.)', value: 'about 15,000 km' }, { label: 'Spacing between lamp posts (approx.)', value: 'about 25-40 m' }, { label: 'Main road vs. residential ratio (approx.)', value: 'about 1:4' }],
  [{ label: 'US population', value: 'about 330 million' }, { label: 'Average days between haircuts (approx.)', value: 'about 40-60 days' }, { label: 'Cuts per stylist per day (approx.)', value: 'about 8-12' }],
  [{ label: 'Hair growth rate (approx.)', value: 'about 1.0-1.5 cm/month' }, { label: 'Hairs on the head (approx.)', value: 'about 100,000' }, { label: 'Average lifespan (approx.)', value: 'about 80 years' }],
  [{ label: 'Annual rice consumption in Japan (approx.)', value: 'about 7 million tonnes' }, { label: 'Weight of one rice grain (approx.)', value: 'about 0.02 g' }, { label: 'Reference: grains per bowl', value: 'about 3,000-3,500' }],
  [{ label: 'UK population', value: 'about 67 million' }, { label: 'Share who buy umbrellas (approx.)', value: 'about 60-70%' }, { label: 'Umbrellas bought per person per year (approx.)', value: 'about 1-2' }],
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
