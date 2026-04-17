#!/usr/bin/env python3
"""
Logic アプリ 新機能バックログを Jira に一括投入するスクリプト

使い方:
  JIRA_URL=https://yoursite.atlassian.net \
  JIRA_EMAIL=keita.urano@gmail.com \
  JIRA_API_TOKEN=your_token \
  JIRA_PROJECT_KEY=SCRUM \
  python3 scripts/jira_new_backlog.py

Jira API Token の取得: https://id.atlassian.com/manage-profile/security/api-tokens
"""
import os, json, sys
import urllib.request, urllib.error
import base64

JIRA_URL = os.environ.get("JIRA_URL", "").rstrip("/")
JIRA_EMAIL = os.environ.get("JIRA_EMAIL", "keita.urano@gmail.com")
JIRA_API_TOKEN = os.environ.get("JIRA_API_TOKEN", "")
PROJECT_KEY = os.environ.get("JIRA_PROJECT_KEY", "SCRUM")

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
        print(f"  HTTP {e.code}: {err[:300]}")
        return None

def get_issue_types():
    """プロジェクトで使用できる Issue Type 一覧を取得"""
    result = jira_request("GET", f"/project/{PROJECT_KEY}")
    if result:
        return result
    return None

def create_epic(summary, description):
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
    # Epic が使えない場合は Story として作成
    data["fields"]["issuetype"] = {"name": "Story"}
    result = jira_request("POST", "/issue", data)
    if result:
        print(f"  ✅ Story (Epic代替) 作成: {result['key']} — {summary}")
        return result["key"]
    print(f"  ❌ 作成失敗: {summary}")
    return None

def create_story(summary, description, epic_key, priority="Medium", labels=None):
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

    result = jira_request("POST", "/issue", {"fields": fields})
    if result:
        print(f"    ✅ Story 作成: {result['key']} — {summary}")
        return result["key"]
    # Story が使えない場合は Task として作成
    fields["issuetype"] = {"name": "Task"}
    result = jira_request("POST", "/issue", {"fields": fields})
    if result:
        print(f"    ✅ Task (Story代替) 作成: {result['key']} — {summary}")
        return result["key"]
    print(f"    ❌ 作成失敗: {summary}")
    return None

