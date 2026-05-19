import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { PhoneFrame } from './PhoneFrame'

type Props = {
  title: string
  subtitle?: string
  children: ReactNode
}

export function SamplePage({ title, subtitle, children }: Props) {
  return (
    <div className="page">
      <Link to="/" className="back-link">← 一覧に戻る</Link>
      <h1 className="page-title">{title}</h1>
      {subtitle && <div className="page-subtitle">{subtitle}</div>}
      <PhoneFrame>{children}</PhoneFrame>
    </div>
  )
}
