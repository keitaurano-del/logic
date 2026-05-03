const STORAGE_KEY = 'logic-user-profile'

export type AgeGroup = 'teens' | '20s' | '30s' | '40s' | '50plus'
export type Gender = 'male' | 'female' | 'other' | 'na'
export type Occupation =
  | 'executive'
  | 'consultant'
  | 'strategy'
  | 'sales_marketing'
  | 'engineering'
  | 'admin'
  | 'professional'
  | 'student'
  | 'other'

export interface UserProfile {
  displayName?: string
  age?: AgeGroup
  gender?: Gender
  occupation?: Occupation
  completedAt?: string
}

export function loadUserProfile(): UserProfile {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') as UserProfile
  } catch {
    return {}
  }
}

export function saveUserProfile(patch: Partial<UserProfile>): void {
  try {
    const next: UserProfile = { ...loadUserProfile(), ...patch }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    /* localStorage unavailable */
  }
}

export function hasCompletedAttributes(): boolean {
  const p = loadUserProfile()
  return Boolean(p.age && p.gender && p.occupation)
}

export const AGE_LABELS: Record<AgeGroup, string> = {
  teens: '〜19歳',
  '20s': '20代',
  '30s': '30代',
  '40s': '40代',
  '50plus': '50歳以上',
}

export const GENDER_LABELS: Record<Gender, string> = {
  male: '男性',
  female: '女性',
  other: 'その他',
  na: '回答しない',
}

export const OCCUPATION_LABELS: Record<Occupation, string> = {
  executive: '経営・役員',
  consultant: 'コンサルタント',
  strategy: '企画・事業開発',
  sales_marketing: '営業・マーケティング',
  engineering: 'エンジニア・IT',
  admin: '管理部門（人事・経理・法務）',
  professional: '専門職（医療・教育・士業）',
  student: '学生',
  other: 'その他',
}
