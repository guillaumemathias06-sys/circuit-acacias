export type Role = 'player' | 'admin' | 'referee'
export type Gender = 'M' | 'F'
export type CompetitionStatus = 'draft' | 'published' | 'open' | 'full' | 'finished' | 'cancelled'
export type RegistrationSource = 'tenup_csv' | 'moja_csv' | 'manual' | 'paste'
export type RegistrationStatus = 'registered' | 'confirmed' | 'withdrawn' | 'wo' | 'absent'
export type MastersStatus = 'none' | 'qualified' | 'substitute' | 'wildcard'

export interface Season {
  id: string
  name: string
  start_date: string
  end_date: string
  active: boolean
}

export interface Category {
  id: string
  name: string
  gender: string
  age_min?: number
  age_max?: number
  min_ranking?: string
  max_ranking?: string
  active: boolean
  sort_order: number
}

export interface PointsScale {
  id: string
  name: string
  competition_size: number
  active: boolean
  rows?: PointsScaleRow[]
}

export interface PointsScaleRow {
  id: string
  points_scale_id: string
  position_min: number
  position_max: number
  points: number
}

export interface User {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  birth_date?: string
  gender?: Gender
  fft_license_number?: string
  fft_ranking?: string
  fft_club?: string
  category_id?: string
  role: Role
  avatar_url?: string
  category?: Category
}

export interface Competition {
  id: string
  season_id: string
  name: string
  date: string
  start_time?: string
  end_time?: string
  category_id: string
  format: string
  max_players: number
  min_ranking?: string
  max_ranking?: string
  fft_approved: boolean
  tenup_url?: string
  moja_reference?: string
  referee_name?: string
  status: CompetitionStatus
  points_enabled: boolean
  points_scale_id?: string
  retained_results: number
  entry_fee?: number
  description?: string
  rules?: string
  category?: Category
  points_scale?: PointsScale
  registrations_count?: number
}

export interface Registration {
  id: string
  competition_id: string
  user_id?: string
  source: RegistrationSource
  status: RegistrationStatus
  imported_at: string
  raw_first_name?: string
  raw_last_name?: string
  raw_fft_license?: string
  raw_fft_ranking?: string
  raw_club?: string
  user?: User
  competition?: Competition
}

export interface Result {
  id: string
  competition_id: string
  user_id: string
  final_position: number
  points_awarded: number
  wo: boolean
  forfait: boolean
  notes?: string
  user?: User
  competition?: Competition
}

export interface Ranking {
  id: string
  season_id: string
  category_id: string
  user_id: string
  total_points: number
  retained_points: number
  competitions_played: number
  rank: number
  masters_status: MastersStatus
  updated_at: string
  user?: User
  category?: Category
}

export interface Masters {
  id: string
  season_id: string
  category_id: string
  date?: string
  max_players: number
  status: string
  published: boolean
  category?: Category
}

export interface CSVPlayer {
  first_name: string
  last_name: string
  email?: string
  phone?: string
  fft_license_number?: string
  fft_ranking?: string
  fft_club?: string
  category?: string
}
