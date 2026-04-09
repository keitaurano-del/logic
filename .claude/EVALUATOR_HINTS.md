# Logic Evaluator Hints (v3)

Project-specific test recipes for logic-evaluator. Read this BEFORE evaluating any sprint.

## Stack quick reference
- React 19 + Vite 8 + TypeScript 5.9
- Express 5.x server (`server/index.ts`, port 3001)
- Custom CSS — `src/styles/tokens.css` → `primitives.css` → `layout.css` → `extensions.css`
  - All imported via `src/index.css`
  - NO Tailwind, NO shadcn
- Flat `src/screens/` structure — `src/screens/FooScreen.tsx` (never `src/components/Foo/`)
- Icons — inline SVG in `src/icons/index.tsx` (no emoji in UI)
- State: Screen union in `src/AppV3.tsx` ~line 33
- Default app: `AppV3` (v1 `App.tsx` is legacy, accessible via `?v=1` only)
- i18n: `src/i18n.ts` `t('key.path')` — both `ja` and `en` blocks required
- Server data: `placement.json` `reports.json` (file-based, no DB)
- Build: `cd /workspaces/logic && npm run build` runs `tsc -b && vite build`

## Type check (cheapest, run first)

```bash
source /usr/local/share/nvm/nvm.sh
cd /workspaces/logic
node node_modules/.bin/tsc -b --noEmit 2>&1
```

Exit 0 = pass. Any other = fail with error output.

## Lint

```bash
source /usr/local/share/nvm/nvm.sh
cd /workspaces/logic && node node_modules/.bin/eslint src/ 2>&1
```

**Baseline:** Legacy v1 files (`src/App.tsx`, `src/Flashcards.tsx`, `src/GoalSelect.tsx`,
`src/MockExam.tsx`, `src/Notebook.tsx`, `src/Onboarding.tsx`, `src/Pricing.tsx`,
`src/Profile.tsx`, `src/ReportProblem.tsx`, `src/AIProblemGen.tsx`) have ~12 pre-existing errors
that are NOT the Generator's responsibility.

**Pass condition:** No NEW errors in v3 files (`src/AppV3.tsx`, `src/screens/**`, `src/components/**`,
`src/hooks/**`, `src/icons/**`, `src/styles/**`).

To lint only v3 files:
```bash
node node_modules/.bin/eslint src/AppV3.tsx src/screens/ src/components/ src/hooks/ src/icons/ 2>&1
```

## Build (slow, only if contract demands)

```bash
source /usr/local/share/nvm/nvm.sh
cd /workspaces/logic && npm run build 2>&1 | tail -30
```

Render auto-deploys on push to main, so build success = deploy success.

## E2E tests (Playwright)

```bash
source /usr/local/share/nvm/nvm.sh
cd /workspaces/logic && node node_modules/.bin/playwright test --project=chromium 2>&1 | tail -10
```

Test suite in `e2e/app.spec.ts` — 55 Chromium + 55 mobile tests.
Expected: 53+ pass, 0 fail (2 mobile-only tests skip on desktop and vice versa).

## Server endpoint testing (curl)

### Start dev server (background)

```bash
source /usr/local/share/nvm/nvm.sh
lsof -ti:3001 | xargs -r kill 2>/dev/null
cd /workspaces/logic && nohup npm run server > /tmp/logic-server.log 2>&1 &
sleep 3
curl -s http://localhost:3001/api/health
```

### Stop dev server (always do this when done)

```bash
lsof -ti:3001 | xargs -r kill 2>/dev/null
```

### Safe (read-only) endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/health` | GET | health check |
| `/api/placement/ranking?guestId=test` | GET | ranking, no mutation |
| `/api/reports` | GET | list reports (admin) |

### Expensive (AI) endpoints — call sparingly

| Endpoint | Method | Notes |
|---|---|---|
| `/api/roleplay/turn` | POST | Anthropic API call |
| `/api/roleplay/score` | POST | Anthropic API call |
| `/api/fermi/feedback` | POST | Anthropic API call |
| `/api/fermi/question` | POST | Anthropic API call |
| `/api/flashcards/generate` | POST | Anthropic API call |
| `/api/generate-problems` | POST | Anthropic API call |

### DO NOT CALL — mutating / billing endpoints

- `/api/checkout` (POST) — Stripe, creates real billing
- `/api/placement/submit` (POST) — writes placement.json
- `/api/placement/delete` (POST) — destructive
- `/api/report-problem` (POST) — writes reports.json
- `/api/daily-problem` (POST) — caches + Anthropic tokens

## Common file locations (v3)

