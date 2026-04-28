#!/usr/bin/env python3
"""Logic アプリ 問題自動生成スクリプト

Usage:
    python3 autogen_problems.py --category ロジカルシンキング --difficulty intermediate --count 5

Environment variables:
    SUPABASE_URL         Supabase project URL  (e.g. https://xxxx.supabase.co)
    SUPABASE_SERVICE_KEY Supabase service-role key (bypasses RLS)

Requirements:
    pip install requests
    gsk CLI must be available in PATH
"""

import argparse
import json
import os
import subprocess
import sys
import uuid
from datetime import datetime, timezone

try:
    import requests
except ImportError:
    print("ERROR: 'requests' package not found. Run: pip install requests", file=sys.stderr)
    sys.exit(1)

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

VALID_CATEGORIES = [
    "ロジカルシンキング",
    "ケース面接",
    "クリティカルシンキング",
    "仮説思考",
]

VALID_DIFFICULTIES = ["beginner", "intermediate", "advanced"]
BATCH_SIZE = 10  # 1回のgsk呼び出しで生成する問題数の上限
AUTO_APPROVE_THRESHOLD = 0.8  # quality_score がこれ以上なら自動承認

# ---------------------------------------------------------------------------
# Prompts
# ---------------------------------------------------------------------------

GENERATION_PROMPT_TEMPLATE = """\
あなたは論理思考トレーニングアプリ「Logic」の問題作成AIです。
以下の仕様で問題を {count} 問作成してください。

カテゴリ: {category}
難易度: {difficulty}

## 出力形式（JSON配列、必ずこの形式のみ出力すること）
[
  {{
    "question": "問題文（200文字以内）",
    "choices": [
      {{"label": "選択肢A", "correct": false}},
      {{"label": "選択肢B", "correct": true}},
      {{"label": "選択肢C", "correct": false}},
      {{"label": "選択肢D", "correct": false}}
    ],
    "explanation": "解説（300文字以内）",
    "tags": ["タグ1", "タグ2"]
  }}
]

## 制約
- 正解は必ず1つ
- 選択肢は必ず4つ
- 問題は論理的推論を問うもの（単純な知識問題は不可）
- JSON以外の文字列を出力しないこと
"""

QUALITY_CHECK_PROMPT_TEMPLATE = """\
以下の問題の品質を0.0〜1.0のスコアで評価してください。

問題: {question}
選択肢: {choices}
解説: {explanation}

## 評価基準
- 論理的整合性（正解が明確か）: 0.4点
- 問題文の明確さ: 0.3点
- 解説の質（学習価値があるか）: 0.3点

## 出力形式（数値のみ、小数点2桁）
0.85
"""

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def run_gsk(prompt: str) -> str:
    """gsk CLI を呼び出してテキスト生成する。"""
    result = subprocess.run(
        ["gsk", "generate", "--prompt", prompt],
        capture_output=True,
        text=True,
        timeout=120,
    )
    if result.returncode != 0:
        raise RuntimeError(f"gsk generate failed:\n{result.stderr}")
    return result.stdout.strip()


def generate_problems(category: str, difficulty: str, count: int) -> list[dict]:
    """問題を count 問生成して返す。batchに分割して呼び出す。"""
    problems = []
    remaining = count
    while remaining > 0:
        batch = min(remaining, BATCH_SIZE)
        print(f"  → 生成中: {batch}問 (残り {remaining}問)", flush=True)
        prompt = GENERATION_PROMPT_TEMPLATE.format(
            count=batch,
            category=category,
            difficulty=difficulty,
        )
        raw = run_gsk(prompt)

        # JSON部分を抽出（gskが余計な文字列を出力した場合に対応）
        start = raw.find("[")
        end = raw.rfind("]") + 1
        if start == -1 or end == 0:
            print(f"  ⚠ JSONが見つかりません。スキップします。\nraw: {raw[:200]}", file=sys.stderr)
            remaining -= batch
            continue

        try:
            batch_problems = json.loads(raw[start:end])
        except json.JSONDecodeError as e:
            print(f"  ⚠ JSON解析エラー: {e}\nraw: {raw[:200]}", file=sys.stderr)
            remaining -= batch
            continue

        problems.extend(batch_problems)
        remaining -= batch

    return problems


def evaluate_quality(problem: dict) -> float:
    """LLM で問題品質を 0〜1 スコアで評価する。"""
    choices_text = "\n".join(
        f"  {'✓' if c['correct'] else '✗'} {c['label']}"
        for c in problem.get("choices", [])
    )
    prompt = QUALITY_CHECK_PROMPT_TEMPLATE.format(
        question=problem.get("question", ""),
        choices=choices_text,
        explanation=problem.get("explanation", ""),
    )
    try:
        raw = run_gsk(prompt).strip()
        # 数値だけ抽出
        score = float(raw.split()[0])
        return max(0.0, min(1.0, score))
    except (ValueError, IndexError, RuntimeError) as e:
        print(f"  ⚠ 品質評価失敗: {e}", file=sys.stderr)
        return 0.5  # デフォルトスコア（手動レビュー待ち）


