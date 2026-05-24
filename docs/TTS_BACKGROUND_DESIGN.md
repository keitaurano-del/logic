# TTS バックグラウンド再生 設計ドキュメント (Phase 2)

最終更新: 2026-05-24
ステータス: 設計フェーズ (Phase 1 のシークバーは実装済み、Phase 2 はまだ実装着手前)

---

## 1. 背景と問題

現在の Logic の読み上げ機能は `@capacitor-community/text-to-speech` (Android: `android.speech.tts.TextToSpeech`) をラップして実装している (`src/ttsService.ts`)。
ユーザー (Keita) から「画面オフ・アプリ閉じても読み上げを継続したい」という要望がある。

### 1.1 なぜ現状の実装では画面オフで止まるのか

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

---

## 2. 実現方針の選択肢

3 つのアプローチを評価する。Phase 2 で実装するのは **Option C (フルメディア化)** を推奨。
ただし工数が重いため、暫定対処として Option A → C への段階移行も視野に入れる。

### Option A: Wake Lock + Foreground Service で TextToSpeech を延命する

- **やること**: Android 側で `PARTIAL_WAKE_LOCK` を取り、`Foreground Service` (通知バー常駐) を起動。その間 `TextToSpeech` を継続発話。
- **メリット**:
  - 既存の `@capacitor-community/text-to-speech` を変えずに済む
  - 発話品質は端末 native TTS engine のまま
- **デメリット**:
  - WebView の JS は止まる → 「次スライド」遷移ロジックが動かない
  - Foreground Service 通知は出るが、操作 (一時停止 / 次へ) を通知に出す API を別途実装必要
  - Doze で TTS が中断される報告あり (端末依存)
  - iOS では Foreground Service の概念がなく、Background Audio entitlement + Audio Session 必須 → 結局 Option C と同じことをやる羽目になる
- **工数**: 中 (Android 側 Kotlin 実装 1〜2 日)
- **評価**: 中継ぎとしては可。ただし「次スライド遷移ロジックを Android Kotlin 側に複製」する必要があり、本実装としては筋が悪い

### Option B: Service Worker + Web Speech API (Web のみ)

- **やること**: Service Worker を登録、 backgrounded でも Web Speech API を継続。
- **メリット**: Web だけならお手軽
- **デメリット**:
  - **Logic はモバイル専用** (`project_logic_mobile_only` メモリ)。Web 単体のバックグラウンド対応は施策外
  - iOS Safari / Capacitor WebView の Web Speech は backgrounded で停止する
- **評価**: 却下

### Option C: Cloud TTS で MP3 事前生成 + HTML5 Audio + MediaSession API 推奨

- **やること**:
  1. レッスン読み込み時に readable スライドの本文を **Google Cloud TTS / Amazon Polly / Azure TTS** などで事前合成 (CDN にキャッシュ)
  2. `HTMLAudioElement` (`<audio>`) + Capacitor の `@capacitor-community/native-audio` または独自 plugin で再生
  3. Android: Foreground Service + `MediaSession` でロックスクリーン制御。iOS: `AVAudioSession` + Background Modes `audio`
  4. JS 側は「play 完了したら次の audio をキューに積む」だけ。バックグラウンドでも `Audio.play()` は OS が責任を持つ
- **メリット**:
  - **画面オフ・アプリ kill されても継続再生** (OS のメディア再生扱い)
  - **ロックスクリーンに UI が出る** (タイトル・サムネ・前/次/再生)
  - 通話割り込み・Bluetooth 切替・カーオーディオに自動対応
  - 速度・ピッチも事前合成時に決められる + クライアント側の `playbackRate` も使える
- **デメリット**:
  - **クラウド TTS 課金** (Google: $4 / 1M chars、Wavenet $16 / 1M chars)
  - 事前合成のレイテンシ (オフライン時の挙動を別途設計必要)
  - 音声ファイルのキャッシュ管理 (Supabase Storage or Cloudflare R2)
  - レッスン更新時の再合成
- **工数**: 重 (3〜5 日: バックエンド合成 API + 端末側 native plugin or 既存 plugin 採用 + キャッシュ層)

### 採用案

**Option C を本実装** とし、Phase 2.5 として Option A を「暫定: Android のみフォアグラウンドで継続発話、画面オフ後 90 秒で止まっても許容」で挟むのも検討余地あり。Keita の判断待ち。

---

## 3. Phase 2 (Option C) 実装ステップ

### 3.1 サーバー側 (`server/routes/tts.ts` 新規)

