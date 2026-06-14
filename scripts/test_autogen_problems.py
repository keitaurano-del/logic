#!/usr/bin/env python3
"""autogen_problems.py の純粋ロジックの自作テスト（外部依存なし）。

gsk / Supabase の実呼び出しは行わない。構造チェック・最終承認判定・env解釈・
スコアパースなど、ネットワーク非依存の関数のみを検証する。

実行方法:
    python3 scripts/test_autogen_problems.py
    （pytest があれば pytest scripts/test_autogen_problems.py でも可）
"""

import importlib.util
import os
import unittest
from pathlib import Path

# 同ディレクトリの autogen_problems.py を import（ハイフン無しなので普通に import 可だが
# 実行ディレクトリに依存しないよう明示的にロードする）。
_MODULE_PATH = Path(__file__).resolve().parent / "autogen_problems.py"
_spec = importlib.util.spec_from_file_location("autogen_problems", _MODULE_PATH)
ag = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(ag)


def make_valid_problem(**overrides) -> dict:
    """構造的に妥当な問題を生成する。overrides で部分上書き。"""
    problem = {
        "question": "AならばB、BならばC が成り立つとき、必ず言えるのはどれか。",
        "choices": [
            {"label": "AならばC", "correct": True},
            {"label": "CならばA", "correct": False},
            {"label": "AでないならBでない", "correct": False},
            {"label": "BならばA", "correct": False},
        ],
        "explanation": "三段論法より A→B→C なので A→C が導ける。逆は一般に成立しない。",
        "tags": ["演繹", "三段論法"],
    }
    problem.update(overrides)
    return problem


class TestValidateProblemStructure(unittest.TestCase):
    def test_valid_problem_passes(self):
        ok, reasons = ag.validate_problem_structure(make_valid_problem())
        self.assertTrue(ok, reasons)
        self.assertEqual(reasons, [])

    def test_wrong_choice_count(self):
        p = make_valid_problem()
        p["choices"] = p["choices"][:3]  # 3つ
        ok, reasons = ag.validate_problem_structure(p)
        self.assertFalse(ok)
        self.assertTrue(any("選択肢が 4 個でない" in r for r in reasons))

    def test_empty_choice_label(self):
        p = make_valid_problem()
        p["choices"][1]["label"] = "   "
        ok, reasons = ag.validate_problem_structure(p)
        self.assertFalse(ok)
        self.assertTrue(any("label が空" in r for r in reasons))

    def test_duplicate_labels(self):
        p = make_valid_problem()
        p["choices"][1]["label"] = p["choices"][0]["label"]
        ok, reasons = ag.validate_problem_structure(p)
        self.assertFalse(ok)
        self.assertTrue(any("重複" in r for r in reasons))

    def test_no_correct(self):
        p = make_valid_problem()
        for c in p["choices"]:
            c["correct"] = False
        ok, reasons = ag.validate_problem_structure(p)
        self.assertFalse(ok)
        self.assertTrue(any("ちょうど1つでない" in r for r in reasons))

    def test_multiple_correct(self):
        p = make_valid_problem()
        p["choices"][2]["correct"] = True  # 2つ正解
        ok, reasons = ag.validate_problem_structure(p)
        self.assertFalse(ok)
        self.assertTrue(any("ちょうど1つでない" in r for r in reasons))

    def test_empty_question(self):
        ok, reasons = ag.validate_problem_structure(make_valid_problem(question=""))
        self.assertFalse(ok)
        self.assertTrue(any("question が空" in r for r in reasons))

    def test_question_too_long(self):
        ok, reasons = ag.validate_problem_structure(
            make_valid_problem(question="あ" * (ag.QUESTION_MAX_LEN + 1))
        )
        self.assertFalse(ok)
        self.assertTrue(any("question が" in r and "超過" in r for r in reasons))

    def test_question_at_limit_ok(self):
        ok, _ = ag.validate_problem_structure(
            make_valid_problem(question="あ" * ag.QUESTION_MAX_LEN)
        )
        self.assertTrue(ok)

    def test_empty_explanation(self):
        ok, reasons = ag.validate_problem_structure(make_valid_problem(explanation=""))
        self.assertFalse(ok)
        self.assertTrue(any("explanation が空" in r for r in reasons))

    def test_explanation_too_long(self):
        ok, reasons = ag.validate_problem_structure(
            make_valid_problem(explanation="あ" * (ag.EXPLANATION_MAX_LEN + 1))
        )
        self.assertFalse(ok)
        self.assertTrue(any("explanation が" in r and "超過" in r for r in reasons))

    def test_tags_not_list(self):
        ok, reasons = ag.validate_problem_structure(make_valid_problem(tags="演繹"))
        self.assertFalse(ok)
        self.assertTrue(any("tags が list でない" in r for r in reasons))

    def test_choices_not_list(self):
        ok, reasons = ag.validate_problem_structure(make_valid_problem(choices={}))
        self.assertFalse(ok)
        self.assertTrue(any("choices が list でない" in r for r in reasons))


