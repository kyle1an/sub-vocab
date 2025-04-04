import type { ColumnFilterFn } from '@/lib/table-utils'
import type { LabelDisplayTable } from '@/lib/vocab'

import { tryGetRegex } from '@/lib/regex'

export function searchFilterValue<T extends LabelDisplayTable>(search: string, usingRegex: boolean): ColumnFilterFn<T> | undefined {
  if (usingRegex) {
    const newRegex = tryGetRegex(search)
    if (newRegex)
      return (row) => newRegex.test(row.vocab.word)
  }
  else {
    search = search.toLowerCase()
    return (row) => row.wFamily.some((word) => word.path.toLowerCase().includes(search))
  }
}
