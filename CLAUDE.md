# CLAUDE.md

<!-- BEGIN: rin-section (auto-synced to sub-repos by sync-rin-section.sh — do not edit downstream) -->
## アシスタント

このセッションのメインアシスタント（Keita と直接対話する相手、subagent ではない）の名前は **凜（りん）**。

- 自己紹介・名乗りでは「凜」と名乗る
- 「凜」「凜さん」「凜ちゃん」「りん」「rin」「RIN」「Rin」「林」など複数の呼び方に応答する
- subagent 一覧（ceo, pm, secretary, dev-logic, dev-chakai, marketing, designer）とは別レイヤー — 凜は subagent をオーケストレートしながら Keita と直接対話する相棒ポジション
- 口調や行動原則は `~/.claude/projects/-root-projects/memory/` の各 feedback メモリ参照
<!-- END: rin-section -->


This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

- **Frontend:** React 19 + Vite 8 + TypeScript 5.9 — entry `src/main.tsx`, active app `AppV3.tsx`
- **Backend:** Express 5.x monolith — `server/index.ts` (~2600 lines, port 3001)
- **Database:** Supabase (PostgreSQL with RLS) + localStorage for offline state
- **Mobile:** Capacitor 6.x wrapping the Vite bundle (iOS 14+, Android 8+)
- **AI:** Anthropic Claude API (`@anthropic-ai/sdk`) for roleplay, Fermi feedback, flashcard/problem generation
- **Payments:** Stripe (free/basic/standard/premium tiers)
- **CSS:** Custom design system only — no Tailwind, no shadcn

## Commands

```bash
# Type check (cheapest — run first)
node node_modules/.bin/tsc -b --noEmit

# Lint v3 files only (legacy v1 files have ~12 pre-existing errors, ignore them)
node node_modules/.bin/eslint src/AppV3.tsx src/screens/ src/components/ src/hooks/ src/icons/

# Development
npm run dev          # Vite dev server → http://localhost:5173
npm run server       # Express backend on port 3001

# Production build
npm run build        # tsc -b && vite build

# Run E2E tests (expect 53+ pass, 0 fail)
node node_modules/.bin/playwright test --project=chromium

# Database migrations
npm run db:migrate

# Start backend for curl testing
lsof -ti:3001 | xargs -r kill 2>/dev/null
nohup npm run server > /tmp/logic-server.log 2>&1 &
sleep 3 && curl -s http://localhost:3001/api/health

# Mobile sync (after build)
npm run cap:sync     # npm run build + npx cap sync
npm run cap:open:ios
npm run cap:open:android
```

## Architecture

### Navigation model

All screens are a discriminated union in `src/AppV3.tsx` ~line 33. Adding a screen requires:
1. Adding the variant to the `Screen` type
2. Creating `src/screens/NewScreen.tsx`
3. Adding the case in the screen-switch render in `AppV3.tsx`

The legacy v1 app (`App.tsx`) is only accessible via `?v=1` and should not be modified.

### Frontend structure

```
src/
  AppV3.tsx          # Root component: Screen union type, tab navigation, URL sync
  screens/           # One file per screen — flat, never nested directories
  components/        # Reusable pieces (AppShell.tsx = sidebar + tabbar layout)
  icons/index.tsx    # All SVG icons — use these, never emoji
  styles/            # CSS design system (see below)
  lessons/           # Static lesson content data (*.ts files)
  db/                # localStorage helpers (notebookDb, progressDb, roadmapDb)
  hooks/             # React custom hooks
  billing/           # Stripe checkout flows
  i18n.ts            # Translations — both `ja` and `en` blocks required for every key
  supabase.ts        # Supabase client
  progressStore.ts   # Lesson progress state
  roadmapStore.ts    # Roadmap node state
  stats.ts           # Streak + study time
  guestUser.ts       # Anonymous user handling
  admin.ts           # isAdmin() — enabled via ?admin=1
  theme.ts           # Theme loading/applying
```

### Backend (`server/index.ts`)

Single-file Express monolith with rate-limited AI endpoints. File-based fallbacks for placement rankings (`placement.json`) and bug reports (`reports.json`). Key endpoint groups:
- `/api/health` — health check
- `/api/placement/*` — placement test + leaderboard
- `/api/roleplay/*`, `/api/fermi/*`, `/api/flashcards/*`, `/api/generate-problems` — Anthropic API (rate-limited)
- `/api/checkout`, `/api/webhook` — Stripe
- `/api/report-problem`, `/api/feedback` — user reports

**Never call mutating endpoints in tests**: `/api/checkout`, `/api/placement/submit`, `/api/placement/delete`, `/api/daily-problem`.

### CSS design system

The cascade order in `src/index.css` is fixed: `tokens.css` → `primitives.css` → `layout.css` → `extensions.css`.

Key tokens:
- Brand: `var(--brand)` = `#3D5FC4`, `var(--brand-soft)` = `#EEF2FE`
- Spacing: `--s-1` (4px) … `--s-8` (64px)
- Radius: `--radius-sm/md/lg/full`
- Sidebar: `var(--sidebar-w)` = 240px
- **Do not use** `var(--accent)`, `var(--serif)`, or `var(--accent-dark)` — these do not exist
- **Do not hardcode hex colors** — use CSS vars

### localStorage keys

| Key | Type | Purpose |
|---|---|---|
| `logic-v3-preview` | `'0'` or absent | `'0'` forces v1; absent = v3 (default) |
| `logic-admin` | `'1'` or absent | admin mode (PM/簿記 content, `?admin=1`) |
| `logic-guest-user` | JSON | guest user object |
| `logic-placement` | JSON | placement test result + recommended lessons |
| `logic-progress` | JSON | per-lesson progress map |
| `logic-stats` | JSON | streak, totalSeconds, studyDates |
| `logic-daily-problem` | JSON | cached daily problem + completion |
| `logic-notebook` | JSON | notebook entries |
| `logic-dev-mode` | `'on'`/`'off'` | dev overlay |
| `logic-locale` | `'ja'`/`'en'` | UI language |
| `logic-notifications` | string | reminder time |

### Database schema

9 migrations in `supabase/migrations/`. Key tables: `profiles`, `progress`, `notebooks`, `roadmap_progress`, `subscriptions`, `placement_results`, `user_stats`, `generated_problems`, `reports`, `feedback`, `beta_codes`. All have RLS; users see only their own rows except `placement_results` (public read).

## Common gotchas

1. **Unused imports** — `@typescript-eslint/no-unused-vars` is strict and breaks the build
2. **`tokens.css` must be first** import in `index.css` — other CSS files depend on its variables
3. **`@sentry/react` and `@capacitor/*` are not installed** — `src/sentry.ts` and `src/notifications.ts` are stubs; do not add real imports
4. **i18n** — every new user-facing string needs both `ja` and `en` entries in `src/i18n.ts`
5. **Icons** — use SVG from `src/icons/index.tsx`, never emoji in UI
6. **Screen union** — forgetting to add a new screen variant to the union in `AppV3.tsx` causes TS errors

## Deployment

- **Render** (production): auto-deploys on push to `main` (`npm install --include=dev && npm run build` then `npm start`)
- **Vercel** (static frontend mirror): auto-deploys via GitHub Action
- **Manual production deploy**: use the `deploy-production.yml` workflow (requires confirmation input)
- **Android release**: `npm run android:release` bumps version + syncs Capacitor; then build AAB in Android Studio

Required environment variables are documented in `.env.example` and `render.yaml`.
