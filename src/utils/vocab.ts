import { reactive } from 'vue'
import type { Label, Sieve, SourceRow } from '@/types'

export function find(search: string) {
  return <T extends { vocab: Sieve }>(rows: T[]) => search ? rows.filter((r) => r.vocab.w.toLowerCase().includes(search.toLowerCase())) : rows
}

export function collectNestedSource($: Label) {
  let src: number[][] = [...$.src]

  if ($.derive?.length) {
    for (const d$ of $.derive) {
      const srcFromDerived = collectNestedSource(d$)

      if (src.length === 0) {
        src = srcFromDerived
        continue
      }

      if (srcFromDerived[0][3] < src[0][3]) {
        src = srcFromDerived.concat(src)
      } else {
        src = src.concat(srcFromDerived)
      }
    }
  }

  return src
}

export function formVocabList(vocabulary: Array<Label | null>) {
  const all: SourceRow[] = []

  for (const v of vocabulary) {
    if (!v || v.variant) continue

    all.push({
      src: collectNestedSource(v),
      vocab: reactive(v.vocab ?? {
        w: v.w,
        acquainted: false,
        is_user: 0,
        invalid: true,
        inUpdating: false,
      })
    })
  }

  return all
}
