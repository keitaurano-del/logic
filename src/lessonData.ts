export type QuizOption = {
  label: string
  correct: boolean
}

export type QuizStep = {
  type: 'quiz'
  question: string
  options: QuizOption[]
  explanation: string
}

export type ExplainStep = {
  type: 'explain'
  title: string
  content: string
  visual?: string
}

export type LessonStep = QuizStep | ExplainStep

export type LessonData = {
  id: number
  title: string
  category: string
  steps: LessonStep[]
}

// ========================================
// 簿記3級 入門
// ========================================
export const boki3Intro: LessonData = {
  id: 6,
  title: '簿記3級 入門',
  category: '簿記3級',
  steps: [
    {
      type: 'explain',
      title: '簿記とは？',
      content:
        '簿記とは、企業のお金の動きを一定のルールに従って記録・整理する技術です。\n\nすべての取引は「借方（左側）」と「貸方（右側）」に分けて記録します。これを「仕訳（しわけ）」と呼びます。\n\n借方の合計と貸方の合計は必ず一致します。これが簿記の大原則「貸借一致の原則」です。',
      visual: 'TAccountDiagram',
    },
    {
      type: 'quiz',
      question: '簿記で取引を借方と貸方に分けて記録することを何と呼ぶ？',
      options: [
        { label: '転記', correct: false },
        { label: '仕訳', correct: true },
        { label: '決算', correct: false },
        { label: '棚卸', correct: false },
      ],
      explanation:
        '取引を借方と貸方に分けて記録することを「仕訳」と言います。転記は仕訳を勘定口座に書き写すことです。',
    },
    {
      type: 'explain',
      title: '5つの勘定科目グループ',
      content:
        '勘定科目は大きく5つのグループに分かれます。\n\n資産・費用は借方（左）に増加、負債・純資産・収益は貸方（右）に増加と覚えましょう。',
      visual: 'AccountGroupsDiagram',
    },
    {
      type: 'quiz',
      question: '「現金」はどのグループに属する？',
      options: [
        { label: '負債', correct: false },
        { label: '費用', correct: false },
        { label: '資産', correct: true },
        { label: '収益', correct: false },
      ],
      explanation:
        '現金は「資産」グループです。資産は借方（左側）に記入すると増加します。',
    },
    {
      type: 'explain',
      title: '仕訳の実践',
      content:
        '取引が発生したら、どの勘定科目が増減したかを考えて、借方・貸方に振り分けます。',
      visual: 'JournalEntryDiagram',
    },
    {
      type: 'quiz',
      question: '商品200円を掛けで売り上げた場合、借方に記入する勘定科目は？',
      options: [
        { label: '売上', correct: false },
        { label: '現金', correct: false },
        { label: '売掛金', correct: true },
        { label: '買掛金', correct: false },
      ],
      explanation:
        '掛けで売り上げた場合、後で代金を受け取る権利＝「売掛金（資産）」が増加するので、借方に売掛金を記入します。貸方には売上（収益）を記入します。',
    },
    {
      type: 'explain',
      title: '試算表とは',
      content:
        '試算表は、すべての勘定科目の借方合計と貸方合計を一覧にした表です。\n\n主な種類：\n・合計試算表：各勘定の借方合計・貸方合計を並べる\n・残高試算表：各勘定の残高（差額）を並べる\n・合計残高試算表：両方を記載する\n\n試算表の借方合計と貸方合計が一致すれば、仕訳や転記にミスがないことを確認できます。',
    },
    {
      type: 'quiz',
      question: '試算表の主な目的は？',
      options: [
        { label: '税金を計算する', correct: false },
        { label: '仕訳や転記の正確性を確認する', correct: true },
        { label: '株主に報告する', correct: false },
        { label: '予算を立てる', correct: false },
      ],
      explanation:
        '試算表は仕訳や転記のミスがないかを確認するために作成します。借方合計と貸方合計が一致することで正確性をチェックします。',
    },
  ],
}

