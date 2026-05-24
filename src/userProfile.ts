const STORAGE_KEY = 'logic-user-profile'

/**
 * @deprecated 2026-05-24: AgeGroup は分析用途に不向き (年齢は時間経過で変動)。
 * birthYear (number) を主データに移行。後方互換のため型は残してある。
 */
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
  /**
   * 生まれ年 (西暦, 4桁)。範囲: 1900 〜 現在年。
   * 分析・コホート集計は基本この値を使う。
   */
  birthYear?: number
  /**
   * @deprecated 旧オンボーディングの年代範囲。birthYear がない場合の fallback。
   */
  age?: AgeGroup
  gender?: Gender
  occupation?: Occupation
  /**
   * Logic を使う目的 (自由記述)。プロフィール編集で更新可能。
   */
  goal?: string
  completedAt?: string
}

export const MIN_BIRTH_YEAR = 1900

export function getCurrentYear(): number {
  return new Date().getFullYear()
}

/**
 * 入力値を生まれ年として妥当か検証 (1900〜現在年の整数)。
 */
export function isValidBirthYear(value: unknown): value is number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return false
  if (!Number.isInteger(value)) return false
  return value >= MIN_BIRTH_YEAR && value <= getCurrentYear()
}

/**
 * 旧 AgeGroup を生まれ年に逆算 (各レンジの中央値で代表)。
 * migration 030 と同じロジック。
 */
export function ageGroupToBirthYear(age: AgeGroup, currentYear: number = getCurrentYear()): number {
  const offset: Record<AgeGroup, number> = {
    teens: 16,
    '20s': 25,
    '30s': 35,
    '40s': 45,
    '50plus': 55,
  }
  return currentYear - offset[age]
}

export function loadUserProfile(): UserProfile {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') as UserProfile
    // 後方互換: 旧 age があって birthYear が無い場合はメモリ側だけ補完
    if (raw.age && raw.birthYear == null) {
      return { ...raw, birthYear: ageGroupToBirthYear(raw.age) }
    }
    return raw
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

  // 認証済みなら occupation を Supabase profiles.occupation にも同期。
  // ローカル fallback を優先したいので失敗しても UX には影響させない。
  if (Object.prototype.hasOwnProperty.call(patch, 'occupation')) {
    void syncOccupationToServer(patch.occupation ?? null)
  }
  // birth_year / goal / gender / nickname もまとめて同期 (それぞれが含まれる時のみ)
  if (
    Object.prototype.hasOwnProperty.call(patch, 'birthYear') ||
    Object.prototype.hasOwnProperty.call(patch, 'goal') ||
    Object.prototype.hasOwnProperty.call(patch, 'gender') ||
    Object.prototype.hasOwnProperty.call(patch, 'displayName')
  ) {
    void syncProfileFieldsToServer({
      birth_year: Object.prototype.hasOwnProperty.call(patch, 'birthYear') ? (patch.birthYear ?? null) : undefined,
      goal: Object.prototype.hasOwnProperty.call(patch, 'goal') ? (patch.goal ?? null) : undefined,
      nickname: Object.prototype.hasOwnProperty.call(patch, 'displayName') ? (patch.displayName ?? null) : undefined,
    })
  }
}

async function syncOccupationToServer(occupation: Occupation | null): Promise<void> {
  try {
    const mod = await import('./syncService')
    await mod.pushOccupation(occupation)
  } catch {
    /* sync layer unavailable */
  }
}

async function syncProfileFieldsToServer(fields: {
  birth_year?: number | null
  goal?: string | null
  nickname?: string | null
}): Promise<void> {
  try {
    const mod = await import('./syncService')
    if (typeof mod.pushProfileFields === 'function') {
      await mod.pushProfileFields(fields)
    }
  } catch {
    /* sync layer unavailable */
  }
}

export function hasCompletedAttributes(): boolean {
  const p = loadUserProfile()
  return Boolean(p.birthYear && p.gender && p.occupation)
}

/**
 * @deprecated 旧オンボーディングの表示ラベル。ProfileEditScreen は birthYear (number) を直接扱う。
 */
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