- `POST /api/tts/synthesize` `{ lessonId, slideIndex, voice, rate, lang }` → mp3 URL を返す
- 内部: Google Cloud TTS `texttospeech.synthesize`、出力を Supabase Storage `tts-cache/{lessonId}/{slideIndex}-{voiceHash}.mp3` に PUT
- 既にキャッシュ済みなら即 URL 返す (同じ voice + text 組み合わせ → SHA1)
- レート制限: ユーザーあたり 100 req / hour
- 環境変数: `GOOGLE_CLOUD_TTS_KEY` (JSON service account) → Render secret

### 3.2 端末側 native plugin

#### Android

新規 Kotlin plugin `BackgroundAudioPlayer.kt`:

- `ExoPlayer` (or `MediaPlayer`) でストリーミング再生
- `MediaSessionCompat` を作成、`PlaybackState` を維持
- `MediaStyle` Notification を Foreground Service `ForegroundAudioService` から post
- `AndroidManifest.xml` 追加:
  ```xml
  <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
  <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK" />
  <uses-permission android:name="android.permission.WAKE_LOCK" />

  <service
    android:name=".audio.ForegroundAudioService"
    android:foregroundServiceType="mediaPlayback"
    android:exported="false" />
  ```

#### iOS

- `AVAudioSession.sharedInstance().setCategory(.playback, mode: .spokenAudio)`
- `Info.plist` に `UIBackgroundModes: [audio]`
- `MPNowPlayingInfoCenter` で再生情報セット
- `MPRemoteCommandCenter` で前/次/再生/一時停止のコマンド購読

### 3.3 JS 側統合

- 新 module `src/audioService.ts` を追加 (TTS と並行運用)
- `LessonStoriesScreen` で「TTS モード ON 時はまず `/api/tts/synthesize` をプリフェッチ」→「再生は audioService 経由」
- 既存 `ttsService` は **device 上の合成 fallback** として残す (オフライン時 / 課金枠超過時)

### 3.4 シークバーとの連携

- Phase 1 のシークバーは「スライド単位」の頭出し
- Phase 2 ではこれに加えて **スライド内の秒数シーク** が可能 (mp3 の `currentTime` を弄る)
- 当面は Phase 1 仕様 (スライド単位) を維持で OK

---

## 4. リスク & オープン項目

| # | リスク / 未確定事項 | 対応案 |
|---|---|---|
| 1 | Cloud TTS 月額コスト試算未済 | 1 ユーザー 1 セッション 10 スライド × 200 文字 × 30 日 = 60,000 chars/月。1000 ユーザーで 60M chars → Standard で $240 / Wavenet で $960。要 Keita 判断 |
| 2 | オフライン時の挙動 | キャッシュ済 mp3 のみ再生。未キャッシュは「ネットに繋がるとダウンロードします」表示 + device TTS に fallback |
| 3 | iOS の Background Audio entitlement 申請 | App Store 審査時に「なぜバックグラウンド再生が必要か」説明必須。レッスン読み上げという正当な理由あり |
| 4 | Capacitor 上で `<audio>` がフォーカスを奪わないか | `AVAudioSession` カテゴリで明示的に制御。Android は AudioFocus request 必要 |
| 5 | レッスン更新時のキャッシュ無効化 | `lessons/{id}` の updatedAt を SHA1 に含める or 手動 invalidate API |

---

## 5. 段階分けロードマップ

- **Phase 1 (完了)**: シークバー UI + スライド単位の頭出し
- **Phase 2.0 (要 Keita GO)**: Cloud TTS バックエンド API + キャッシュ層 + 既存 ttsService から mp3 再生への切り替え (Web で先に検証)
- **Phase 2.1**: Android ForegroundService + MediaSession + ロックスクリーン UI
- **Phase 2.2**: iOS AVAudioSession + MPNowPlayingInfoCenter
- **Phase 2.3**: オフライン fallback (device TTS への自動切替)
- **Phase 2.4**: スライド内秒数シーク

---

## 6. 関連ファイル

- `src/ttsService.ts` — 現行の device TTS ラッパー
- `src/components/TtsControlPanel.tsx` — シークバー含むコントロール UI
- `src/screens/LessonStoriesScreen.tsx` — 読み上げモードの状態管理
- `android/app/src/main/AndroidManifest.xml` — permission 追加予定 (Phase 2.1)
- `capacitor.config.ts` — plugin 設定予定 (Phase 2.0)

## 7. 関連 memory

- `project_logic_mobile_only` — Web 単体のバックグラウンド対応は対象外
- `feedback_app_copy_neutral` — UI 文言は丁寧体維持
