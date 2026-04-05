import type { QuizOption } from './lessonData'

// 仕訳問題の型
export type JournalQuestion = {
  id: number
  question: string
  options: QuizOption[]
  explanation: string
  topic: string
}

// ========================================
// 大問1対策：仕訳問題50問
// ========================================
export const journalQuestions: JournalQuestion[] = [
  // --- 現金・預金 ---
  { id: 1, topic: '現金・預金', question: '現金500,000円を当座預金に預け入れた。借方の勘定科目は？',
    options: [{ label: '現金', correct: false }, { label: '当座預金', correct: true }, { label: '普通預金', correct: false }, { label: '定期預金', correct: false }],
    explanation: '当座預金（資産）が増加するため借方に記入します。' },
  { id: 2, topic: '現金・預金', question: '他人振出の小切手80,000円を受け取った。借方の勘定科目は？',
    options: [{ label: '当座預金', correct: false }, { label: '受取手形', correct: false }, { label: '現金', correct: true }, { label: '売掛金', correct: false }],
    explanation: '他人振出の小切手は「現金」として扱います。自己振出の小切手とは区別しましょう。' },
  { id: 3, topic: '現金・預金', question: '現金の実際有高が帳簿残高より3,000円不足していた。借方の勘定科目は？',
    options: [{ label: '現金', correct: false }, { label: '現金過不足', correct: true }, { label: '雑損', correct: false }, { label: '雑益', correct: false }],
    explanation: '原因が不明な段階では「現金過不足」で処理します。決算時に原因不明なら雑損・雑益に振り替えます。' },
  { id: 4, topic: '現金・預金', question: '決算にて、現金過不足（借方残高）2,000円の原因が判明しなかった。借方の勘定科目は？',
    options: [{ label: '現金過不足', correct: false }, { label: '雑損', correct: true }, { label: '雑益', correct: false }, { label: '現金', correct: false }],
    explanation: '借方残高の現金過不足は現金が不足していることを意味し、原因不明のまま決算を迎えた場合「雑損」に振り替えます。' },

  // --- 商品売買 ---
  { id: 5, topic: '商品売買', question: '商品300,000円を掛けで仕入れた。貸方の勘定科目は？',
    options: [{ label: '売掛金', correct: false }, { label: '未払金', correct: false }, { label: '買掛金', correct: true }, { label: '借入金', correct: false }],
    explanation: '商品の掛け仕入は「買掛金」（負債）を貸方に記入します。未払金は商品以外の掛け取引に使います。' },
  { id: 6, topic: '商品売買', question: '商品200,000円を売り上げ、代金のうち半額は現金で受け取り、残りは掛けとした。売掛金の金額は？',
    options: [{ label: '200,000円', correct: false }, { label: '100,000円', correct: true }, { label: '50,000円', correct: false }, { label: '150,000円', correct: false }],
    explanation: '200,000円の半額100,000円が掛けなので、売掛金は100,000円です。' },
  { id: 7, topic: '商品売買', question: '仕入れた商品のうち10,000円分を品違いのため返品した。この取引の借方は？',
    options: [{ label: '仕入', correct: false }, { label: '買掛金', correct: true }, { label: '売掛金', correct: false }, { label: '現金', correct: false }],
    explanation: '仕入返品は仕入の逆仕訳です。（借方）買掛金 10,000 ／（貸方）仕入 10,000' },
  { id: 8, topic: '商品売買', question: '商品150,000円を仕入れ、引取運賃5,000円を現金で支払った。仕入の金額は？',
    options: [{ label: '150,000円', correct: false }, { label: '155,000円', correct: true }, { label: '145,000円', correct: false }, { label: '5,000円', correct: false }],
    explanation: '引取運賃は仕入諸掛として仕入原価に含めます。150,000＋5,000＝155,000円。' },

  // --- 手形 ---
  { id: 9, topic: '手形', question: '商品を売り上げ、約束手形200,000円を受け取った。借方の勘定科目は？',
    options: [{ label: '売掛金', correct: false }, { label: '支払手形', correct: false }, { label: '受取手形', correct: true }, { label: '手形貸付金', correct: false }],
    explanation: '約束手形を受け取った場合は「受取手形」（資産）を借方に記入します。' },
  { id: 10, topic: '手形', question: '買掛金の支払いのため約束手形300,000円を振り出した。貸方の勘定科目は？',
    options: [{ label: '受取手形', correct: false }, { label: '支払手形', correct: true }, { label: '買掛金', correct: false }, { label: '当座預金', correct: false }],
    explanation: '手形を振り出すと「支払手形」（負債）が増加するため貸方に記入します。' },

  // --- 貸付・借入 ---
  { id: 11, topic: '貸付・借入', question: '銀行から500,000円を借り入れ、当座預金に入金された。貸方の勘定科目は？',
    options: [{ label: '当座預金', correct: false }, { label: '借入金', correct: true }, { label: '貸付金', correct: false }, { label: '未払金', correct: false }],
    explanation: '借入金（負債）が増加するため貸方に記入します。' },
  { id: 12, topic: '貸付・借入', question: '取引先に200,000円を貸し付け、小切手を振り出した。借方の勘定科目は？',
    options: [{ label: '借入金', correct: false }, { label: '当座預金', correct: false }, { label: '貸付金', correct: true }, { label: '立替金', correct: false }],
    explanation: '貸付金（資産）が増加するため借方に記入します。' },

  // --- 有形固定資産 ---
  { id: 13, topic: '固定資産', question: '備品400,000円を購入し、代金は月末払いとした。貸方の勘定科目は？',
    options: [{ label: '買掛金', correct: false }, { label: '未払金', correct: true }, { label: '借入金', correct: false }, { label: '当座預金', correct: false }],
    explanation: '商品以外の掛け取引は「未払金」を使います。買掛金は商品の掛け仕入のみです。' },
  { id: 14, topic: '固定資産', question: '車両（取得原価800,000円、減価償却累計額500,000円）を350,000円で売却し、現金を受け取った。固定資産売却益は？',
    options: [{ label: '150,000円', correct: false }, { label: '50,000円', correct: true }, { label: '350,000円', correct: false }, { label: '0円', correct: false }],
    explanation: '帳簿価額＝800,000−500,000＝300,000円。売却額350,000−帳簿価額300,000＝50,000円の売却益。' },

  // --- 経過勘定 ---
  { id: 15, topic: '経過勘定', question: '家賃120,000円（12ヶ月分）を前払いで支払った。決算時に未経過分4ヶ月分を繰り延べる場合、借方の勘定科目は？',
    options: [{ label: '支払家賃', correct: false }, { label: '前払家賃', correct: true }, { label: '未払家賃', correct: false }, { label: '前受家賃', correct: false }],
    explanation: '未経過分40,000円（120,000÷12×4）を前払家賃（資産）として繰り延べます。' },
  { id: 16, topic: '経過勘定', question: '決算にて利息の未払い分10,000円を計上する。貸方の勘定科目は？',
    options: [{ label: '支払利息', correct: false }, { label: '前払利息', correct: false }, { label: '未収利息', correct: false }, { label: '未払利息', correct: true }],
    explanation: '（借方）支払利息 10,000 ／（貸方）未払利息 10,000 と仕訳します。' },

  // --- 貸倒引当金 ---
  { id: 17, topic: '貸倒引当金', question: '売掛金残高1,000,000円に対して2%の貸倒引当金を設定する（差額補充法、引当金残高5,000円）。貸倒引当金繰入の金額は？',
    options: [{ label: '20,000円', correct: false }, { label: '15,000円', correct: true }, { label: '5,000円', correct: false }, { label: '25,000円', correct: false }],
    explanation: '設定額20,000円−既存残高5,000円＝15,000円を繰入れます。' },
  { id: 18, topic: '貸倒引当金', question: '前期の売掛金30,000円が貸倒れた（貸倒引当金残高20,000円）。貸倒引当金で補えない額の勘定科目は？',
    options: [{ label: '貸倒引当金繰入', correct: false }, { label: '貸倒損失', correct: true }, { label: '雑損', correct: false }, { label: '貸倒引当金', correct: false }],
    explanation: '引当金20,000円を取り崩し、不足分10,000円は「貸倒損失」で処理します。' },

  // --- 減価償却 ---
  { id: 19, topic: '減価償却', question: '備品（取得原価600,000円、残存価額0円、耐用年数5年）の定額法による年間減価償却費は？',
    options: [{ label: '100,000円', correct: false }, { label: '120,000円', correct: true }, { label: '150,000円', correct: false }, { label: '60,000円', correct: false }],
    explanation: '600,000÷5年＝120,000円。残存価額0円の定額法です。' },
  { id: 20, topic: '減価償却', question: '減価償却の記帳方法のうち、固定資産の金額を直接減らさない方法は？',
    options: [{ label: '直接法', correct: false }, { label: '間接法', correct: true }, { label: '定額法', correct: false }, { label: '定率法', correct: false }],
    explanation: '間接法は「減価償却累計額」を使い、固定資産の帳簿価額を直接減らしません。' },

  // --- 租税公課・その他 ---
  { id: 21, topic: 'その他', question: '収入印紙10,000円分を購入し、現金で支払った。借方の勘定科目は？',
    options: [{ label: '通信費', correct: false }, { label: '消耗品費', correct: false }, { label: '租税公課', correct: true }, { label: '雑費', correct: false }],
    explanation: '収入印紙は「租税公課」で処理します。郵便切手は「通信費」です。' },
  { id: 22, topic: 'その他', question: '従業員の出張にあたり仮払金50,000円を現金で渡した。借方の勘定科目は？',
    options: [{ label: '旅費交通費', correct: false }, { label: '仮払金', correct: true }, { label: '立替金', correct: false }, { label: '前払金', correct: false }],
    explanation: '精算前の概算払いは「仮払金」（資産）で処理します。' },
  { id: 23, topic: 'その他', question: '出張から戻った従業員が旅費42,000円を精算し、仮払金50,000円との差額を現金で返却した。旅費交通費の金額は？',
    options: [{ label: '50,000円', correct: false }, { label: '42,000円', correct: true }, { label: '8,000円', correct: false }, { label: '92,000円', correct: false }],
    explanation: '実際に使った42,000円が旅費交通費です。差額8,000円は現金で返却されます。' },
  { id: 24, topic: 'その他', question: '商品の注文を受け、手付金として30,000円を現金で受け取った。貸方の勘定科目は？',
    options: [{ label: '前払金', correct: false }, { label: '仮受金', correct: false }, { label: '前受金', correct: true }, { label: '売上', correct: false }],
    explanation: '商品引渡し前に受け取った手付金は「前受金」（負債）です。' },
  { id: 25, topic: 'その他', question: '電気代15,000円が普通預金口座から引き落とされた。借方の勘定科目は？',
    options: [{ label: '通信費', correct: false }, { label: '水道光熱費', correct: true }, { label: '消耗品費', correct: false }, { label: '支払家賃', correct: false }],
    explanation: '電気代・ガス代・水道代は「水道光熱費」で処理します。' },

  // --- 資本金 ---
  { id: 26, topic: '資本', question: '個人事業主が事業用の現金として500,000円を元入れした。貸方の勘定科目は？',
    options: [{ label: '借入金', correct: false }, { label: '資本金', correct: true }, { label: '元入金', correct: false }, { label: '売上', correct: false }],
    explanation: '事業主が出資した場合は「資本金」が増加します。' },
  { id: 27, topic: '資本', question: '店主が事業用の現金から私用で20,000円を引き出した。借方の勘定科目は？',
    options: [{ label: '引出金', correct: true }, { label: '資本金', correct: false }, { label: '雑損', correct: false }, { label: '仮払金', correct: false }],
    explanation: '事業主の私的な引出しは「引出金」または「資本金の減少」で処理します。' },

  // --- 売上原価 ---
  { id: 28, topic: '売上原価', question: '「仕入」の行で売上原価を算定する場合、期首商品棚卸高50,000円の仕訳で借方は？',
    options: [{ label: '繰越商品', correct: false }, { label: '仕入', correct: true }, { label: '売上原価', correct: false }, { label: '商品', correct: false }],
    explanation: '（借方）仕入 50,000 ／（貸方）繰越商品 50,000。「しーくりくりしー」の最初です。' },
  { id: 29, topic: '売上原価', question: '期首商品50,000円、当期仕入高400,000円、期末商品60,000円のとき、売上原価は？',
    options: [{ label: '400,000円', correct: false }, { label: '390,000円', correct: true }, { label: '410,000円', correct: false }, { label: '450,000円', correct: false }],
    explanation: '売上原価＝期首50,000＋仕入400,000−期末60,000＝390,000円。' },

  // --- 消耗品 ---
  { id: 30, topic: '消耗品', question: '消耗品50,000円を購入し現金で支払った（購入時に費用処理）。決算で未使用分15,000円がある場合の借方は？',
    options: [{ label: '消耗品費', correct: false }, { label: '消耗品', correct: true }, { label: '前払費用', correct: false }, { label: '貯蔵品', correct: false }],
    explanation: '未使用分を「消耗品」（資産）に振り替えます。（借方）消耗品 15,000 ／（貸方）消耗品費 15,000' },

  // --- クレジット売掛金 ---
  { id: 31, topic: 'クレジット', question: '商品100,000円をクレジット払いで売り上げた（手数料4%）。クレジット売掛金の金額は？',
    options: [{ label: '100,000円', correct: false }, { label: '96,000円', correct: true }, { label: '104,000円', correct: false }, { label: '4,000円', correct: false }],
    explanation: '支払手数料4,000円を差し引いた96,000円がクレジット売掛金です。' },

  // --- 電子記録債権・債務 ---
  { id: 32, topic: '電子記録', question: '売掛金200,000円について電子記録債権の発生記録を行った。借方の勘定科目は？',
    options: [{ label: '売掛金', correct: false }, { label: '受取手形', correct: false }, { label: '電子記録債権', correct: true }, { label: '未収入金', correct: false }],
    explanation: '電子記録債権（資産）が発生し、売掛金が減少します。' },

  // --- 法人税等 ---
  { id: 33, topic: '法人税等', question: '法人税等の中間納付額150,000円を現金で支払った。借方の勘定科目は？',
    options: [{ label: '法人税等', correct: false }, { label: '仮払法人税等', correct: true }, { label: '租税公課', correct: false }, { label: '未払法人税等', correct: false }],
    explanation: '中間納付は「仮払法人税等」で処理し、決算で確定額との差額を精算します。' },
  { id: 34, topic: '法人税等', question: '決算で法人税等が400,000円と確定した（中間納付150,000円あり）。未払法人税等の金額は？',
    options: [{ label: '400,000円', correct: false }, { label: '250,000円', correct: true }, { label: '150,000円', correct: false }, { label: '550,000円', correct: false }],
    explanation: '確定額400,000−中間納付150,000＝250,000円が未払法人税等です。' },

  // --- 証ひょう ---
  { id: 35, topic: '証ひょう', question: '領収書に基づき、タクシー代3,500円を現金で支払った。借方の勘定科目は？',
    options: [{ label: '通信費', correct: false }, { label: '旅費交通費', correct: true }, { label: '消耗品費', correct: false }, { label: '雑費', correct: false }],
    explanation: 'タクシー代は「旅費交通費」です。' },

  // --- 追加仕訳問題（頻出パターン）---
  { id: 36, topic: '商品売買', question: '商品500,000円を売り上げ、代金は先方振出の小切手で受け取った。借方の勘定科目は？',
    options: [{ label: '当座預金', correct: false }, { label: '受取手形', correct: false }, { label: '現金', correct: true }, { label: '売掛金', correct: false }],
    explanation: '先方（他人）振出の小切手は「現金」として処理します。' },
  { id: 37, topic: '手形', question: '受取手形100,000円を銀行で割引き、割引料2,000円を差し引かれて当座預金に入金された。手形売却損は？',
    options: [{ label: '100,000円', correct: false }, { label: '2,000円', correct: true }, { label: '98,000円', correct: false }, { label: '0円', correct: false }],
    explanation: '割引料2,000円が「手形売却損」です。当座預金には98,000円が入金されます。' },
  { id: 38, topic: '固定資産', question: '建物の修繕を行い、50,000円を現金で支払った（収益的支出）。借方の勘定科目は？',
    options: [{ label: '建物', correct: false }, { label: '修繕費', correct: true }, { label: '建設仮勘定', correct: false }, { label: '消耗品費', correct: false }],
    explanation: '収益的支出（原状回復）は「修繕費」（費用）です。資本的支出（価値向上）なら固定資産に加算します。' },
  { id: 39, topic: '現金・預金', question: '定期預金1,000,000円が満期となり、利息5,000円とともに普通預金に入金された。受取利息の金額は？',
    options: [{ label: '1,000,000円', correct: false }, { label: '1,005,000円', correct: false }, { label: '5,000円', correct: true }, { label: '995,000円', correct: false }],
    explanation: '利息5,000円が「受取利息」（収益）です。' },
  { id: 40, topic: '経過勘定', question: '決算にて、受取家賃の未収分30,000円を計上する。借方の勘定科目は？',
    options: [{ label: '前受家賃', correct: false }, { label: '受取家賃', correct: false }, { label: '未収家賃', correct: true }, { label: '前払家賃', correct: false }],
    explanation: '（借方）未収家賃 30,000 ／（貸方）受取家賃 30,000 と仕訳します。' },
  { id: 41, topic: '商品売買', question: '商品を売り上げ、発送運賃8,000円を現金で支払った（当社負担）。借方の勘定科目は？',
    options: [{ label: '仕入', correct: false }, { label: '発送費', correct: true }, { label: '売上', correct: false }, { label: '支払運賃', correct: false }],
    explanation: '売上にかかる発送費（当社負担）は「発送費」（費用）で処理します。' },
  { id: 42, topic: 'その他', question: '給料200,000円を支払う際、所得税の源泉徴収分30,000円を差し引いて現金で支給した。預り金の金額は？',
    options: [{ label: '200,000円', correct: false }, { label: '170,000円', correct: false }, { label: '30,000円', correct: true }, { label: '230,000円', correct: false }],
    explanation: '源泉徴収した30,000円は「預り金」（負債）です。従業員には170,000円を支給します。' },
  { id: 43, topic: 'その他', question: '普通預金の利息200円が入金され、うち30円が源泉所得税として差し引かれていた。受取利息の金額は？',
    options: [{ label: '170円', correct: false }, { label: '200円', correct: true }, { label: '30円', correct: false }, { label: '230円', correct: false }],
    explanation: '受取利息は税引前の200円です。源泉所得税30円は「仮払法人税等」で処理します。' },
  { id: 44, topic: '商品売買', question: '前期に売り上げた商品について、当期に5,000円の売上割戻を行い現金で支払った。借方の勘定科目は？',
    options: [{ label: '売上', correct: true }, { label: '仕入', correct: false }, { label: '売上割引', correct: false }, { label: '雑損', correct: false }],
    explanation: '売上割戻は「売上」の減少として処理します。' },
  { id: 45, topic: '固定資産', question: '期首に備品（取得原価240,000円、耐用年数4年、残存価額0円、間接法）の2年目の減価償却を行う。減価償却累計額の貸方金額は？',
    options: [{ label: '240,000円', correct: false }, { label: '120,000円', correct: false }, { label: '60,000円', correct: true }, { label: '80,000円', correct: false }],
    explanation: '年間償却費＝240,000÷4＝60,000円。間接法なので減価償却累計額の貸方に60,000円。' },
  { id: 46, topic: '貸付・借入', question: '借入金500,000円を返済し、利息10,000円とともに当座預金から支払った。当座預金の減少額は？',
    options: [{ label: '500,000円', correct: false }, { label: '510,000円', correct: true }, { label: '490,000円', correct: false }, { label: '10,000円', correct: false }],
    explanation: '元本500,000＋利息10,000＝510,000円が当座預金から減少します。' },
  { id: 47, topic: 'クレジット', question: 'クレジット売掛金96,000円が普通預金に入金された。借方の勘定科目は？',
    options: [{ label: 'クレジット売掛金', correct: false }, { label: '普通預金', correct: true }, { label: '売掛金', correct: false }, { label: '現金', correct: false }],
    explanation: '普通預金（資産）が増加するため借方に記入します。クレジット売掛金は貸方で減少。' },
  { id: 48, topic: '電子記録', question: '買掛金150,000円について電子記録債務の発生記録を行った。貸方の勘定科目は？',
    options: [{ label: '買掛金', correct: false }, { label: '支払手形', correct: false }, { label: '電子記録債務', correct: true }, { label: '未払金', correct: false }],
    explanation: '電子記録債務（負債）が発生し、買掛金が減少します。' },
  { id: 49, topic: '消耗品', question: '決算にて、貯蔵品として切手の未使用分2,000円を計上する。借方の勘定科目は？',
    options: [{ label: '通信費', correct: false }, { label: '消耗品', correct: false }, { label: '貯蔵品', correct: true }, { label: '前払費用', correct: false }],
    explanation: '未使用の切手は「貯蔵品」（資産）に振り替えます。' },
  { id: 50, topic: 'その他', question: '火災により商品（帳簿価額200,000円）が焼失した。保険金は未確定。借方の勘定科目は？',
    options: [{ label: '雑損', correct: false }, { label: '火災損失', correct: false }, { label: '火災未決算', correct: true }, { label: '保険差益', correct: false }],
    explanation: '保険金が確定するまで「火災未決算」で処理します。確定後に差額を火災損失または保険差益とします。' },

  // --- 小口現金 ---
  { id: 51, topic: '小口現金', question: '小口現金係から、交通費3,000円・消耗品費2,000円・通信費1,000円の報告を受けた。費用合計は？',
    options: [{ label: '3,000円', correct: false }, { label: '5,000円', correct: false }, { label: '6,000円', correct: true }, { label: '1,000円', correct: false }],
    explanation: '3,000+2,000+1,000＝6,000円。各費用を借方に計上し、小口現金を貸方で減少させます。' },
  { id: 52, topic: '小口現金', question: 'インプレスト・システムで小口現金を補給する際、補給元はどの勘定？',
    options: [{ label: '現金', correct: false }, { label: '当座預金', correct: true }, { label: '普通預金', correct: false }, { label: '仮払金', correct: false }],
    explanation: 'インプレスト・システムでは、使用額と同額を当座預金から補給して一定額を維持します。' },
  { id: 53, topic: '小口現金', question: '小口現金の前渡額50,000円に対し、支払報告額42,000円。補給額は？',
    options: [{ label: '50,000円', correct: false }, { label: '42,000円', correct: true }, { label: '8,000円', correct: false }, { label: '92,000円', correct: false }],
    explanation: '使った分42,000円を補給して50,000円に戻します。' },

  // --- 当座借越 ---
  { id: 54, topic: '当座借越', question: '当座預金残高100,000円のとき、150,000円の小切手を振り出した（借越限度額200,000円）。当座借越の金額は？',
    options: [{ label: '50,000円', correct: true }, { label: '150,000円', correct: false }, { label: '100,000円', correct: false }, { label: '200,000円', correct: false }],
    explanation: '残高100,000−振出150,000＝−50,000。借越限度額内なので50,000円が当座借越（負債）。' },
  { id: 55, topic: '当座借越', question: '決算にて、当座預金勘定が貸方残高30,000円の場合、振り替える勘定科目は？',
    options: [{ label: '現金', correct: false }, { label: '借入金', correct: false }, { label: '当座借越', correct: true }, { label: '未払金', correct: false }],
    explanation: '二勘定制では、貸方残高を「当座借越」（負債）に振り替えます。' },

  // --- 試算表 ---
  { id: 56, topic: '試算表', question: '合計試算表の借方合計と貸方合計が一致しない場合、最も考えられる原因は？',
    options: [{ label: '決算整理が未完了', correct: false }, { label: '転記ミスまたは仕訳ミス', correct: true }, { label: '売上原価が未計算', correct: false }, { label: '貸倒引当金が未設定', correct: false }],
    explanation: '試算表の不一致は仕訳か転記の段階でのミスを示します。' },
  { id: 57, topic: '試算表', question: '残高試算表で「売上」は借方・貸方どちらに記載される？',
    options: [{ label: '借方', correct: false }, { label: '貸方', correct: true }, { label: '両方', correct: false }, { label: '記載しない', correct: false }],
    explanation: '売上は収益なので通常貸方残高。残高試算表では貸方に記載します。' },
  { id: 58, topic: '試算表', question: '残高試算表の借方に記載される勘定科目のグループは？',
    options: [{ label: '資産と費用', correct: true }, { label: '負債と収益', correct: false }, { label: '資産と収益', correct: false }, { label: '費用と負債', correct: false }],
    explanation: '資産と費用は通常借方残高なので、残高試算表の借方に記載されます。' },
]