def insert_to_supabase(
    problems: list[dict],
    category: str,
    difficulty: str,
    supabase_url: str,
    service_key: str,
) -> None:
    """Supabase REST API で generated_problems に INSERT する。"""
    url = f"{supabase_url}/rest/v1/generated_problems"
    headers = {
        "apikey": service_key,
        "Authorization": f"Bearer {service_key}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
    }

    rows = []
    for p in problems:
        quality_score = p.get("_quality_score", 0.5)
        rows.append(
            {
                "id": str(uuid.uuid4()),
                "category": category,
                "difficulty": difficulty,
                "question": p["question"],
                "choices": p["choices"],
                "explanation": p["explanation"],
                "generated_at": datetime.now(timezone.utc).isoformat(),
                "approved": quality_score >= AUTO_APPROVE_THRESHOLD,
                "approved_by": "auto" if quality_score >= AUTO_APPROVE_THRESHOLD else None,
                "quality_score": quality_score,
                "used_count": 0,
                "tags": p.get("tags", []),
            }
        )

    resp = requests.post(url, headers=headers, json=rows, timeout=30)
    if resp.status_code not in (200, 201):
        raise RuntimeError(
            f"Supabase INSERT failed: {resp.status_code}\n{resp.text}"
        )
    print(f"  ✓ {len(rows)}問を Supabase に保存しました。", flush=True)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Logic アプリ 問題自動生成スクリプト",
    )
    parser.add_argument(
        "--category",
        required=True,
        choices=VALID_CATEGORIES,
        help="問題カテゴリ",
    )
    parser.add_argument(
        "--difficulty",
        required=True,
        choices=VALID_DIFFICULTIES,
        help="難易度 (beginner / intermediate / advanced)",
    )
    parser.add_argument(
        "--count",
        type=int,
        default=5,
        help="生成する問題数 (デフォルト: 5)",
    )
    parser.add_argument(
        "--skip-quality-check",
        action="store_true",
        help="品質チェックをスキップする（速度優先のデバッグ用）",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="生成のみ行い、Supabase への保存はしない",
    )
    args = parser.parse_args()

    # 環境変数チェック
    supabase_url = os.environ.get("SUPABASE_URL", "").rstrip("/")
    service_key = os.environ.get("SUPABASE_SERVICE_KEY", "")
    if not args.dry_run:
        if not supabase_url:
            print("ERROR: SUPABASE_URL 環境変数が未設定です", file=sys.stderr)
            sys.exit(1)
        if not service_key:
            print("ERROR: SUPABASE_SERVICE_KEY 環境変数が未設定です", file=sys.stderr)
            sys.exit(1)

    print(f"\n🚀 Logic 問題自動生成")
    print(f"   カテゴリ: {args.category}")
    print(f"   難易度: {args.difficulty}")
    print(f"   生成数: {args.count}問")
    print(f"   dry-run: {args.dry_run}\n")

    # 1. 問題生成
    print("📝 Step 1: 問題を生成しています...")
    problems = generate_problems(args.category, args.difficulty, args.count)
    print(f"   生成完了: {len(problems)}問\n")

    if not problems:
        print("⚠ 問題が生成されませんでした。終了します。", file=sys.stderr)
        sys.exit(1)

    # 2. 品質チェック
    if not args.skip_quality_check:
        print("🔍 Step 2: 品質チェック中...")
        for i, p in enumerate(problems):
            score = evaluate_quality(p)
            p["_quality_score"] = score
            status = "✓ 自動承認" if score >= AUTO_APPROVE_THRESHOLD else "⏳ 手動レビュー待ち"
            print(f"   [{i+1}/{len(problems)}] score={score:.2f} → {status}")
        print()
    else:
        print("⚠ 品質チェックをスキップします（全問 score=0.5 で手動レビュー待ち）\n")
        for p in problems:
            p["_quality_score"] = 0.5

    auto_approved = sum(1 for p in problems if p.get("_quality_score", 0) >= AUTO_APPROVE_THRESHOLD)
    pending = len(problems) - auto_approved
    print(f"   自動承認: {auto_approved}問 / 手動レビュー待ち: {pending}問\n")

    # 3. Supabase に保存
    if args.dry_run:
        print("🔍 dry-run モード: Supabase への保存はスキップします")
        print(json.dumps(problems, ensure_ascii=False, indent=2))
    else:
        print("💾 Step 3: Supabase に保存中...")
        insert_to_supabase(
            problems,
            category=args.category,
            difficulty=args.difficulty,
            supabase_url=supabase_url,
            service_key=service_key,
        )

    print("\n✅ 完了！")


if __name__ == "__main__":
    main()
