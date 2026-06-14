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
import shlex
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
AUTO_APPROVE_THRESHOLD = 0.8  # quality_score がこれ以上なら自動承認（据え置き）

# 構造（決定的・非LLM）チェックの上限値
QUESTION_MAX_LEN = 200      # question 文字数の上限
EXPLANATION_MAX_LEN = 300   # explanation 文字数の上限
EXPECTED_CHOICE_COUNT = 4   # 選択肢数（ちょうど）

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

# 独立クロス評価プロンプト（生成寄りの自己採点とは別観点のルーブリック）。
# 「正解の一意性」と「解説が根拠を示しているか」を重点的に検証する。
CROSS_CHECK_PROMPT_TEMPLATE = """\
あなたは論理思考問題の独立した検証者です。生成者とは別の立場で、
以下の問題を厳しく検証してください。甘い採点はせず、疑わしきは低く採点すること。

問題: {question}
選択肢: {choices}
解説: {explanation}

## 検証観点
- 正解は本当に「一意」に決まるか？ 正解とされた選択肢以外が正解になり得る曖昧さは無いか？
- 複数の選択肢が同時に正しい、または「どれも正しくない」状態になっていないか？
- 解説は正解の根拠をきちんと説明しているか（単なる言い換えや無関係でないか）？

一意でない・曖昧・解説が不十分なら低いスコア（0.5未満）を付けること。

## 出力形式
1行目に 0.0〜1.0 のスコア（小数点2桁、数値のみ）。
2行目以降に、一意でない／問題がある場合のみその理由を簡潔に書く（無ければ空行）。
"""

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _env_flag(name: str, default: bool) -> bool:
    """env をブール値として解釈する。未設定なら default。

    true 扱い: 1/true/yes/on  /  false 扱い: 0/false/no/off （大文字小文字無視）。
    """
    raw = os.environ.get(name)
    if raw is None or raw.strip() == "":
        return default
    return raw.strip().lower() in ("1", "true", "yes", "on")


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


def run_eval(prompt: str) -> str:
    """評価用のテキスト生成を行う。

    env `AUTOGEN_EVAL_CMD` が設定されていれば、そのコマンド（別モデルCLI 等）に
    prompt を末尾引数として渡して呼び出す。未設定なら既存の gsk を使う。
    将来「生成とは literally 別モデル」で独立評価できるようにするための拡張点。

    例: AUTOGEN_EVAL_CMD="other-llm generate --prompt"
        → ["other-llm", "generate", "--prompt", <prompt>] を実行。
    """
    eval_cmd = os.environ.get("AUTOGEN_EVAL_CMD", "").strip()
    if not eval_cmd:
        return run_gsk(prompt)

    cmd = shlex.split(eval_cmd) + [prompt]
    result = subprocess.run(
        cmd,
        capture_output=True,
        text=True,
        timeout=120,
    )
    if result.returncode != 0:
        raise RuntimeError(f"eval command failed ({eval_cmd}):\n{result.stderr}")
    return result.stdout.strip()