class TestShouldAutoApprove(unittest.TestCase):
    def test_all_pass(self):
        p = make_valid_problem(_quality_score=0.9, _cross_score=0.85)
        ok, reasons = ag.should_auto_approve(p, require_cross=True)
        self.assertTrue(ok, reasons)
        self.assertEqual(reasons, [])

    def test_self_score_below_threshold(self):
        p = make_valid_problem(_quality_score=0.7, _cross_score=0.9)
        ok, reasons = ag.should_auto_approve(p, require_cross=True)
        self.assertFalse(ok)
        self.assertTrue(any("自己採点が閾値未満" in r for r in reasons))

    def test_cross_score_below_threshold_blocks(self):
        # 自己採点は高いがクロス評価が低い → フルーク抑止
        p = make_valid_problem(_quality_score=0.95, _cross_score=0.4)
        ok, reasons = ag.should_auto_approve(p, require_cross=True)
        self.assertFalse(ok)
        self.assertTrue(any("クロス評価が閾値未満" in r for r in reasons))

    def test_cross_ignored_when_not_required(self):
        p = make_valid_problem(_quality_score=0.95, _cross_score=0.4)
        ok, reasons = ag.should_auto_approve(p, require_cross=False)
        self.assertTrue(ok, reasons)

    def test_structure_failure_blocks_high_scores(self):
        # スコアが満点でも構造NGなら auto 承認しない（必須条件）
        p = make_valid_problem(_quality_score=1.0, _cross_score=1.0)
        p["choices"][2]["correct"] = True  # 一意正解違反
        ok, reasons = ag.should_auto_approve(p, require_cross=True)
        self.assertFalse(ok)
        self.assertTrue(any(r.startswith("構造:") for r in reasons))

    def test_structure_always_required_even_without_cross(self):
        p = make_valid_problem(_quality_score=1.0, _cross_score=1.0, tags="x")
        ok, reasons = ag.should_auto_approve(p, require_cross=False)
        self.assertFalse(ok)
        self.assertTrue(any(r.startswith("構造:") for r in reasons))

    def test_missing_scores_default_to_zero(self):
        # スコア未格納（評価失敗で格納されなかった等）は 0 扱いで承認しない
        ok, reasons = ag.should_auto_approve(make_valid_problem(), require_cross=True)
        self.assertFalse(ok)


class TestEnvFlag(unittest.TestCase):
    def setUp(self):
        self._key = "AUTOGEN_TEST_FLAG_XYZ"
        os.environ.pop(self._key, None)

    def tearDown(self):
        os.environ.pop(self._key, None)

    def test_unset_returns_default(self):
        self.assertTrue(ag._env_flag(self._key, True))
        self.assertFalse(ag._env_flag(self._key, False))

    def test_true_values(self):
        for v in ("1", "true", "TRUE", "Yes", "on"):
            os.environ[self._key] = v
            self.assertTrue(ag._env_flag(self._key, False), v)

    def test_false_values(self):
        for v in ("0", "false", "no", "off"):
            os.environ[self._key] = v
            self.assertFalse(ag._env_flag(self._key, True), v)

    def test_empty_string_falls_back_to_default(self):
        # 空文字は「未設定」と同等に default へフォールバック。
        os.environ[self._key] = ""
        self.assertTrue(ag._env_flag(self._key, True))
        self.assertFalse(ag._env_flag(self._key, False))


class TestParseScore(unittest.TestCase):
    def test_plain_number(self):
        self.assertAlmostEqual(ag._parse_score("0.85"), 0.85)

    def test_clamps_high(self):
        self.assertEqual(ag._parse_score("1.5"), 1.0)

    def test_clamps_low(self):
        self.assertEqual(ag._parse_score("-0.2"), 0.0)

    def test_takes_first_token(self):
        # クロス評価出力（1行目スコア + 2行目理由）の先頭を取る
        self.assertAlmostEqual(ag._parse_score("0.40\n正解が一意でない"), 0.40)

    def test_invalid_raises(self):
        with self.assertRaises((ValueError, IndexError)):
            ag._parse_score("not a number")


class TestRunEval(unittest.TestCase):
    """run_eval の分岐（env AUTOGEN_EVAL_CMD の有無）を、実コマンドを叩かず検証。"""

    def setUp(self):
        os.environ.pop("AUTOGEN_EVAL_CMD", None)

    def tearDown(self):
        os.environ.pop("AUTOGEN_EVAL_CMD", None)

    def test_falls_back_to_gsk_when_unset(self):
        called = {}

        def fake_run_gsk(prompt):
            called["prompt"] = prompt
            return "0.9"

        orig = ag.run_gsk
        ag.run_gsk = fake_run_gsk
        try:
            out = ag.run_eval("PROMPT")
        finally:
            ag.run_gsk = orig
        self.assertEqual(out, "0.9")
        self.assertEqual(called["prompt"], "PROMPT")

    def test_uses_eval_cmd_when_set(self):
        # echo を別モデルCLIに見立てて、prompt が末尾引数として渡ることを確認。
        os.environ["AUTOGEN_EVAL_CMD"] = "printf %s"
        out = ag.run_eval("0.77")
        self.assertEqual(out, "0.77")


if __name__ == "__main__":
    unittest.main(verbosity=2)