// ========================================
// 簿記3級 決算と財務諸表
// ========================================
export const boki3Financial: LessonData = {
  id: 7,
  title: '簿記3級 決算と財務諸表',
  category: '簿記3級',
  steps: [
    {
      type: 'explain',
      title: '決算とは',
      content:
        '決算とは、一定期間（通常1年）の経営成績と財政状態をまとめる手続きです。5つのステップで進みます。',
      visual: 'SettlementFlowDiagram',
    },
    {
      type: 'quiz',
      question: '決算整理仕訳を行うタイミングは？',
      options: [
        { label: '取引が発生した都度', correct: false },
        { label: '毎月末', correct: false },
        { label: '決算日（期末）', correct: true },
        { label: '株主総会の前日', correct: false },
      ],
      explanation:
        '決算整理仕訳は決算日（期末）に行います。期中の記録を修正・調整して、正しい経営成績と財政状態を表すためです。',
    },
    {
      type: 'explain',
      title: '主な決算整理事項',
      content:
        '決算整理では、期中の記録を修正・調整して正しい財務諸表を作ります。主に5つの項目があります。',
      visual: 'AdjustmentsDiagram',
    },
    {
      type: 'quiz',
      question: '建物や備品などの固定資産の価値減少を費用として計上することを何と呼ぶ？',
      options: [
        { label: '貸倒処理', correct: false },
        { label: '減価償却', correct: true },
        { label: '棚卸減耗', correct: false },
        { label: '引当金繰入', correct: false },
      ],
      explanation:
        '減価償却は、固定資産の取得原価を耐用年数にわたって費用配分する手続きです。3級では定額法を学びます。',
    },
    {
      type: 'explain',
      title: '精算表の作成',
      content:
        '精算表は、試算表から損益計算書・貸借対照表を作成するための一覧表です。\n\n構成（8桁精算表）：\n| 勘定科目 | 試算表 | 修正記入 | 損益計算書 | 貸借対照表 |\n\n手順：\n① 試算表の数字を記入\n② 決算整理仕訳を修正記入欄に記入\n③ 収益・費用 → 損益計算書欄へ\n④ 資産・負債・純資産 → 貸借対照表欄へ\n⑤ 当期純利益（または純損失）を計算',
    },
    {
      type: 'quiz',
      question: '精算表で「売上」はどの欄に記入する？',
      options: [
        { label: '貸借対照表の貸方', correct: false },
        { label: '損益計算書の借方', correct: false },
        { label: '損益計算書の貸方', correct: true },
        { label: '貸借対照表の借方', correct: false },
      ],
      explanation:
        '売上は収益なので、損益計算書の貸方に記入します。収益は貸方、費用は借方に記入するのがルールです。',
    },
    {
      type: 'explain',
      title: '損益計算書（P/L）と貸借対照表（B/S）',
      content:
        'P/Lは一定期間の経営成績、B/Sは決算日時点の財政状態を表します。それぞれの構造を見てみましょう。',
      visual: 'FinancialStatementsDiagram',
    },
    {
      type: 'quiz',
      question: '貸借対照表の等式として正しいものは？',
      options: [
        { label: '資産 ＝ 負債 − 純資産', correct: false },
        { label: '資産 ＝ 収益 − 費用', correct: false },
        { label: '資産 ＝ 負債 ＋ 純資産', correct: true },
        { label: '負債 ＝ 資産 ＋ 純資産', correct: false },
      ],
      explanation:
        '「資産 ＝ 負債 ＋ 純資産」が貸借対照表の基本等式です。これは貸借対照表が常にバランスする理由でもあります。',
    },
  ],
}

