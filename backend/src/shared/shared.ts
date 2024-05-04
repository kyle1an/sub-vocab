import type { ValueOf } from 'type-fest'

export type RegisterResponse = [{ result: number }]

export interface UsernameTaken {
  has: boolean
}

export type LoginResponse = [boolean]

export type AcquaintWordsResponse = string

export type ToggleWordResponse = string

export type StemsMapping = string[][]

export interface LabelDB extends Record<string, unknown> {
  w: string
  acquainted: number | boolean
  is_user: Ownership
  original: number | boolean
  rank: number | null
  time_modified: string | null
}

export interface Status {
  success: boolean
  message?: string
}

type OWNERSHIP = {
  GRANTED: 0
  USER: 1
  ANON_USER: 2
}

export type Ownership = ValueOf<OWNERSHIP>