# ==============================
# 新機能バックログ定義
# ==============================
NEW_FEATURES = [
    {
        "epic_summary": "[Feature] デイリーFermi問題 — 毎日異なるAI生成問題 + 履歴管理",
        "epic_description": (
            "TODAY'S CHALLENGE · FERMI · 5 MIN カードの問題を毎日異なるFermi推定問題に変更する。"
            "問題はサーバーサイドでAI生成し、Supabaseの daily_fermi_problems テーブルで管理。"
            "同じ日は全ユーザーが同じ問題を解く。"
        ),
        "stories": [
            (
                "Supabase: daily_fermi_problems テーブル作成",
                "date(YYYY-MM-DD), question, hint, locale を持つテーブル。dateはUNIQUE制約。RLSでSELECTは全員許可、INSERT/UPDATEはservice_roleのみ。",
                "High", ["backend", "infra"]
            ),
            (
                "サーバー: /api/daily-fermi エンドポイント実装",
                "当日の問題がSupabaseに存在すれば返す。なければAIで生成しSupabaseに保存してから返す。locale(ja/en)対応。",
                "High", ["backend"]
            ),
            (
                "フロント: DailyFermiScreen.tsx 作成",
                "今日のFermi問題を表示→ユーザーが推定値を入力→AI採点→スコア+フィードバック+正解表示。デザインシステム準拠(CSS vars, SVGアイコン, i18n)。",
                "High", ["frontend"]
            ),
            (
                "AppV3: daily-fermi Screenをルーティングに追加",
                "Screen union に { type: 'daily-fermi' } 追加。HomeScreenのFERMIカードから遷移するよう修正。",
                "High", ["frontend"]
            ),
            (
                "HomeScreen: FERMIカードのナビゲーション修正",
                "TODAY'S CHALLENGE · FERMI · 5 MIN カードタップで daily-fermi Screenへ遷移するよう変更。",
                "Medium", ["frontend"]
            ),
        ]
    },
    {
        "epic_summary": "[Feature] 誤り報告機能 — レッスン/クイズ画面に「誤りを報告する」ボタン追加",
        "epic_description": (
            "各レッスン・クイズ・フェルミ画面に「誤りを報告する」ボタンを追加。"
            "報告内容はSupabase reportsテーブルに保存 + 報告者にメール通知 + Jiraチケット自動起票。"
        ),
        "stories": [
            (
                "LessonScreen: quiz ステップに「誤りを報告する」ボタン追加",
                "step.type === 'quiz' のとき画面下部に小さなリンク/ボタンを表示。タップで報告モーダルを開く。",
                "High", ["frontend"]
            ),
            (
                "AIProblemScreen: 各問題に「誤りを報告する」ボタン追加",
                "AI生成問題画面の各質問にリポートボタンを追加。",
                "Medium", ["frontend"]
            ),
            (
                "DailyProblemScreen / DailyFermiScreen: 誤り報告ボタン追加",
                "今日の問題・今日のFermi画面にも誤り報告ボタンを追加。",
                "Medium", ["frontend"]
            ),
            (
                "FermiScreen: 誤り報告ボタン追加",
                "フェルミ推定練習画面の問題表示部分に誤り報告ボタンを追加。",
                "Medium", ["frontend"]
            ),
            (
                "サーバー: /api/report-problem エンドポイント刷新 — Supabase保存 + メール通知 + Jiraチケット起票",
                "1) Supabase reports テーブルに保存 2) nodemailerでkeita.urano2@gmail.comに通知メール送信 3) Jira REST APIでBugチケット自動起票。env: SMTP_HOST/PORT/USER/PASS, JIRA_URL/EMAIL/API_TOKEN/PROJECT_KEY",
                "High", ["backend"]
            ),
            (
                "ReportProblemModal: 報告後「メールでご連絡します」メッセージ表示",
                "報告送信後、送信者向けに確認メッセージを表示する。",
                "Low", ["frontend"]
            ),
        ]
    },
    {
        "epic_summary": "[Feature] 料金プラン改定 — スタンダード/プレミアム2段階 + オンボーディング",
        "epic_description": (
            "無料プランを廃止し、スタンダード(500円/3500円)とプレミアム(980円/6980円)の2プランに変更。"
            "初回インストール時にカード登録を伴うオンボーディングフローを追加。"
            "管理者がユーザーにプレミアムを無料付与できる機能も追加。"
        ),
        "stories": [
            (
                "Supabase: admin_overrides テーブル作成 + RLS設定",
                "user_id, plan('premium'), granted_by, note カラム。管理者がプレミアムを無料付与するためのテーブル。",
                "High", ["backend", "infra"]
            ),
            (
                "subscription.ts: 新プランタイプ追加 (standard_monthly/yearly, premium_monthly/yearly)",
                "SubscriptionPlan型を拡張。isPremiumPlan(), isStandardPlan(), getAIGenerationLimit()関数追加。admin_overrides テーブルチェックを getPremiumStatus() に組み込む。",
                "High", ["frontend", "backend"]
            ),
            (
                "PricingScreen: スタンダード/プレミアムの2プラン表示に変更",
                "無料プランカード削除。スタンダード(¥500/月, ¥3,500/年)、プレミアム(¥980/月, ¥6,980/年)を表示。プレミアムに「おすすめ」バッジ。7日間トライアル後自動課金の注意書き追加。",
                "High", ["frontend"]
            ),
            (
                "サーバー: checkoutエンドポイントに新プランID対応 + trial: true サポート",
                "STRIPE_PRICE_STANDARD_MONTHLY/YEARLY, STRIPE_PRICE_PREMIUM_MONTHLY/YEARLY env追加。trial: trueパラメータでsubscription_data.trial_period_days: 7を設定。",
                "High", ["backend", "infra"]
            ),
            (
                "Stripe: スタンダード/プレミアム Product/Price ID 作成",
                "Stripeダッシュボードでスタンダード月額¥500・年額¥3500、プレミアム月額¥980・年額¥6980のPrice IDを作成し、Render/Vercel envに設定。",
                "High", ["infra"]
            ),
            (
                "OnboardingScreen: 初回インストール時のカード登録フロー",
                "localStorage['logic-onboarded']未設定時に表示。ステップ: 1.ウェルカム 2.ゴール選択 3.トライアル説明 4.Stripeカード登録へリダイレクト。完了後logic-onboarded='1'をセット。",
                "High", ["frontend"]
            ),
            (
                "AppV3: onboarding Screenを追加、未オンボードの場合に初期表示",
                "Screen unionに { type: 'onboarding' } 追加。logic-onboardedが未設定の場合、HomeScreen代わりにOnboardingScreenを表示。",
                "High", ["frontend"]
            ),
            (
                "サーバー: POST /api/admin/grant-premium エンドポイント追加",
                "ADMIN_SECRETヘッダー認証。body: { userId, plan, note }。admin_overrides テーブルにupsert。管理者がユーザーにプレミアムを無料付与できる。",
                "Medium", ["backend"]
            ),
            (
                "AIGenScreen: スタンダードプランで月30問制限を表示・強制",
                "AI問題生成画面でスタンダードプランユーザーへの30問/月制限を表示。制限到達時にプレミアムへのアップグレード促進。",
                "Medium", ["frontend", "backend"]
            ),
        ]
    },
]

def main():
    print(f"🚀 Jira プロジェクト [{PROJECT_KEY}] に新機能バックログを投入します")
    print(f"   URL: {JIRA_URL}")
    print()

    # プロジェクト存在確認
    proj = jira_request("GET", f"/project/{PROJECT_KEY}")
    if not proj:
        print(f"❌ プロジェクト '{PROJECT_KEY}' が見つかりません。Jira で先に作成してください。")
        sys.exit(1)
    print(f"✅ プロジェクト確認: {proj.get('name', PROJECT_KEY)}")
    print()

    total = 0
    for feature in NEW_FEATURES:
        print(f"📋 {feature['epic_summary']}")
        epic_key = create_epic(feature["epic_summary"], feature["epic_description"])
        if not epic_key:
            continue
        for story_data in feature["stories"]:
            summary, description, priority, labels = story_data
            create_story(summary, description, epic_key, priority, labels=labels)
            total += 1
        print()

    print(f"✅ 完了: {total} Stories/Tasks を作成しました")
    print()
    print("次のステップ:")
    print("  1. Jira ボードで Sprint を作成し Stories を割り当て")
    print("  2. Stripe ダッシュボードで新プランの Price ID を作成")
    print("  3. Render/Vercel に新しい env vars を追加:")
    print("     STRIPE_PRICE_STANDARD_MONTHLY, STRIPE_PRICE_STANDARD_YEARLY")
    print("     STRIPE_PRICE_PREMIUM_MONTHLY, STRIPE_PRICE_PREMIUM_YEARLY")
    print("     SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS")
    print("     JIRA_URL, JIRA_EMAIL, JIRA_API_TOKEN, JIRA_PROJECT_KEY")
    print("     ADMIN_SECRET")

if __name__ == "__main__":
    main()