// ========================================
// 簿記2級 商業簿記
// ========================================
export const boki2Commercial: LessonData = {
  id: 8,
  title: '簿記2級 商業簿記',
  category: '簿記2級 商業',
  steps: [
    {
      type: 'explain',
      title: '連結会計の基礎',
      content:
        '連結会計とは、親会社と子会社をひとつの企業グループとして財務諸表を作成する手続きです。支配力基準により、議決権の過半数を持つ場合に子会社となります。',
      visual: 'ConsolidationDiagram',
    },
    {
      type: 'quiz',
      question: '連結会計で、親会社の子会社株式と子会社の資本を相殺する処理を何と呼ぶ？',
      options: [
        { label: '内部取引の消去', correct: false },
        { label: '投資と資本の相殺消去', correct: true },
        { label: 'のれんの償却', correct: false },
        { label: '未実現利益の消去', correct: false },
      ],
      explanation:
        '「投資と資本の相殺消去」は連結会計の最も基本的な処理です。親会社の投資勘定と子会社の資本勘定を相殺し、差額はのれんとして処理します。',
    },
    {
      type: 'explain',
      title: '税効果会計',
      content:
        '税効果会計とは、会計上の利益と税務上の所得のズレ（一時差異）を調整する手続きです。',
      visual: 'TaxEffectDiagram',
    },
    {
      type: 'quiz',
      question: '貸倒引当金の損金算入限度超過額がある場合、計上するのは？',
      options: [
        { label: '繰延税金負債', correct: false },
        { label: '繰延税金資産', correct: true },
        { label: '未払法人税等', correct: false },
        { label: '法人税等', correct: false },
      ],
      explanation:
        '将来、その差異が解消されるときに税金が減るため「繰延税金資産」を計上します。これは将来減算一時差異の典型例です。',
    },
    {
      type: 'explain',
      title: 'リース取引',
      content:
        'リース取引は、ファイナンス・リースとオペレーティング・リースの2種類があります。処理方法が大きく異なります。',
      visual: 'LeaseDiagram',
    },
    {
      type: 'quiz',
      question: 'ファイナンス・リース取引の開始時に借方に計上する勘定科目は？',
      options: [
        { label: '支払リース料', correct: false },
        { label: 'リース債務', correct: false },
        { label: 'リース資産', correct: true },
        { label: '前払費用', correct: false },
      ],
      explanation:
        'ファイナンス・リースは売買処理が原則のため、借方にリース資産、貸方にリース債務を計上します。',
    },
    {
      type: 'explain',
      title: '有価証券の分類と評価',
      content:
        '2級では4種類の有価証券を学びます。分類によって評価方法と評価差額の処理が異なります。',
      visual: 'SecuritiesDiagram',
    },
    {
      type: 'quiz',
      question: 'その他有価証券の時価評価による評価差額はどこに計上する？',
      options: [
        { label: '営業外収益', correct: false },
        { label: '特別利益', correct: false },
        { label: '純資産の部', correct: true },
        { label: '営業利益', correct: false },
      ],
      explanation:
        'その他有価証券の評価差額は「その他有価証券評価差額金」として純資産の部に計上します。損益には影響しません。',
    },
  ],
}

