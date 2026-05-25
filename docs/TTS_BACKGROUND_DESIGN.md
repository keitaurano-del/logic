# TTS バックグラウンド再生 設計ドキュメント

最終更新: 2026-05-25
ステータス: Tier 1 / Tier 2 実装済み (Cloud TTS 不使用・追加課金なし) / Tier 3 未着手

---

## 1. 背景と問題

現在の Logic の読み上げ機能は `@capacitor-community/text-to-speech` (Android: `android.speech.tts.TextToSpeech` / iOS: `AVSpeechSynthesizer`) をラップして実装している (`src/ttsService.ts`)。
ユーザー (Keita) から「画面オフ・アプリ閉じても読み上げを継続したい」という要望がある。

### 1.1 なぜ素の実装では画面オフで止まるのか

| 要因 | 説明 |
|---|---|
| TextToSpeech プラグインは音声 session を確保していない | Android の `TextToSpeech` は `AudioManager` 経由で短期の音声 stream を出すだけで、`MediaSession` や Foreground Service と連携していない |
| アプリが background に入ると Doze / App Standby が走る | Android 8+ では非 foreground アプリは数十秒で suspend されうる。WebView の JS も止まる |
| 「現スライドの読み上げ → onEnd → 次スライド speak」ループが JS 側にある | speak が終わっても JS が動かないと次の発話に進めない。バックグラウンドで JS が止まる時点で詰む |
| 画面オフは `onPause` を発火し、Capacitor の WebView も resume 待ち | iOS / Android 共通の挙動 |

### 1.2 ユーザー期待値

- 通勤中、画面オフでもイヤホンから読み上げが続く
- ロックスクリーンに再生中タイトル / 一時停止ボタン / 早送りが出る (Spotify 風)
- 通話などで割り込まれたら一時停止、終わったら再開

### 1.3 Cloud TTS 不使用方針

過去の Phase 2 案では Google Cloud TTS / Polly / Azure で mp3 を事前合成して HTMLAudio + MediaSession で再生する設計だった。試算では月 $240 (Standard) 〜 $960 (Wavenet) の課金が発生する見込みで、Keita 判断で **Cloud TTS は採用しない** 方針に確定した (2026-05-25)。

そのため OS 内蔵 TextToSpeech エンジンを使ったまま、追加課金ゼロでバックグラウンド再生を成立させる手段を 3 段階 (Tier) に分けて積み上げる方針に切り替えた。

---

## 2. 実装方針 (Cloud TTS 不使用版)

### Tier 1: HTMLAudio silent loop + Screen Wake Lock (実装済み)

- **やること**:
  1. `speak()` 呼び出し時に超短尺の無音 WAV を `data:` URI から `new Audio()` で生成し `loop=true` で再生開始
  2. 同時に `navigator.wakeLock.request('screen')` で画面オフ抑止を試みる
  3. `stop()` 時に両方解放
- **狙い**:
  - iOS: HTMLAudio が `AVAudioSession` (`.playback` カテゴリ) を active 化し、`AVSpeechSynthesizer` 経由の TTS も連動して background で発話継続しやすくなる
  - Android: Wake Lock で画面オフ自体を抑え、WebView と TextToSpeech 双方が suspend されにくくする
- **メリット**:
  - 追加課金ゼロ
  - 端末リソースのみで完結
  - 既存 `speak()` 利用箇所 (LessonStoriesScreen / TtsControlPanel) は API 変更なし
- **限界**:
  - Android で **画面が完全に消えた後** の動作は端末・OS バージョン依存
  - WakeLock は省電力設定で拒否されることがある
  - 「アプリを kill / スワイプで閉じた」場合は止まる (Foreground Service 化が必要 = Tier 3)
- **工数**: 軽 (実装済み、コード差分は `src/ttsService.ts` の `startKeepAlive` / `stopKeepAlive`)

### Tier 2: AVAudioSession playback category 明示 (実装済み、iOS 側のみ将来適用)

- **やること**:
  - `TextToSpeech.speak({ ..., category: 'playback' })` を全 speak 呼び出しで指定 (実装済み)
  - iOS アプリ追加時に `Info.plist` へ `UIBackgroundModes: [audio]` を追加 (現状 iOS プロジェクト未生成)
- **狙い**: iOS の AVSpeechSynthesizer がバックグラウンドで継続発話可能になる
- **メリット**: iOS では Tier 1 + Tier 2 だけで実用レベルの BG 再生が見込める
- **限界**: iOS プロジェクト生成 (`npx cap add ios`) 後に Info.plist 編集が必要。現状は Android only build なので保留
- **工数**: 軽 (TextToSpeech 側は対応済み、Info.plist は iOS 着手時に同時設定)

