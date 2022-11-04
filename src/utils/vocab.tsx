import { reactive } from 'vue'
import { ElNotification } from 'element-plus'
import type { Label, Sieve, SourceRow } from '@/types'
import { t } from '@/i18n'
import router from '@/router'
import { useVocabStore } from '@/store/useVocab'
import { acquaint, batchAcquaint, revokeWord } from '@/api/vocab-service'
import { sortByChar } from '@/utils/utils'
import LabeledTire from '@/utils/LabeledTire'
import { useTimeStore } from '@/store/usePerf'

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

export async function acquaintAll(tableDataOfVocab: SourceRow[]) {
  const { user, updateWord } = $(useVocabStore())
  if (!user) {
    loginNotify()
    return
  }

  const rowsMap: Record<string, SourceRow> = {}
  const words: string[] = []
  tableDataOfVocab.forEach((row) => {
    if (!row.vocab.acquainted && row.vocab.w.length < 32) {
      const word = row.vocab.w.replace(/'/g, `''`)
      row.vocab.inUpdating = true
      rowsMap[word] = row
      words.push(word)
    }
  })
  const res = await batchAcquaint({ user, words }) as string
  if (res === 'success') {
    Object.values(rowsMap).forEach((row) => {
      updateWord(row.vocab, true)
      row.vocab.inUpdating = false
    })
  } else {
    Object.values(rowsMap).forEach((row) => {
      row.vocab.inUpdating = false
    })
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

export const generatedVocabTrie = (trie: LabeledTire, inputText: string) => {
  const { logTime, logEnd, logPerf } = useTimeStore()
  const { backTrie } = $(useVocabStore())
  logTime(['-- All took', '    '])
  logTime('· init words')
  trie.add(inputText)
  logEnd('· init words')
  logTime(['· categorize vocabulary', ' +  '])
  logTime('%c  merge vocabulary', 'color: gray; font-style: italic; padding: 1px')
  trie.mergedVocabulary()
  logEnd('%c  merge vocabulary')
  logTime('%c  formLabel vocabulary', 'color: gray; font-style: italic; padding: 0.5px')
  const list = formVocabList(trie.vocabulary)
  logEnd('%c  formLabel vocabulary')
  logEnd(['· categorize vocabulary', ' +  '])
  logEnd(['-- All took', '    '])
  logVocabInfo(list)
  logPerf()
  requestAnimationFrame(() => requestAnimationFrame(backTrie))
  return {
    list,
    count: trie.wordCount,
    sentences: trie.sentences,
  }
}

export function logVocabInfo(listOfVocab: SourceRow[]) {
  const untouchedVocabList = [...listOfVocab].sort((a, b) => sortByChar(a.vocab.w, b.vocab.w))
  console.log(`(${untouchedVocabList.length}) words`, { _: untouchedVocabList })
}
