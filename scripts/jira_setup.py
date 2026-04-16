#!/usr/bin/env python3
"""
Logic アプリ開発計画を Jira に一括投入するスクリプト
使い方:
  JIRA_URL=https://yoursite.atlassian.net \
  JIRA_EMAIL=keita.urano@gmail.com \
  JIRA_API_TOKEN=your_token \
  JIRA_PROJECT_KEY=LOGIC \
  python3 jira_setup.py
"""
import os, json, sys
import urllib.request, urllib.error
import base64

JIRA_URL = os.environ.get("JIRA_URL", "").rstrip("/")
JIRA_EMAIL = os.environ.get("JIRA_EMAIL", "keita.urano@gmail.com")
JIRA_API_TOKEN = os.environ.get("JIRA_API_TOKEN", "")
PROJECT_KEY = os.environ.get("JIRA_PROJECT_KEY", "LOGIC")

if not JIRA_URL or not JIRA_API_TOKEN:
    print("ERROR: JIRA_URL と JIRA_API_TOKEN を環境変数に設定してください")
    print("  Jira API Token の取得: https://id.atlassian.com/manage-profile/security/api-tokens")
    sys.exit(1)

auth = base64.b64encode(f"{JIRA_EMAIL}:{JIRA_API_TOKEN}".encode()).decode()
HEADERS = {
    "Authorization": f"Basic {auth}",
    "Content-Type": "application/json",
    "Accept": "application/json",
}