// ========================================
// 簿記2級 工業簿記
// ========================================
export const boki2Industrial: LessonData = {
  id: 9,
  title: '簿記2級 工業簿記',
  category: '簿記2級 工業',
  steps: [
    {
      type: 'explain',
      title: '原価計算の基礎',
      content:
        '工業簿記は、製品を製造する企業の簿記です。原価は3要素に分かれ、直接費と間接費に分類して製品原価を算出します。',
      visual: 'CostFlowDiagram',
    },
    {
      type: 'quiz',
      question: '工場で使う電力費は原価の3要素のどれに該当する？',
      options: [
        { label: '材料費', correct: false },
        { label: '労務費', correct: false },
        { label: '経費', correct: true },
        { label: '販売費', correct: false },
      ],
      explanation:
        '電力費は材料費でも労務費でもないため「経費」に分類されます。工場全体で使用するため間接経費となります。',
    },
    {
      type: 'explain',
      title: '個別原価計算と総合原価計算',
      content:
        '【個別原価計算】\n受注生産に適用。製造指図書ごとに原価を集計する。\n例：造船、注文住宅、特注機械\n\n【総合原価計算】\n大量生産に適用。一定期間の総原価を生産量で割る。\n例：食品、化学製品、自動車部品\n\n総合原価計算のポイント：\n・月初仕掛品 ＋ 当月投入 ＝ 完成品 ＋ 月末仕掛品\n・月末仕掛品の評価方法：先入先出法、平均法\n・加工進捗度に応じた完成品換算量の計算が重要',
    },
    {
      type: 'quiz',
      question: '受注生産に適した原価計算の方法は？',
      options: [
        { label: '総合原価計算', correct: false },
        { label: '個別原価計算', correct: true },
        { label: '標準原価計算', correct: false },
        { label: '直接原価計算', correct: false },
      ],
      explanation:
        '個別原価計算は、注文ごとに製造指図書を発行し、指図書単位で原価を集計します。受注生産に最適です。',
    },
    {
      type: 'explain',
      title: '標準原価計算',
      content:
        '標準原価計算は、あらかじめ設定した「標準原価」と実際原価を比較して差異を分析する方法です。',
      visual: 'VarianceAnalysisDiagram',
    },
    {
      type: 'quiz',
      question:
        '標準原価計算で、標準単価100円、実際単価110円、実際消費量200kgのとき、価格差異はいくら？',
      options: [
        { label: '1,000円（有利差異）', correct: false },
        { label: '2,000円（不利差異）', correct: true },
        { label: '2,000円（有利差異）', correct: false },
        { label: '1,000円（不利差異）', correct: false },
      ],
      explanation:
        '価格差異 ＝（110円 − 100円）× 200kg ＝ 2,000円。実際単価が標準を上回っているので不利差異です。',
    },
    {
      type: 'explain',
      title: 'CVP分析（損益分岐点分析）',
      content:
        'CVP分析は、原価・販売量・利益の関係を分析する手法です。損益分岐点を求めることで、利益が出る最低売上高がわかります。',
      visual: 'CVPDiagram',
    },
    {
      type: 'quiz',
      question: '固定費400万円、変動費率50%のとき、損益分岐点売上高は？',
      options: [
        { label: '400万円', correct: false },
        { label: '600万円', correct: false },
        { label: '800万円', correct: true },
        { label: '1,000万円', correct: false },
      ],
      explanation:
        '損益分岐点 ＝ 固定費400万 ÷ 貢献利益率(1 − 0.5) ＝ 400万 ÷ 0.5 ＝ 800万円です。',
    },
  ],
}

// ========================================
// ドリル用データ（boki3Exercisesから動的生成）
// ========================================
function questionsToLesson(
  id: number,
  title: string,
  category: string,
  questions: { question: string; options: QuizOption[]; explanation: string }[],
): LessonData {
  const steps: LessonStep[] = []
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i]
    steps.push({
      type: 'quiz',
      question: q.question,
      options: q.options,
      explanation: q.explanation,
    })
  }
  return { id, title, category, steps }
}

// 遅延インポート用のプレースホルダー（実際のデータはboki3Exercises.tsから）
// allLessonsにドリルを追加するために、ここではimportせずに
// App側で動的にセットする設計もあるが、シンプルにここで定義する

import { journalQuestions, accountQuestions, settlementQuestions } from './boki3Exercises'
import { logicLessonMap } from './logicLessons'
import { pmbokLessonMap } from './pmbokLessons'

const journalDrill = questionsToLesson(11, '仕訳問題 50問ドリル', '簿記3級', journalQuestions)
const accountDrill = questionsToLesson(12, '勘定記入・補助簿ドリル', '簿記3級', accountQuestions)
const settlementDrill = questionsToLesson(13, '決算・精算表ドリル', '簿記3級', settlementQuestions)

export const allLessons: Record<number, LessonData> = {
  6: boki3Intro,
  7: boki3Financial,
  8: boki2Commercial,
  9: boki2Industrial,
  11: journalDrill,
  12: accountDrill,
  13: settlementDrill,
  ...logicLessonMap,
  ...pmbokLessonMap,
}