def validate_problem_structure(problem: dict) -> tuple[bool, list[str]]:
    """決定的（非LLM）な構造・一意正解チェック。

    LLM のスコアに関わらず、これを満たさない問題は auto 承認しない（手動レビュー行き）。
    返り値: (ok, reasons)  reasons は落ちた理由のリスト（ok=True なら空）。
    """
    reasons: list[str] = []

    # --- choices ---
    choices = problem.get("choices")
    if not isinstance(choices, list):
        reasons.append("choices が list でない")
        choices = []

    if isinstance(choices, list) and len(choices) != EXPECTED_CHOICE_COUNT:
        reasons.append(f"選択肢が {EXPECTED_CHOICE_COUNT} 個でない（実際: {len(choices)} 個）")

    labels: list[str] = []
    correct_count = 0
    for idx, c in enumerate(choices):
        if not isinstance(c, dict):
            reasons.append(f"選択肢[{idx}] が dict でない")
            continue
        label = c.get("label")
        if not isinstance(label, str) or not label.strip():
            reasons.append(f"選択肢[{idx}] の label が空")
        else:
            labels.append(label.strip())
        if c.get("correct") is True:
            correct_count += 1

    # 重複なし（空でない label のみ対象）
    if len(labels) != len(set(labels)):
        reasons.append("選択肢の label に重複がある")

    # 一意正解（correct=True がちょうど1つ）
    if correct_count != 1:
        reasons.append(f"correct=True がちょうど1つでない（実際: {correct_count} 個）")

    # --- question ---
    question = problem.get("question")
    if not isinstance(question, str) or not question.strip():
        reasons.append("question が空")
    elif len(question) > QUESTION_MAX_LEN:
        reasons.append(f"question が {QUESTION_MAX_LEN} 字超過（実際: {len(question)} 字）")

    # --- explanation ---
    explanation = problem.get("explanation")
    if not isinstance(explanation, str) or not explanation.strip():
        reasons.append("explanation が空")
    elif len(explanation) > EXPLANATION_MAX_LEN:
        reasons.append(f"explanation が {EXPLANATION_MAX_LEN} 字超過（実際: {len(explanation)} 字）")

    # --- tags ---
    if not isinstance(problem.get("tags"), list):
        reasons.append("tags が list でない")

    return (len(reasons) == 0, reasons)


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


def _format_choices(problem: dict) -> str:
    """評価プロンプト用に選択肢を整形する。"""
    lines = []
    for c in problem.get("choices", []):
        if not isinstance(c, dict):
            continue
        mark = "✓" if c.get("correct") is True else "✗"
        lines.append(f"  {mark} {c.get('label', '')}")
    return "\n".join(lines)


def _parse_score(raw: str) -> float:
    """評価出力の先頭トークンから 0〜1 のスコアを取り出す。"""
    score = float(raw.strip().split()[0])
    return max(0.0, min(1.0, score))


def evaluate_quality(problem: dict) -> float:
    """LLM で問題品質を 0〜1 スコアで評価する（生成寄りの自己採点）。"""
    prompt = QUALITY_CHECK_PROMPT_TEMPLATE.format(
        question=problem.get("question", ""),
        choices=_format_choices(problem),
        explanation=problem.get("explanation", ""),
    )
    try:
        return _parse_score(run_eval(prompt))
    except (ValueError, IndexError, RuntimeError) as e:
        print(f"  ⚠ 品質評価失敗: {e}", file=sys.stderr)
        return 0.5  # デフォルトスコア（手動レビュー待ち）


def cross_evaluate_quality(problem: dict) -> float:
    """独立クロス評価（別ルーブリック）で 0〜1 スコアを返す。

    正解の一意性・解説の妥当性を重点的に検証する別観点の採点。
    自己採点(evaluate_quality)のフルークを抑止するための二重チェック。
    """
    prompt = CROSS_CHECK_PROMPT_TEMPLATE.format(
        question=problem.get("question", ""),
        choices=_format_choices(problem),
        explanation=problem.get("explanation", ""),
    )
    try:
        return _parse_score(run_eval(prompt))
    except (ValueError, IndexError, RuntimeError) as e:
        print(f"  ⚠ クロス評価失敗: {e}", file=sys.stderr)
        return 0.5  # デフォルトスコア（手動レビュー待ち）