def jira_request(method, path, data=None):
    url = f"{JIRA_URL}/rest/api/3{path}"
    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(url, data=body, headers=HEADERS, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        err = e.read().decode()
        print(f"  HTTP {e.code}: {err[:200]}")
        return None

def create_epic(summary, description, color="blue"):
    """Epic を作成して issue key を返す"""
    data = {
        "fields": {
            "project": {"key": PROJECT_KEY},
            "summary": summary,
            "description": {
                "type": "doc", "version": 1,
                "content": [{"type": "paragraph", "content": [{"type": "text", "text": description}]}]
            },
            "issuetype": {"name": "Epic"},
            "labels": ["logic-app"],
        }
    }
    result = jira_request("POST", "/issue", data)
    if result:
        print(f"  ✅ Epic 作成: {result['key']} — {summary}")
        return result["key"]
    print(f"  ❌ Epic 作成失敗: {summary}")
    return None

def create_story(summary, description, epic_key, priority="Medium", story_points=None, labels=None):
    """Story を作成して issue key を返す"""
    fields = {
        "project": {"key": PROJECT_KEY},
        "summary": summary,
        "description": {
            "type": "doc", "version": 1,
            "content": [{"type": "paragraph", "content": [{"type": "text", "text": description}]}]
        },
        "issuetype": {"name": "Story"},
        "priority": {"name": priority},
        "labels": labels or [],
    }
    if epic_key:
        fields["parent"] = {"key": epic_key}

    data = {"fields": fields}
    result = jira_request("POST", "/issue", data)
    if result:
        print(f"    ✅ Story 作成: {result['key']} — {summary}")
        return result["key"]
    print(f"    ❌ Story 作成失敗: {summary}")
    return None

# ==============================
# Epic & Story 定義
# ==============================
EPICS_AND_STORIES = [
    {
        "epic_summary": "[Phase 1] Supabase Auth 移行（Firebase 廃止）",
        "epic_description": "Firebase Auth を Supabase Auth に完全移行する。Email/Password + Google OAuth に対応。",
        "stories": [
            ("Supabase プロジェクト設定・env 変数追加", "Supabase プロジェクトを作成し、VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY を .env に追加する", "High", ["frontend", "infra"]),
            ("supabase.ts クライアントファイル作成", "firebase.ts の代替として supabase.ts を作成。Auth クライアントをエクスポートする", "High", ["frontend"]),
            ("Email/Password 認証を Supabase Auth に切り替え", "signupWithEmail / loginWithEmail を Supabase Auth の signUp/signInWithPassword に置き換え", "High", ["frontend"]),
            ("Google OAuth を Supabase Auth に切り替え", "loginWithGoogle を Supabase Auth の signInWithOAuth({provider: 'google'}) に置き換え。コールバックURL設定も含む", "High", ["frontend"]),
            ("LoginScreen を Supabase Auth ベースに更新", "LoginScreen.tsx の呼び出し元を firebase.ts → supabase.ts に変更", "High", ["frontend"]),
            ("onAuthChange → Supabase セッション管理に統合", "onAuthStateChanged を supabase.auth.onAuthStateChange に置き換え。App.tsx のセッション管理全体を更新", "High", ["frontend"]),
            ("Firebase 依存コードの完全削除", "firebase パッケージを package.json から削除。すべての import を確認", "Medium", ["frontend"]),
            ("Figma: LoginScreen デザインレビュー", "LoginScreen の Figma フレームを確認し、ブランドに合わせた UI 調整を行う", "Medium", ["design"]),
            ("テスト: Email/Google ログイン E2E", "Playwright で LoginScreen の Email + Google ログインフローをテストする", "High", ["testing"]),
        ]
    },
    {
        "epic_summary": "[Phase 2] Supabase DB データ永続化",
        "epic_description": "localStorage に保存していたユーザーデータ（進捗・ノート・ロードマップ等）を Supabase DB に移行する。",
        "stories": [
            ("Supabase テーブル設計・マイグレーション作成", "profiles, progress, notebooks, roadmap_progress, subscriptions テーブルを設計し SQL マイグレーションを作成する", "High", ["backend"]),
            ("RLS (Row Level Security) ポリシー設定", "全テーブルに対して認証済みユーザーのみ自分のデータを操作できるよう RLS を設定", "High", ["backend", "infra"]),
            ("progressStore → Supabase progress テーブルに移行", "src/progressStore.ts の読み書きを localStorage から Supabase に変更", "High", ["frontend", "backend"]),
            ("notebookStore → Supabase notebooks テーブルに移行", "src/notebookStore.ts を Supabase ベースに変更", "Medium", ["frontend", "backend"]),
            ("roadmapStore → Supabase roadmap_progress テーブルに移行", "src/roadmapStore.ts を Supabase ベースに変更", "Medium", ["frontend", "backend"]),
            ("placement/ranking を Supabase テーブルに移行", "server/index.ts の placement.json ファイルベース実装を Supabase placement_results テーブルに変更", "Medium", ["backend"]),
            ("report-problem を Supabase reports テーブルに移行", "reports.json ファイルベース実装を Supabase reports テーブルに変更", "Low", ["backend"]),
            ("オフライン→オンライン同期戦略の実装", "localStorage をキャッシュとして活用しつつ、オンライン時に Supabase と同期するロジックを実装", "Medium", ["frontend", "backend"]),
            ("Figma: Profile/Ranking 画面デザインレビュー", "ProfileScreen, RankingScreen の Figma フレームをレビューし、データ表示部分のUIを確認", "Low", ["design"]),
        ]
    },
    {
        "epic_summary": "[Phase 3] Stripe 本番有効化",
        "epic_description": "BETA_MODE を解除し Stripe Checkout + Webhook で課金フローを本番稼働させる。Supabase subscriptions テーブルで状態管理。",
        "stories": [
            ("Stripe Product/Price 作成（月額¥500・年額¥3500）", "Stripe ダッシュボードで Product と Price ID を作成し env に追加", "High", ["infra"]),
            ("Stripe Customer を Supabase user_id と紐付け", "checkout 時に stripe.customers.create で customer を作成し profiles.stripe_customer_id に保存", "High", ["backend"]),
            ("Webhook エンドポイント実装 /api/stripe/webhook", "server/index.ts に Stripe Webhook エンドポイントを追加。署名検証を実装", "High", ["backend"]),
            ("Webhook: subscription イベントで Supabase subscriptions 更新", "customer.subscription.created/updated/deleted を処理し subscriptions テーブルを更新", "High", ["backend"]),
            ("isPremium() を Supabase subscriptions から取得に変更", "subscription.ts の isPremium() を localStorage → Supabase DB への問い合わせに変更", "High", ["frontend", "backend"]),
            ("BETA_MODE = false に変更・プレミアム制限を再有効化", "subscription.ts の BETA_MODE フラグを false にし、プレミアム機能の制限を復活させる", "High", ["frontend"]),
            ("Pricing 画面 UI を Figma でレビュー・更新", "PricingScreen.tsx の Figma フレームをレビューし、課金プランの訴求を強化したデザインに更新", "High", ["design", "frontend"]),
            ("Stripe Customer Portal の有効化", "プラン変更・解約を顧客自身が行える Customer Portal を設定し、リンクをアプリに追加", "Medium", ["backend", "frontend"]),
            ("テスト: 決済フロー E2E (Stripe テストモード)", "Stripe テストカードで月額・年額のチェックアウト〜Webhook〜DB更新〜isPremium() の全フローをテスト", "High", ["testing"]),
            ("本番モード切り替えチェックリスト実施", "Stripe ライブモードのキー切り替え、Webhook URL更新、本番テストの実施", "High", ["infra"]),
        ]
    },
    {
        "epic_summary": "[Phase 4] CI/CD & デプロイ整備",
        "epic_description": "Vercel への Web デプロイ自動化と環境変数管理を整備する。Android CI/CD の最終確認も含む。",
        "stories": [
            ("Vercel プロジェクト設定 + env 変数投入", "Vercel に logic プロジェクトを作成し、Supabase/Stripe/Anthropic の env を登録", "High", ["infra"]),
            ("GitHub Actions: Vercel 自動デプロイ追加", ".github/workflows/ に vercel-deploy.yml を追加。main push で自動デプロイ", "High", ["infra"]),
            ("環境分離: .env.development / .env.production", "開発・本番で Supabase/Stripe のキーを分離できるよう .env ファイルを整理", "High", ["infra"]),
            ("Play Store Android CI/CD の最終確認", "既存の android-deploy.yml ワークフローの Run #3 以降の状態確認と必要な修正", "Medium", ["infra"]),
        ]
    },
]

def main():
    print(f"🚀 Jira プロジェクト [{PROJECT_KEY}] に開発計画を投入します")
    print(f"   URL: {JIRA_URL}")
    print()

    # プロジェクト存在確認
    proj = jira_request("GET", f"/project/{PROJECT_KEY}")
    if not proj:
        print(f"❌ プロジェクト '{PROJECT_KEY}' が見つかりません。Jira で先に作成してください。")
        sys.exit(1)
    print(f"✅ プロジェクト確認: {proj.get('name', PROJECT_KEY)}")
    print()

    results = []
    for phase in EPICS_AND_STORIES:
        print(f"📋 {phase['epic_summary']}")
        epic_key = create_epic(phase["epic_summary"], phase["epic_description"])
        if not epic_key:
            continue
        for story_data in phase["stories"]:
            summary, description, priority, labels = story_data
            story_key = create_story(summary, description, epic_key, priority, labels=labels)
            results.append({"epic": epic_key, "story": story_key, "summary": summary})
        print()

    print(f"✅ 完了: {len(results)} Stories を作成しました")
    print()
    print("次のステップ:")
    print("  1. Jira ボードで Sprint を作成し Phase 1 の Stories を割り当て")
    print("  2. Supabase Project URL + anon key を準備してコーディング開始")

if __name__ == "__main__":
    main()
