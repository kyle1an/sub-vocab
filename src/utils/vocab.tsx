import { reactive } from 'vue'
import { ElNotification } from 'element-plus'
import type { Label, Sieve, SourceRow } from '@/types'
import { t } from '@/i18n'
import router from '@/router'
import { useVocabStore } from '@/store/useVocab'
import { acquaint, revokeWord } from '@/api/vocab-service'

export function find(search: string) {
  return <T extends { vocab: Sieve }>(rows: T[]) => search ? rows.filter((r) => r.vocab.w.toLowerCase().includes(search.toLowerCase())) : rows
}

export function collectNestedSource($: Label) {
  let src = [...$.src]

  if ($.derive?.length) {
    for (const d$ of $.derive) {
      const srcFromDerived = collectNestedSource(d$)

      if (src.length === 0) {
        src = srcFromDerived
      } else {
        if (srcFromDerived[0][3] < src[0][3]) {
          src = srcFromDerived.concat(src)
        } else {
          src = src.concat(srcFromDerived)
        }
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

async function toggleWordState(row: Sieve, name: string) {
  const { updateWord } = $(useVocabStore())
  row.inUpdating = true
  const res = await (row.acquainted ? revokeWord : acquaint)({
    word: row.w.replace(/'/g, `''`),
    user: name,
  })

  if (res.affectedRows) {
    updateWord(row, !row.acquainted)
  }

  row.inUpdating = false
}

export async function handleVocabToggle(row: Sieve) {
  const { user } = $(useVocabStore())
  if (user) {
    await toggleWordState(row, user)
  } else {
    loginNotify()
  }
}

export function loginNotify() {
  ElNotification({
    message: (
      <span class="text-[teal]">
        {t('please')}{' '}
        <i
          class="cursor-pointer"
          onClick={() => router.push('/login')}
        >
          {t('login')}
        </i>
        {' '}{t('to mark words')}
      </span>
    ),
    offset: 40,
  })
}
