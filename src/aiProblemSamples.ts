// テーマプリセットごとのサンプル問題（ワンクッション画面で表示）
// 後日 DB / CMS 化想定。それまではこのファイル単体でメンテする。
//
// id: テーマ ID（getThemePresets の id と一致）
// title: 表示用タイトル（ja/en）
// difficulty: 難易度バッジ
// seedPrompt: 既存 generateAIProblems に渡すプロンプト（ja 1 件で十分。AI 側で言語自動判定する）

export type SampleDifficulty = 'beginner' | 'intermediate' | 'advanced'

export interface SampleProblem {
  id: string
  title: { ja: string; en: string }
  difficulty: SampleDifficulty
  seedPrompt: string
}

export const SAMPLE_PROBLEMS: Record<string, SampleProblem[]> = {
  fermi: [
    { id: 'fermi-01', title: { ja: '東京都内のコンビニ件数を推定せよ', en: "Estimate the number of convenience stores in Tokyo" }, difficulty: 'beginner', seedPrompt: 'フェルミ推定の練習問題：東京都内のコンビニエンスストアの店舗数を推定する問題を1問、解説付きで作成してください。仮定の置き方を3段階で示すこと。' },
    { id: 'fermi-02', title: { ja: '日本国内のスタバの1日売上を推定せよ', en: "Estimate daily Starbucks revenue in Japan" }, difficulty: 'intermediate', seedPrompt: 'フェルミ推定：日本国内のスターバックスの1日の総売上を推定する問題を1問。仮定→計算→検算の3ステップで解説してください。' },
    { id: 'fermi-03', title: { ja: '世界中のピアノ調律師の数を推定せよ', en: "Estimate the number of piano tuners worldwide" }, difficulty: 'advanced', seedPrompt: 'フェルミ推定の古典問題：世界中のピアノ調律師の数を推定する問題を1問。供給側と需要側の両面から推定して整合性をチェックする解説を入れてください。' },
    { id: 'fermi-04', title: { ja: '東京駅の1日の利用者数を推定せよ', en: "Estimate daily ridership at Tokyo Station" }, difficulty: 'beginner', seedPrompt: 'フェルミ推定：東京駅を利用する1日の人数を推定する問題を1問、解説付きで作成してください。' },
    { id: 'fermi-05', title: { ja: '日本の年間タピオカ消費量を推定せよ', en: "Estimate annual tapioca consumption in Japan" }, difficulty: 'intermediate', seedPrompt: 'フェルミ推定：日本の年間タピオカ消費量を推定する問題を1問。市場規模算出の練習として、需要側からの推定で解説してください。' },
  ],
  logic: [
    { id: 'logic-01', title: { ja: '売上低下の原因をロジックツリーで分解せよ', en: "Decompose declining sales with a logic tree" }, difficulty: 'beginner', seedPrompt: 'ロジカルシンキング：ある飲食チェーンの売上が前年比10%減。原因をロジックツリーで MECE に分解する問題を1問、解説付きで作成してください。' },
    { id: 'logic-02', title: { ja: '新規事業の収益構造をツリーで可視化せよ', en: "Map the revenue structure of a new business with a tree" }, difficulty: 'intermediate', seedPrompt: 'ロジカルシンキング：サブスクリプション型の新規事業の収益構造をロジックツリーで分解する問題を1問。KPI ドライバまで落とし込んでください。' },
    { id: 'logic-03', title: { ja: '顧客離脱の根本原因を3層で深掘りせよ', en: "Drill 3 layers into root cause of customer churn" }, difficulty: 'advanced', seedPrompt: 'ロジカルシンキング：SaaS の顧客離脱率上昇の根本原因を3層のロジックツリーで深掘りする問題を1問、解説付きで作成してください。' },
    { id: 'logic-04', title: { ja: '採用が決まらない理由をツリーで整理せよ', en: "Organize reasons a hire isn't landing into a tree" }, difficulty: 'beginner', seedPrompt: 'ロジカルシンキング：エンジニア採用で内定承諾率が低い理由をロジックツリーで整理する問題を1問、解説付きで作成してください。' },
    { id: 'logic-05', title: { ja: 'コスト削減余地をツリーで網羅せよ', en: "Cover cost reduction opportunities exhaustively in a tree" }, difficulty: 'intermediate', seedPrompt: 'ロジカルシンキング：製造業のコスト削減余地をロジックツリーで網羅的に洗い出す問題を1問、解説付きで作成してください。' },
  ],
  case: [
    { id: 'case-01', title: { ja: '地方のスーパーの売上を伸ばす施策を考えよ', en: "Devise actions to grow sales for a regional supermarket" }, difficulty: 'beginner', seedPrompt: 'ケース面接：人口減少地域のスーパーマーケットの売上を伸ばす施策を考える問題を1問。3C 分析から打ち手立案まで誘導する解説付き。' },
    { id: 'case-02', title: { ja: '居酒屋チェーンの利益率を改善する戦略は？', en: "What strategy improves an izakaya chain's margin?" }, difficulty: 'intermediate', seedPrompt: 'ケース面接：全国展開する居酒屋チェーンの利益率を改善する戦略を立てる問題を1問。コスト構造分析を含めた解説付き。' },
    { id: 'case-03', title: { ja: 'ストリーミングサービスの新規参入戦略を立案せよ', en: "Plan a market entry for a streaming service" }, difficulty: 'advanced', seedPrompt: 'ケース面接：動画ストリーミング市場への新規参入戦略を立案する問題を1問。市場規模推定 → 差別化要素 → 参入リスクの順で誘導する解説付き。' },
    { id: 'case-04', title: { ja: 'カフェチェーンの新店舗出店判断を下せ', en: "Decide whether a cafe chain should open a new store" }, difficulty: 'beginner', seedPrompt: 'ケース面接：カフェチェーンが渋谷駅近くに新店舗を出すべきかを判断する問題を1問、解説付き。' },
    { id: 'case-05', title: { ja: 'ガラケーメーカーの生存戦略を提案せよ', en: "Propose a survival strategy for a feature-phone maker" }, difficulty: 'advanced', seedPrompt: 'ケース面接：フィーチャーフォン（ガラケー）メーカーがスマホ全盛時代に生き残る戦略を提案する問題を1問、解説付き。' },
  ],
  critical: [
    { id: 'critical-01', title: { ja: '「データが示している」の前提を疑え', en: "Question the premise behind \"the data shows\"" }, difficulty: 'beginner', seedPrompt: 'クリティカル思考：「データがそう示しているから正しい」と主張するレポートの前提を疑う問題を1問、解説付き。' },
    { id: 'critical-02', title: { ja: '相関と因果の取り違えを見抜け', en: "Spot a correlation-causation mix-up" }, difficulty: 'intermediate', seedPrompt: 'クリティカル思考：相関関係を因果関係と誤認している主張を見抜く問題を1問、典型的な落とし穴 3 つを含めた解説付き。' },
    { id: 'critical-03', title: { ja: 'バイアスだらけの社内調査結果を解剖せよ', en: "Dissect a biased internal survey" }, difficulty: 'advanced', seedPrompt: 'クリティカル思考：選択バイアス・確証バイアス・サンプル偏向が混在する社内調査結果を解剖する問題を1問、解説付き。' },
    { id: 'critical-04', title: { ja: '「みんなが使っている」は本当か？', en: "Is \"everyone is using it\" really true?" }, difficulty: 'beginner', seedPrompt: 'クリティカル思考：「みんなが使っている」「業界標準」のような曖昧な前提を解剖する問題を1問、解説付き。' },
    { id: 'critical-05', title: { ja: '成功事例の本質的な再現条件を見極めろ', en: "Identify the true preconditions of a success story" }, difficulty: 'intermediate', seedPrompt: 'クリティカル思考：「あの会社で成功した施策をうちでも」と言いたくなる場面で、再現条件を見極める問題を1問、解説付き。' },
  ],
  hypo: [
    { id: 'hypo-01', title: { ja: 'ユーザー離脱の仮説を3つ立てて検証順を決めよ', en: "Form 3 user-churn hypotheses and prioritize verification" }, difficulty: 'beginner', seedPrompt: '仮説思考：SaaS のユーザー離脱率上昇について仮説を3つ立て、検証順序を決める問題を1問、解説付き。' },
    { id: 'hypo-02', title: { ja: '新製品が売れない仮説を立て、最速で検証せよ', en: "Hypothesize why a new product isn't selling and test it fast" }, difficulty: 'intermediate', seedPrompt: '仮説思考：新製品の売上が想定より低い理由について仮説を立て、最速で検証する方法を設計する問題を1問、解説付き。' },
    { id: 'hypo-03', title: { ja: '組織のエンゲージメント低下の仮説検証プランを設計せよ', en: "Design a hypothesis-test plan for declining engagement" }, difficulty: 'advanced', seedPrompt: '仮説思考：組織のエンゲージメントスコア低下について仮説 → 検証プラン → 意思決定までを設計する問題を1問、解説付き。' },
    { id: 'hypo-04', title: { ja: '広告 CTR が下がった仮説を立てよ', en: "Hypothesize why ad CTR dropped" }, difficulty: 'beginner', seedPrompt: '仮説思考：広告クリック率が前月比 30% 下落。仮説を 3 つ立てて検証順序を決める問題を1問、解説付き。' },
    { id: 'hypo-05', title: { ja: '採用エンジニアの定着率を高める仮説を立てよ', en: "Hypothesize ways to improve engineer retention" }, difficulty: 'intermediate', seedPrompt: '仮説思考：採用したエンジニアが1年以内に辞めている。定着率を高める仮説を立て、検証する問題を1問、解説付き。' },
  ],
  mece: [
    { id: 'mece-01', title: { ja: '顧客セグメントを MECE に分けよ', en: "Segment customers MECE" }, difficulty: 'beginner', seedPrompt: 'MECE：EC サイトの顧客セグメントを MECE に分ける問題を1問、解説付き。属性軸と行動軸の両方を提示。' },
    { id: 'mece-02', title: { ja: '会議の論点を MECE に整理せよ', en: "Organize meeting agenda items MECE" }, difficulty: 'intermediate', seedPrompt: 'MECE：複数のステークホルダーから出た論点を MECE に整理する問題を1問、解説付き。' },
    { id: 'mece-03', title: { ja: '組織の課題を MECE に分解せよ', en: "Decompose organizational issues MECE" }, difficulty: 'advanced', seedPrompt: 'MECE：成長期スタートアップの組織課題を MECE に分解する問題を1問、解説付き。Hard / Soft の両軸を使う。' },
    { id: 'mece-04', title: { ja: 'コスト項目を MECE に分けよ', en: "Break down cost items MECE" }, difficulty: 'beginner', seedPrompt: 'MECE：製造業のコスト項目を MECE に分解する問題を1問、解説付き。' },
    { id: 'mece-05', title: { ja: 'マーケ施策を MECE に分類して抜け漏れを見つけよ', en: "Classify marketing tactics MECE to find gaps" }, difficulty: 'intermediate', seedPrompt: 'MECE：マーケティング施策を MECE に分類して、現状の打ち手の抜け漏れを見つける問題を1問、解説付き。' },
  ],
  issue: [
    { id: 'issue-01', title: { ja: '「真の課題」を見極める問いを立てよ', en: "Pose questions that surface the real issue" }, difficulty: 'beginner', seedPrompt: '課題設定：表層の症状から「真の課題」を見極めるための問いを立てる問題を1問、解説付き。' },
    { id: 'issue-02', title: { ja: 'クライアントの要望を課題に変換せよ', en: "Convert a client request into a defined issue" }, difficulty: 'intermediate', seedPrompt: '課題設定：クライアントから来た「DX を進めたい」という抽象的な要望を、具体的な課題に変換する問題を1問、解説付き。' },
    { id: 'issue-03', title: { ja: '全社課題を経営アジェンダに昇華せよ', en: "Elevate company-wide issues into a board-level agenda" }, difficulty: 'advanced', seedPrompt: '課題設定：散らばった全社課題を経営アジェンダ 3 つに集約する問題を1問、解説付き。' },
    { id: 'issue-04', title: { ja: '部門間の対立を「課題」に再定義せよ', en: "Reframe inter-department conflict as a defined issue" }, difficulty: 'intermediate', seedPrompt: '課題設定：営業と開発の対立を「解くべき課題」に再定義する問題を1問、解説付き。' },
    { id: 'issue-05', title: { ja: 'ユーザーの不満から課題を抽出せよ', en: "Extract issues from user complaints" }, difficulty: 'beginner', seedPrompt: '課題設定：複数のユーザー不満から、本当に解くべき課題を抽出する問題を1問、解説付き。' },
  ],
  point: [
    { id: 'point-01', title: { ja: '会議の論点を 3 つに絞れ', en: "Narrow meeting points down to 3" }, difficulty: 'beginner', seedPrompt: '論点設定：拡散した会議の論点を 3 つに絞り込む問題を1問、解説付き。' },
    { id: 'point-02', title: { ja: '提案書の論点構造を再設計せよ', en: "Redesign the argument structure of a proposal" }, difficulty: 'intermediate', seedPrompt: '論点設定：散らかった提案書の論点構造をピラミッドストラクチャで再設計する問題を1問、解説付き。' },
    { id: 'point-03', title: { ja: '取締役会向けの論点を 1 枚にまとめよ', en: "Distill board-level points onto a single slide" }, difficulty: 'advanced', seedPrompt: '論点設定：取締役会向けの複雑な論点を 1 枚スライドにまとめる問題を1問、解説付き。' },
    { id: 'point-04', title: { ja: 'プロジェクトの「決めるべきこと」を抽出せよ', en: "Extract the decisions a project must make" }, difficulty: 'beginner', seedPrompt: '論点設定：新規プロジェクトで「最初に決めるべきこと」を抽出する問題を1問、解説付き。' },
    { id: 'point-05', title: { ja: '炎上中の議論の本質論点を見抜け', en: "Spot the core point in a heated debate" }, difficulty: 'advanced', seedPrompt: '論点設定：炎上している社内議論から本質論点を見抜く問題を1問、解説付き。' },
  ],
  lateral: [
    { id: 'lateral-01', title: { ja: '満員電車を「楽しい場」に変えるアイデアを出せ', en: "Brainstorm ways to make crowded trains enjoyable" }, difficulty: 'beginner', seedPrompt: 'ラテラル思考：満員電車を「楽しい場」に変えるアイデアを 5 つ出す問題を1問、解説付き。' },
    { id: 'lateral-02', title: { ja: '本屋を「行きたくなる場所」に再定義せよ', en: "Reframe a bookstore as a place people want to visit" }, difficulty: 'intermediate', seedPrompt: 'ラテラル思考：本屋を「行きたくなる場所」に再定義するアイデアを 5 つ出す問題を1問、解説付き。' },
    { id: 'lateral-03', title: { ja: '「タクシーを呼ばずに使う」発想で新サービスを設計せよ', en: "Design a new service from \"using a taxi without calling one\"" }, difficulty: 'advanced', seedPrompt: 'ラテラル思考：「タクシーを呼ばずに使う」という発想転換から新サービスを設計する問題を1問、解説付き。' },
    { id: 'lateral-04', title: { ja: 'お年寄りが使いたくなる SNS を考えよ', en: "Design an SNS that elders want to use" }, difficulty: 'intermediate', seedPrompt: 'ラテラル思考：70 代以上が使いたくなる SNS を発想転換から設計する問題を1問、解説付き。' },
    { id: 'lateral-05', title: { ja: '「待ち時間」を価値に変えるアイデアを出せ', en: "Turn waiting time into value" }, difficulty: 'beginner', seedPrompt: 'ラテラル思考：「待ち時間」を価値に変えるアイデアを 5 つ出す問題を1問、解説付き。' },
  ],
  analogy: [
    { id: 'analogy-01', title: { ja: '免疫システムから組織防衛を発想せよ', en: "Inspire organizational defense from the immune system" }, difficulty: 'beginner', seedPrompt: 'アナロジー思考：人体の免疫システムの構造をアナロジーに、組織のセキュリティ防衛を設計する問題を1問、解説付き。' },
    { id: 'analogy-02', title: { ja: 'スポーツチームの戦術を経営に転用せよ', en: "Translate sports team tactics into management" }, difficulty: 'intermediate', seedPrompt: 'アナロジー思考：サッカーのフォーメーション思考を新規事業組織のリーダーシップ設計に転用する問題を1問、解説付き。' },
    { id: 'analogy-03', title: { ja: '建築の構造論をプロダクト設計に応用せよ', en: "Apply structural architecture to product design" }, difficulty: 'advanced', seedPrompt: 'アナロジー思考：建築構造（耐震・荷重分散）の考え方をソフトウェアアーキテクチャに転用する問題を1問、解説付き。' },
    { id: 'analogy-04', title: { ja: '料理のレシピ思考をプロジェクト管理に応用せよ', en: "Apply recipe thinking to project management" }, difficulty: 'beginner', seedPrompt: 'アナロジー思考：料理のレシピ（分量・手順・タイミング）をプロジェクト管理に応用する問題を1問、解説付き。' },
    { id: 'analogy-05', title: { ja: '生態系のニッチ戦略を新規事業に転用せよ', en: "Borrow ecosystem niche strategies for a new venture" }, difficulty: 'advanced', seedPrompt: 'アナロジー思考：生態系のニッチ戦略を新規事業のポジショニングに転用する問題を1問、解説付き。' },
  ],
  systems: [
    { id: 'systems-01', title: { ja: 'KPI 連鎖の因果ループを描け', en: "Draw a causal loop of KPI chains" }, difficulty: 'beginner', seedPrompt: 'システム思考：プロダクトの KPI 連鎖を因果ループ図で描く問題を1問、解説付き。' },
    { id: 'systems-02', title: { ja: '組織の悪循環をループで可視化せよ', en: "Visualize an organizational vicious cycle as a loop" }, difficulty: 'intermediate', seedPrompt: 'システム思考：「忙しい → 採用 → 教育時間ない → 余計忙しい」のような組織の悪循環を因果ループで可視化する問題を1問、解説付き。' },
    { id: 'systems-03', title: { ja: 'レバレッジポイントを特定せよ', en: "Identify the leverage points in a system" }, difficulty: 'advanced', seedPrompt: 'システム思考：複雑な業務システムから「最小の介入で最大の変化を生むレバレッジポイント」を特定する問題を1問、解説付き。' },
    { id: 'systems-04', title: { ja: '顧客 LTV を高める好循環を設計せよ', en: "Design a virtuous cycle that boosts customer LTV" }, difficulty: 'intermediate', seedPrompt: 'システム思考：SaaS の顧客 LTV を高める好循環ループを設計する問題を1問、解説付き。' },
    { id: 'systems-05', title: { ja: 'チーム生産性の遅延フィードバックを見抜け', en: "Spot delayed feedback in team productivity" }, difficulty: 'advanced', seedPrompt: 'システム思考：チーム生産性に効く施策の「遅延フィードバック」を見抜き、短期と長期の打ち手を分ける問題を1問、解説付き。' },
  ],
  design: [
    { id: 'design-01', title: { ja: 'ペルソナを言語化せよ', en: "Articulate a persona" }, difficulty: 'beginner', seedPrompt: 'デザインシンキング：「忙しい 30 代共働き世帯」のペルソナを具体的に言語化する問題を1問、解説付き。' },
    { id: 'design-02', title: { ja: 'ユーザージャーニーから機会領域を発見せよ', en: "Find opportunity areas from a user journey" }, difficulty: 'intermediate', seedPrompt: 'デザインシンキング：通勤ユーザーのジャーニーマップから機会領域を 3 つ抽出する問題を1問、解説付き。' },
    { id: 'design-03', title: { ja: 'プロトタイピングで仮説検証を設計せよ', en: "Design hypothesis tests through prototyping" }, difficulty: 'advanced', seedPrompt: 'デザインシンキング：新規サービスのコンセプトをプロトタイプで検証するプランを設計する問題を1問、解説付き。' },
    { id: 'design-04', title: { ja: '共感マップでユーザーを多面的に捉えよ', en: "Use empathy map to read users multi-dimensionally" }, difficulty: 'beginner', seedPrompt: 'デザインシンキング：共感マップ（言う・する・思う・感じる）を使ってターゲットユーザーを多面的に捉える問題を1問、解説付き。' },
    { id: 'design-05', title: { ja: '極端なユーザーから学べることを抽出せよ', en: "Extract lessons from extreme users" }, difficulty: 'intermediate', seedPrompt: 'デザインシンキング：極端ユーザー（ヘビーユーザー / ノンユーザー）の観察から学べる本質を抽出する問題を1問、解説付き。' },
  ],
  strategy: [
    { id: 'strategy-01', title: { ja: '3C 分析で自社の立ち位置を見極めよ', en: "Map your position with 3C analysis" }, difficulty: 'beginner', seedPrompt: '戦略立案：架空の SaaS 企業の 3C 分析を行い、戦略的立ち位置を見極める問題を1問、解説付き。' },
    { id: 'strategy-02', title: { ja: 'ポーターの 5 フォースで業界構造を読み解け', en: "Read industry structure with Porter's 5 Forces" }, difficulty: 'intermediate', seedPrompt: '戦略立案：飲食デリバリー業界をポーターの 5 フォースで読み解く問題を1問、解説付き。' },
    { id: 'strategy-03', title: { ja: 'ブルーオーシャン戦略で新市場を切り拓け', en: "Open a new market with Blue Ocean strategy" }, difficulty: 'advanced', seedPrompt: '戦略立案：成熟市場でブルーオーシャン戦略を用いて新市場を切り拓くプランを立案する問題を1問、解説付き。' },
    { id: 'strategy-04', title: { ja: 'SWOT 分析から打ち手を導け', en: "Derive actions from SWOT analysis" }, difficulty: 'beginner', seedPrompt: '戦略立案：架空企業の SWOT 分析から優先打ち手を導く問題を1問、解説付き。' },
    { id: 'strategy-05', title: { ja: '異業種参入の差別化要素を設計せよ', en: "Design differentiation when entering a new industry" }, difficulty: 'advanced', seedPrompt: '戦略立案：IT 企業が金融業界に参入する際の差別化要素を設計する問題を1問、解説付き。' },
  ],
  proposal: [
    { id: 'proposal-01', title: { ja: '結論ファーストでメール本文を再構成せよ', en: "Rewrite an email body bottom-line first" }, difficulty: 'beginner', seedPrompt: '提案・伝える技術：曖昧な結論のメール本文を「結論ファースト」で再構成する問題を1問、解説付き。' },
    { id: 'proposal-02', title: { ja: 'エレベーターピッチで 60 秒提案を組み立てよ', en: "Craft a 60-second elevator pitch" }, difficulty: 'intermediate', seedPrompt: '提案・伝える技術：エレベーターピッチ（60秒）で新規事業を提案する原稿を作る問題を1問、解説付き。' },
    { id: 'proposal-03', title: { ja: '経営陣を説得する 3 スライド構成を設計せよ', en: "Design a 3-slide pitch to win executives" }, difficulty: 'advanced', seedPrompt: '提案・伝える技術：経営陣を説得するための 3 スライド構成（現状・打ち手・効果）を設計する問題を1問、解説付き。' },
    { id: 'proposal-04', title: { ja: 'PREP 法で社内提案を組み立てよ', en: "Structure an internal proposal with PREP" }, difficulty: 'beginner', seedPrompt: '提案・伝える技術：PREP 法（Point → Reason → Example → Point）で社内提案を組み立てる問題を1問、解説付き。' },
    { id: 'proposal-05', title: { ja: '反論を先回りした提案を設計せよ', en: "Design a proposal that pre-empts objections" }, difficulty: 'intermediate', seedPrompt: '提案・伝える技術：想定される反論を先回りして組み込んだ提案を設計する問題を1問、解説付き。' },
  ],
  framework: [
    { id: 'framework-01', title: { ja: '4P で新製品のマーケ戦略を設計せよ', en: "Design marketing strategy with 4P for a new product" }, difficulty: 'beginner', seedPrompt: 'フレームワーク活用：4P（Product/Price/Place/Promotion）で新製品のマーケティング戦略を設計する問題を1問、解説付き。' },
    { id: 'framework-02', title: { ja: 'PEST 分析で外部環境を読み解け', en: "Read external environment with PEST" }, difficulty: 'intermediate', seedPrompt: 'フレームワーク活用：PEST 分析で AI 業界の外部環境を読み解く問題を1問、解説付き。' },
    { id: 'framework-03', title: { ja: 'AIDMA でカスタマージャーニーを設計せよ', en: "Design customer journey with AIDMA" }, difficulty: 'beginner', seedPrompt: 'フレームワーク活用：AIDMA でカスタマージャーニーを設計する問題を1問、解説付き。' },
    { id: 'framework-04', title: { ja: 'バリューチェーン分析でコスト構造を見直せ', en: "Revisit cost structure via value chain analysis" }, difficulty: 'advanced', seedPrompt: 'フレームワーク活用：バリューチェーン分析で製造業のコスト構造を見直す問題を1問、解説付き。' },
    { id: 'framework-05', title: { ja: 'BCG マトリクスで事業ポートフォリオを評価せよ', en: "Evaluate business portfolio with BCG matrix" }, difficulty: 'intermediate', seedPrompt: 'フレームワーク活用：BCG マトリクスで複数事業のポートフォリオを評価する問題を1問、解説付き。' },
  ],
  data: [
    { id: 'data-01', title: { ja: '売上データから示唆を 3 つ抽出せよ', en: "Extract 3 insights from sales data" }, difficulty: 'beginner', seedPrompt: 'データ活用：架空の売上データから示唆を 3 つ抽出する問題を1問、解説付き。' },
    { id: 'data-02', title: { ja: 'A/B テスト結果から意思決定せよ', en: "Make a decision from A/B test results" }, difficulty: 'intermediate', seedPrompt: 'データ活用：A/B テストの結果から意思決定する問題を1問。統計的有意性と効果サイズを区別する解説付き。' },
    { id: 'data-03', title: { ja: 'コホート分析で離脱パターンを読み解け', en: "Read churn patterns through cohort analysis" }, difficulty: 'advanced', seedPrompt: 'データ活用：SaaS のコホート分析から離脱パターンを読み解く問題を1問、解説付き。' },
    { id: 'data-04', title: { ja: '異常値の原因を仮説立てて検証せよ', en: "Hypothesize and verify the cause of an anomaly" }, difficulty: 'intermediate', seedPrompt: 'データ活用：売上データの突発的な異常値の原因を仮説立てて検証する問題を1問、解説付き。' },
    { id: 'data-05', title: { ja: 'ファネル分析でボトルネックを特定せよ', en: "Identify bottlenecks with funnel analysis" }, difficulty: 'beginner', seedPrompt: 'データ活用：EC サイトのファネル分析で離脱率の高いステップを特定する問題を1問、解説付き。' },
  ],
}