// ========================================
// 大問2対策：勘定記入・補助簿
// ========================================
export type AccountQuestion = {
  id: number
  question: string
  options: QuizOption[]
  explanation: string
  topic: string
}

export const accountQuestions: AccountQuestion[] = [
  { id: 1, topic: '補助簿', question: '商品を掛けで仕入れた取引を記入する補助簿として正しいものは？',
    options: [{ label: '売上帳', correct: false }, { label: '仕入帳と買掛金元帳', correct: true }, { label: '現金出納帳', correct: false }, { label: '受取手形記入帳', correct: false }],
    explanation: '掛け仕入は「仕入帳」と「買掛金元帳（仕入先元帳）」に記入します。' },
  { id: 2, topic: '補助簿', question: '当座預金の入出金を記録する補助簿は？',
    options: [{ label: '現金出納帳', correct: false }, { label: '小口現金出納帳', correct: false }, { label: '当座預金出納帳', correct: true }, { label: '普通仕訳帳', correct: false }],
    explanation: '当座預金出納帳で入出金を管理します。' },
  { id: 3, topic: '補助簿', question: '固定資産の取得・売却・減価償却を記録する補助簿は？',
    options: [{ label: '固定資産台帳', correct: true }, { label: '商品有高帳', correct: false }, { label: '仕入帳', correct: false }, { label: '総勘定元帳', correct: false }],
    explanation: '固定資産台帳は各資産の取得日、取得原価、償却状況などを管理します。' },
  { id: 4, topic: '勘定記入', question: '勘定口座の締め切りで、収益の勘定残高を振り替える相手勘定は？',
    options: [{ label: '繰越利益剰余金', correct: false }, { label: '損益', correct: true }, { label: '資本金', correct: false }, { label: '繰越商品', correct: false }],
    explanation: '収益・費用の勘定残高は「損益」勘定に振り替えて締め切ります。' },
  { id: 5, topic: '勘定記入', question: '損益勘定の貸方合計が借方合計より大きい場合、差額は何を意味する？',
    options: [{ label: '当期純損失', correct: false }, { label: '当期純利益', correct: true }, { label: '資本金の増加', correct: false }, { label: '負債の増加', correct: false }],
    explanation: '貸方（収益）＞借方（費用）なので当期純利益です。' },
  { id: 6, topic: '伝票', question: '3伝票制で、掛けによる商品の仕入を起票する伝票は？',
    options: [{ label: '入金伝票', correct: false }, { label: '出金伝票', correct: false }, { label: '振替伝票', correct: true }, { label: '仕入伝票', correct: false }],
    explanation: '現金の入出金を伴わない取引は「振替伝票」で起票します。' },
  { id: 7, topic: '伝票', question: '3伝票制で一部現金取引を分解法で処理する場合、商品80,000円を売り上げ30,000円を現金で受け取り残りは掛けとした。入金伝票の金額は？',
    options: [{ label: '80,000円', correct: false }, { label: '30,000円', correct: true }, { label: '50,000円', correct: false }, { label: '110,000円', correct: false }],
    explanation: '分解法では現金部分30,000円を入金伝票、掛け部分50,000円を振替伝票で起票します。' },
  { id: 8, topic: '商品有高帳', question: '商品有高帳で先入先出法を採用した場合、払出単価はどのように決まる？',
    options: [{ label: '最も新しく仕入れた単価', correct: false }, { label: '最も古く仕入れた単価', correct: true }, { label: '平均単価', correct: false }, { label: '売価の70%', correct: false }],
    explanation: '先入先出法は、先に仕入れたものから先に払い出す方法です。' },
  { id: 9, topic: '勘定記入', question: '資産の勘定で、次期繰越を記入する側は？',
    options: [{ label: '借方', correct: false }, { label: '貸方', correct: true }, { label: 'どちらでもよい', correct: false }, { label: '記入しない', correct: false }],
    explanation: '資産は通常借方残高なので、次期繰越は貸方に記入して帳簿を締め切ります。' },
  { id: 10, topic: '勘定記入', question: '当期純利益を繰越利益剰余金に振り替える仕訳の借方は？',
    options: [{ label: '繰越利益剰余金', correct: false }, { label: '損益', correct: true }, { label: '資本金', correct: false }, { label: '利益準備金', correct: false }],
    explanation: '（借方）損益 ／（貸方）繰越利益剰余金 と仕訳します。' },
]

