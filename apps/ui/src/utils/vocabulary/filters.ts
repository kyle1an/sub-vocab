import type { ColumnFilterFn } from '@/lib/table-utils'
import type { VocabularySourceState } from '@/lib/vocab'

import { useLastTruthy } from '@/lib/hooks'
import { tryGetRegex } from '@/lib/regex'
import { noFilter } from '@/lib/table-utils'

export function searchFilterValue<T extends VocabularySourceState>(search: string, usingRegex: boolean): ColumnFilterFn<T> | undefined {
  if (usingRegex) {
    const newRegex = tryGetRegex(search)
    if (newRegex) {
      return (row) => newRegex.test(row.trackedWord.form)
    }
  } else {
    search = search.toLowerCase()
    return (row) => row.wordFamily.some((word) => word.pathe.toLowerCase().includes(search))
  }
}

export function useLastSearchFilterValue(search: string, usingRegex: boolean) {
  const lastTruthyRef = useLastTruthy(searchFilterValue(search, usingRegex))
  return lastTruthyRef ?? noFilter
}
