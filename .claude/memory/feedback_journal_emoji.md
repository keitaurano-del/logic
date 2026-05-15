---
name: feedback-journal-emoji
description: Logic のジャーナル機能のみ絵文字 UI を許可する例外方針。4 箇所（mood / weather / phase tab / journal-internal streak）に限定。他画面の SVG アイコンは維持。
type: feedback
originSessionId: claude-add-emoji-journal-mood-jG0Da
---

Logic アプリは原則 SVG only（`src/icons/index.tsx`、CLAUDE.md common gotcha §5）だが、**ジャーナル機能だけは絵文字 OK** の例外方針（2026-05-15 Keita 判断）。

**Why:** ジャーナルは「気分入力」が主目的で、慣れ親しんだ絵文字 UI のほうが入力ハードルが下がる。SVG の自作顔アイコンは抽象的で日常的な感情表現と距離があった。

**ホワイトリスト（絵文字 OK の 4 箇所）:**
1. **ムード選択 1〜5** — 😢 😟 😐 🙂 😄
   - `src/components/journal/MoodWeatherIcons.tsx` の `MoodIcon`
   - 利用箇所: `MoodSelector`（Today/DetailSheet）、`JournalCalendar` セル
2. **天気選択** — ❄️ 🌧️ ☁️ ☀️（雪→雨→曇り→晴れ、ムードと同じ「悪い→良い」並び）
   - `src/components/journal/MoodWeatherIcons.tsx` の `WeatherIcon`
3. **朝/夜 Phase tab** — ☀️ / 🌙
   - `src/components/journal/JournalToday.tsx` 内 inline
4. **ジャーナル内ストリーク** — 🔥
   - `src/components/journal/StreakBadge.tsx`
   - **注意: ホーム / Profile / LessonComplete / Streak 画面の `FlameIcon` は SVG 維持**（共有コンポーネントなので巻き戻し汚染しないこと）

**SVG のまま維持:**
- `SparkleIcon`（AI 要約・フィードバック CTA）
- `MicIcon`（音声入力）
- 矢印・モーダル等 UI 汎用アイコン
- 他画面（Roadmap / Lesson / Profile / Home）のすべてのアイコン

**How to apply:**
- ジャーナル外の UI で「絵文字使っていい？」となったら **NG**（Keita 確認なしに広げない）
- 過去 PR #156 で「SVG が正解」と誤判断して PNG → SVG 巻き戻し事故あり。**ホワイトリスト 4 箇所を絵文字から SVG に戻す変更も同じくデグレ**として扱う
- CSS は `src/components/journal/journal.css` の `.journal-emoji-icon` 共通クラス（font-family フォールバック付き）を使う
- 絵文字は `aria-hidden="true"` 必須、意味は親要素の `aria-label` で伝える
- active 状態は背景色変化に頼らない（絵文字は色固定なので）。`box-shadow` リング + `var(--brand-soft)` 反転パターン + `scale(1.08)` で affordance を担保
