/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
  readonly VITE_SENTRY_DSN?: string
  readonly VITE_APP_VERSION?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// DF-F21: vite.config の define で注入するビルド時フォールバック版（package.json
// version + デプロイ環境の commit SHA）。VITE_APP_VERSION 未設定時に使用する。
declare const __APP_VERSION_FALLBACK__: string
