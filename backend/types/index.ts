export interface Stems {
  derived_word: string,
  stem_word: string,
}

export interface Status {
  success: boolean
}

export interface UsernameTaken {
  has: boolean
}

export type LoginResponse = [boolean]