| Concern | Path |
|---|---|
| Default entry | `src/main.tsx` — renders AppV3 by default |
| Screen union | `src/AppV3.tsx` ~line 33 |
| App shell (sidebar + tabbar) | `src/components/AppShell.tsx` |
| SVG icons | `src/icons/index.tsx` |
| CSS design tokens | `src/styles/tokens.css` |
| CSS primitives (button, card, input) | `src/styles/primitives.css` |
| CSS layout (sidebar, tabbar, main) | `src/styles/layout.css` |
| CSS screen extensions | `src/styles/extensions.css` |
| All CSS entry | `src/index.css` (imports all above) |
| Admin flag | `src/admin.ts` — `isAdmin()`, `?admin=1` |
| Guest user | `src/guestUser.ts` |
| Stats / streak | `src/stats.ts` |
| Placement test data | `src/placementTest.ts` |
| Progress store | `src/progressStore.ts` |
| Theme (load/apply) | `src/theme.ts` |
| i18n strings (ja) | `src/i18n.ts` |
| Server routes | `server/index.ts` |

## localStorage keys (v3)

| Key | Type | Purpose |
|---|---|---|
| `logic-v3-preview` | `'0'` \| absent | `'0'` = force v1; absent = v3 (default) |
| `logic-admin` | `'1'` \| absent | admin mode — shows PM/簿記 content |
| `logic-guest-user` | JSON | guest user object (id, nickname, etc.) |
| `logic-guest-id` | string | guest ID (legacy, see guestId.ts) |
| `logic-placement` | JSON | `{ deviation, correctCount, totalCount, completedAt, recommendedLessonIds }` |
| `logic-progress` | JSON | per-lesson progress map |
| `logic-stats` | JSON | streak, totalSeconds, studyDates, etc. |
| `logic-daily-problem` | JSON | cached daily problem + completion flag |
| `logic-notebook` | JSON | notebook entries array |
| `logic-dev-mode` | `'on'` \| `'off'` | dev overlay toggle |
| `logic-locale` | `'ja'` \| `'en'` | UI language |
| `logic-notifications` | string | reminder time |

## Admin mode

- Enable: `?admin=1` → stored in `localStorage['logic-admin'] = '1'`
- Disable: `?admin=0` → removes key
- Hides: PM入門 lessons (IDs 30-34), 仕訳ドリル screen, 精算表ドリル screen

## Screens (v3 Screen union)

```
home | lessons | profile | lesson(lessonId) | flashcards | fermi |
deviation | ranking | roleplay | roleplay-chat(situationId) | mock-exam |
journal-input | worksheet | daily-problem | ai-problem-gen |
ai-problem(problem) | feedback | placement-test | pricing
```

Note: `theme-settings` was removed. `journal-input` and `worksheet` are admin-only.

## CSS design system

- Brand color: `#3D5FC4` (`var(--brand)`)
- Soft brand: `#EEF2FE` (`var(--brand-soft)`)
- Spacing scale: `--s-1` (4px) through `--s-8` (64px)
- Sidebar width: `var(--sidebar-w)` (240px)
- Border radius: `var(--radius-sm/md/lg/full)`
- NO `var(--accent)` — use `var(--brand)` instead
- NO Editorial Journal tokens (`--serif`, `--accent-dark`, `.editorial-numeral`)

## Build-time gotchas (Render breakage history)

1. **Unused imports** — `@typescript-eslint/no-unused-vars` is strict; remove unused imports
2. **Missing CSS import** — `tokens.css` MUST be first import in `index.css`
3. **Missing @sentry/react / @capacitor/** — not installed; `src/sentry.ts` and `src/notifications.ts` are stubs
4. **Emoji in UI** — use SVG icons from `src/icons/index.tsx` only
5. **Wrong localStorage key** — check keys table above before reading/writing

## Typical eval flow for a UI sprint

```bash
# 1. Type check
source /usr/local/share/nvm/nvm.sh
cd /workspaces/logic
node node_modules/.bin/tsc -b --noEmit

# 2. Lint (v3 files only)
node node_modules/.bin/eslint src/AppV3.tsx src/screens/ src/components/ src/hooks/ src/icons/

# 3. Verify Screen union has new screen type
grep -n "type: 'new-screen'" src/AppV3.tsx

# 4. Verify new screen file exists
ls src/screens/NewScreen.tsx

# 5. Verify no emoji in new files
grep -P "[\x{1F300}-\x{1F9FF}]" src/screens/NewScreen.tsx

# 6. Verify CSS vars used (not hardcoded colors)
grep -n "#[0-9a-fA-F]\{3,6\}" src/screens/NewScreen.tsx  # should be empty

# 7. (If contract demands server) curl health
curl -s http://localhost:3001/api/health
```

## When in doubt
- Mark `[?]` instead of guessing
- Cite `file:line` for every failure
- Read EVALUATOR_HINTS.md again before reporting