### Tier 3: Android Foreground Service + MediaSession (未着手)

- **やること**: カスタム Capacitor plugin で `ForegroundService` + `MediaSessionCompat` を起動し、その中で OS TextToSpeech を呼ぶ
- **狙い**: アプリ kill / 画面オフ完全対応 + ロックスクリーン UI
- **メリット**: Spotify 風の本格 BG 再生
- **デメリット**: Kotlin native 実装で 3〜5 日工数、Android 14 では `FOREGROUND_SERVICE_MEDIA_PLAYBACK` 許諾 + 通知設計が必要
- **工数**: 重 (別 PR、Tier 1/2 の本番反応を見てから着手判断)

---

## 3. 想定動作マトリクス (Tier 1 + Tier 2 実装後)

| 状況 | iOS (将来) | Android |
|---|---|---|
| アプリ前面・画面 ON | ◎ 継続再生 | ◎ 継続再生 |
| アプリ前面・他アプリへ切替 | ○ 継続再生 (AVAudioSession active) | △ 端末依存・短時間は継続 |
| 画面オフ (アプリは前面) | ◎ Wake Lock で画面 ON 維持 → 継続 | ◎ Wake Lock で画面 ON 維持 → 継続 |
| 画面オフ (Wake Lock 拒否) | ○ silent loop で AVAudioSession 維持・継続 | △ Doze まで猶予あり、その後停止 |
| アプリスワイプで kill | ✕ 停止 | ✕ 停止 (Tier 3 で対応予定) |
| 通話割り込み | ○ 自動 pause (AudioFocus) | ○ 自動 pause |

凡例: ◎ ほぼ確実 / ○ 高確率 / △ 端末依存 / ✕ 停止

---

## 4. 実装ファイル

| ファイル | 変更内容 |
|---|---|
| `src/ttsService.ts` | `startKeepAlive()` / `stopKeepAlive()` 追加、silent WAV data URI 埋め込み、Wake Lock 取得、`speak()` / `stop()` から呼び出し |
| `android/app/src/main/AndroidManifest.xml` | `WAKE_LOCK` / `FOREGROUND_SERVICE` / `FOREGROUND_SERVICE_MEDIA_PLAYBACK` permission 追加 (FOREGROUND_SERVICE 系は Tier 3 への布石、現状は宣言のみ) |
| `capacitor.config.ts` | TextToSpeech category 指定の方針コメント追記 (設定キー自体は ttsService 側で渡している) |
| `ios/App/App/Info.plist` | 未対応 (iOS プロジェクト未生成)。将来 `npx cap add ios` 後に `UIBackgroundModes: [audio]` を追加 |

---

## 5. 検証ポイント (端末確認時)

| # | 項目 | 期待値 |
|---|---|---|
| 1 | 読み上げ開始後、ホームボタンで別アプリへ切替 | 数秒〜数十秒間は継続再生 (Wake Lock 効くと画面 ON 維持) |
| 2 | 画面オフボタン押下 | Wake Lock 動作中は画面 ON 維持、停止後も silent loop の間は継続 |
| 3 | 再生中に `stop()` 呼び出し (UI から終了) | silent audio 停止 + wake lock 解放 = バッテリー消費停止 |
| 4 | OS の省電力モード ON 時 | Wake Lock 拒否されても silent loop だけは試行される (best-effort) |
| 5 | 通話着信 | TTS 自動停止 → 通話後ユーザーが手動再開 |

---

## 6. 関連 memory / 制約

- `project_logic_mobile_only` — モバイル体験優先、Web 単体の BG 対応は対象外
- `feedback_app_copy_neutral` — UI 文言は丁寧体維持
- 追加課金禁止 (Keita 明示 2026-05-25): Cloud TTS / Polly / Azure 等は使わない方針

---

## 7. 過去案 (アーカイブ)

過去の Phase 2 設計では Google Cloud TTS で MP3 を事前生成して HTMLAudio + MediaSession で再生する重実装案を採用していた。
試算で月 $240〜$960 の課金が発生する見込みだったため、Keita 判断で 2026-05-25 に却下。
本ドキュメントは「Cloud TTS 不使用・OS 内蔵 TTS + silent loop + Wake Lock 構成」を正式採用案として書き換えたもの。
