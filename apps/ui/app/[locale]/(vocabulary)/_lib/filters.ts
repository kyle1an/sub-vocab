import type { VocabularySourceState } from '@/app/[locale]/(vocabulary)/_lib/vocab'
import type { ColumnFilterFn } from '@/lib/table-utils'

import { tryGetRegex } from '@sub-vocab/utils/lib'

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