def should_auto_approve(
    problem: dict,
    require_cross: bool = True,
    threshold: float = AUTO_APPROVE_THRESHOLD,
) -> tuple[bool, list[str]]:
    """auto 承認の最終判定（純粋ロジック・外部依存なし）。

    判定: 構造OK and self_score>=TH and (not require_cross or cross_score>=TH)
    スコアは problem の `_quality_score` / `_cross_score` を参照する
    （評価呼び出しは呼び出し側で行い、ここに格納しておく）。

    返り値: (auto_approve, reasons)  reasons は承認しなかった理由のリスト。
    構造チェックは require_cross の値に関わらず常に必須。
    """
    reasons: list[str] = []

    ok, struct_reasons = validate_problem_structure(problem)
    if not ok:
        reasons.extend(f"構造: {r}" for r in struct_reasons)

    self_score = problem.get("_quality_score", 0.0)
    if self_score < threshold:
        reasons.append(f"自己採点が閾値未満（{self_score:.2f} < {threshold:.2f}）")

    if require_cross:
        cross_score = problem.get("_cross_score", 0.0)
        if cross_score < threshold:
            reasons.append(f"クロス評価が閾値未満（{cross_score:.2f} < {threshold:.2f}）")

    return (len(reasons) == 0, reasons)


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
        approved = bool(p.get("_auto_approved", False))
        rows.append(
            {
                "id": str(uuid.uuid4()),
                "category": category,
                "difficulty": difficulty,
                "question": p["question"],
                "choices": p["choices"],
                "explanation": p["explanation"],
                "generated_at": datetime.now(timezone.utc).isoformat(),
                "approved": approved,
                "approved_by": "auto" if approved else None,
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
    parser.add_argument(
        "--no-auto-approve",
        action="store_true",
        default=_env_flag("AUTOGEN_NO_AUTO_APPROVE", False),
        help=(
            "自動承認を完全に無効化し、全件を手動レビュー行きにする"
            "（env AUTOGEN_NO_AUTO_APPROVE でも指定可）"
        ),
    )
    args = parser.parse_args()

    # クロス評価（独立二重チェック）の要否。既定 true。
    require_cross = _env_flag("AUTOGEN_REQUIRE_CROSS", True)

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

    # 2. 品質チェック（構造チェック → 自己採点 → 独立クロス評価 → 最終判定）
    if args.no_auto_approve:
        print("🔒 Step 2: --no-auto-approve 指定: 全件を手動レビュー行きにします")
        print("   （構造チェック・スコアは参考のため算出しますが auto 承認はしません）\n")

    if not args.skip_quality_check:
        mode = "（クロス評価あり）" if require_cross else "（クロス評価なし）"
        print(f"🔍 Step 2: 品質チェック中 {mode} ...")
        for i, p in enumerate(problems):
            # 2a. 決定的な構造チェック（auto承認の必須条件）
            struct_ok, struct_reasons = validate_problem_structure(p)

            # 2b. 自己採点（生成寄り）
            p["_quality_score"] = evaluate_quality(p)

            # 2c. 独立クロス評価（別ルーブリック）。要否は require_cross。
            if require_cross:
                p["_cross_score"] = cross_evaluate_quality(p)
            else:
                p["_cross_score"] = p["_quality_score"]

            # 2d. 最終判定
            ok, reasons = should_auto_approve(
                p, require_cross=require_cross, threshold=AUTO_APPROVE_THRESHOLD
            )
            if args.no_auto_approve:
                ok = False
                reasons = ["--no-auto-approve 指定"]
            p["_auto_approved"] = ok

            self_s = p["_quality_score"]
            cross_s = p["_cross_score"]
            status = "✓ 自動承認" if ok else "⏳ 手動レビュー待ち"
            print(
                f"   [{i+1}/{len(problems)}] self={self_s:.2f} "
                f"cross={cross_s:.2f} struct={'OK' if struct_ok else 'NG'} → {status}"
            )
            if not ok and reasons:
                for r in reasons:
                    print(f"        - {r}")
        print()
    else:
        print("⚠ 品質チェックをスキップします（全問 手動レビュー待ち）\n")
        for p in problems:
            p["_quality_score"] = 0.5
            p["_cross_score"] = 0.5
            p["_auto_approved"] = False

    auto_approved = sum(1 for p in problems if p.get("_auto_approved", False))
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
