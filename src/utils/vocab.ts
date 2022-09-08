import { Sieve } from '@/types'

export function find(search: string) {
  return <T extends { vocab: Sieve }>(rows: T[]) => search ? rows.filter((r) => r.vocab.w.toLowerCase().includes(search.toLowerCase())) : rows
}
