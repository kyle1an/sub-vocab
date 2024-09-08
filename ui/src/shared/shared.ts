import type { ValueOf } from 'type-fest'

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
