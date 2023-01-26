export interface Stems {
  derived_word: string,
  stem_word: string,
}

export interface Status {
  success: boolean
  message?: string
}

export interface UsernameTaken {
  has: boolean
}

export type RegisterResponse = [{ result: number }]

export type LoginResponse = [boolean]
