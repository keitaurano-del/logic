import { useEffect, useState } from 'react'
import { BrainIcon, SparklesIcon, LightbulbIcon, CheckCircleIcon } from '../icons'
import { t } from '../i18n'
import './ProblemGenLoader.css'

/**
 * AI 問題生成中の演出オーバーレイ
 *
 * 「生成中…」のシンプルテキストだと AI が一瞬で雑に作っとるように感じてしまうため、
 * - 4 ステップのフェードイン表示（テーマ分析 → 論点抽出 → 設問構築 → 最終チェック）
 * - 思考アイコンの rotate/pulse アニメーション
 * - 親しみある文言（i18n は中立的な丁寧体維持）
 * を組み合わせて「AI が一生懸命考えとる感」を出す。
 *
 * API レスポンス時間（2-10 秒）の体感的なズレを ステップ進行で吸収する設計。
 * 各ステップ 1.6 秒で進み、最後の step4 で待機する（API 完了で unmount される前提）。
 */

const STEP_KEYS = [
  'aiProblemGen.loader.step1',
  'aiProblemGen.loader.step2',
  'aiProblemGen.loader.step3',
  'aiProblemGen.loader.step4',
] as const

const STEP_ICONS = [SparklesIcon, BrainIcon, LightbulbIcon, CheckCircleIcon] as const

const STEP_INTERVAL_MS = 1600

export function ProblemGenLoader() {
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    // 各ステップ間隔で次に進む。最後のステップ到達後は止まる（API 完了で unmount される）
    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= STEP_KEYS.length - 1) {
          clearInterval(timer)
          return prev
        }
        return prev + 1
      })
    }, STEP_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [])

  // 進捗バーの目安: ステップ進行 + 最後は 90% で止めて完了待ちを示唆
  const progressPct = Math.min(90, ((currentStep + 1) / STEP_KEYS.length) * 90)

  return (
    <div
      className="problem-gen-loader__overlay"
      role="dialog"
      aria-live="polite"
      aria-busy="true"
      aria-label={t('aiProblemGen.loader.aria')}
    >
      <div className="problem-gen-loader__panel">
        {/* メインアイコン: 中央で rotate + pulse */}
        <div className="problem-gen-loader__hero">
          <div className="problem-gen-loader__hero-ring" aria-hidden="true" />
          <div className="problem-gen-loader__hero-icon" aria-hidden="true">
            <BrainIcon width={36} height={36} />
          </div>
          <span className="problem-gen-loader__hero-spark problem-gen-loader__hero-spark--1" aria-hidden="true">
            <SparklesIcon width={14} height={14} />
          </span>
          <span className="problem-gen-loader__hero-spark problem-gen-loader__hero-spark--2" aria-hidden="true">
            <SparklesIcon width={12} height={12} />
          </span>
          <span className="problem-gen-loader__hero-spark problem-gen-loader__hero-spark--3" aria-hidden="true">
            <SparklesIcon width={10} height={10} />
          </span>
        </div>

        {/* 見出し */}
        <div className="problem-gen-loader__title">{t('aiProblemGen.loader.title')}</div>
        <div className="problem-gen-loader__subtitle">{t('aiProblemGen.loader.subtitle')}</div>

        {/* ステップリスト */}
        <ul className="problem-gen-loader__steps">
          {STEP_KEYS.map((key, idx) => {
            const Icon = STEP_ICONS[idx]
            const isDone = idx < currentStep
            const isActive = idx === currentStep
            const isPending = idx > currentStep
            const stateClass = isDone
              ? 'problem-gen-loader__step--done'
              : isActive
                ? 'problem-gen-loader__step--active'
                : 'problem-gen-loader__step--pending'
            return (
              <li key={key} className={`problem-gen-loader__step ${stateClass}`}>
                <span className="problem-gen-loader__step-icon" aria-hidden="true">
                  {isDone ? (
                    <CheckCircleIcon width={16} height={16} />
                  ) : (
                    <Icon width={16} height={16} />
                  )}
                </span>
                <span className="problem-gen-loader__step-label">{t(key)}</span>
                {isActive && (
                  <span className="problem-gen-loader__step-dots" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </span>
                )}
                {isPending && <span className="problem-gen-loader__step-spacer" aria-hidden="true" />}
              </li>
            )
          })}
        </ul>

        {/* プログレスバー */}
        <div
          className="problem-gen-loader__progress"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progressPct)}
        >
          <div
            className="problem-gen-loader__progress-bar"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <div className="problem-gen-loader__hint">{t('aiProblemGen.loader.hint')}</div>
      </div>
    </div>
  )
}