// ========================================
// 大問3対策：決算・精算表
// ========================================
export type SettlementQuestion = {
  id: number
  question: string
  options: QuizOption[]
  explanation: string
  topic: string
}

export const settlementQuestions: SettlementQuestion[] = [
  { id: 1, topic: '精算表', question: '精算表で、試算表の借方合計と貸方合計が一致しない場合、考えられる原因は？',
    options: [{ label: '決算整理仕訳が未了', correct: false }, { label: '転記ミスがある', correct: true }, { label: '期末商品がある', correct: false }, { label: '減価償却が未了', correct: false }],
    explanation: '試算表は転記の正確性を確認するもの。不一致は仕訳か転記のミスです。' },
  { id: 2, topic: '精算表', question: '精算表の損益計算書欄で、貸方合計が借方合計を50,000円上回った。これは何を意味する？',
    options: [{ label: '当期純損失50,000円', correct: false }, { label: '当期純利益50,000円', correct: true }, { label: '資産の増加50,000円', correct: false }, { label: '負債の増加50,000円', correct: false }],
    explanation: '損益計算書欄で貸方（収益）＞借方（費用）なので、差額は当期純利益です。' },
  { id: 3, topic: '決算整理', question: '売上原価を「仕入」の行で計算する場合、期末商品40,000円の仕訳は？',
    options: [{ label: '（借方）仕入 40,000 ／（貸方）繰越商品 40,000', correct: false }, { label: '（借方）繰越商品 40,000 ／（貸方）仕入 40,000', correct: true }, { label: '（借方）売上原価 40,000 ／（貸方）商品 40,000', correct: false }, { label: '（借方）商品 40,000 ／（貸方）売上原価 40,000', correct: false }],
    explanation: '「しーくりくりしー」の2行目。（借方）繰越商品 ／（貸方）仕入 で期末商品を戻します。' },
  { id: 4, topic: '決算整理', question: '受取手数料の前受分8,000円を計上する仕訳の借方は？',
    options: [{ label: '前受手数料', correct: false }, { label: '受取手数料', correct: true }, { label: '前払手数料', correct: false }, { label: '未収手数料', correct: false }],
    explanation: '（借方）受取手数料 8,000 ／（貸方）前受手数料 8,000。収益を減らして負債を立てます。' },
  { id: 5, topic: '決算整理', question: '建物（取得原価3,000,000円、残存価額0円、耐用年数30年、間接法）の減価償却。修正記入欄の借方は？',
    options: [{ label: '減価償却累計額 100,000', correct: false }, { label: '減価償却費 100,000', correct: true }, { label: '建物 100,000', correct: false }, { label: '修繕費 100,000', correct: false }],
    explanation: '3,000,000÷30＝100,000円。（借方）減価償却費 100,000 ／（貸方）建物減価償却累計額 100,000' },
  { id: 6, topic: 'B/S', question: '貸借対照表で「繰越商品」はどの区分に表示する？',
    options: [{ label: '固定資産', correct: false }, { label: '流動資産', correct: true }, { label: '流動負債', correct: false }, { label: '純資産', correct: false }],
    explanation: '繰越商品（期末商品棚卸高）は流動資産に「商品」として表示します。' },
  { id: 7, topic: 'B/S', question: '貸借対照表で、減価償却累計額はどのように表示する？',
    options: [{ label: '流動負債に表示', correct: false }, { label: '該当する固定資産から控除', correct: true }, { label: '純資産に表示', correct: false }, { label: '費用として表示', correct: false }],
    explanation: '減価償却累計額は固定資産の取得原価から控除する形で表示します。' },
  { id: 8, topic: 'P/L', question: '損益計算書で「売上総利益」の計算式は？',
    options: [{ label: '売上高 − 販売費及び一般管理費', correct: false }, { label: '売上高 − 売上原価', correct: true }, { label: '売上高 − 営業外費用', correct: false }, { label: '売上高 − 法人税等', correct: false }],
    explanation: '売上総利益（粗利）＝ 売上高 − 売上原価 です。' },
  { id: 9, topic: 'P/L', question: '受取利息は損益計算書のどの区分に表示する？',
    options: [{ label: '売上高', correct: false }, { label: '営業外収益', correct: true }, { label: '特別利益', correct: false }, { label: '売上総利益', correct: false }],
    explanation: '受取利息は本業以外の収益なので「営業外収益」に表示します。' },
  { id: 10, topic: '精算表', question: '精算表で当期純利益が計算されたとき、その金額を貸借対照表欄のどちらに記入する？',
    options: [{ label: '借方', correct: false }, { label: '貸方', correct: true }, { label: '両方', correct: false }, { label: '記入しない', correct: false }],
    explanation: '当期純利益は貸借対照表欄の貸方（純資産の増加）に記入します。' },
]
