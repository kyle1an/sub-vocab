import { reactive } from 'vue'
import { ElNotification } from 'element-plus'
import type { LabelVocab, SrcRow, VocabInfoSieveDisplay, VocabInfoSubDisplay } from '@/types'
import { t } from '@/i18n'
import router from '@/router'
import { useVocabStore } from '@/store/useVocab'
import { acquaint, batchAcquaint, revokeWord } from '@/api/vocab-service'
import { sortByChar } from '@/utils/utils'
import LabeledTire from '@/utils/LabeledTire'
import { useTimeStore } from '@/store/usePerf'

function formVocab($: LabelVocab) {
  let src = [...$.src]
  const wFamily = $.wFamily ?? [$.w]

  if ($.derive?.length) {
    (function collectNestedSource(derives: LabelVocab[]) {
      for (const d$ of derives) {
        if (d$.src.length) {
          wFamily.push(d$.w)
          if (src.length) {
            src = d$.src[0][3] < src[0][3] ? d$.src.concat(src) : src.concat(d$.src)
          } else {
            src = d$.src
          }
        }

        if (d$.derive?.length) collectNestedSource(d$.derive)
      }
    })($.derive)
  }

  const vocab = $.vocab ?? {
    w: $.w,
    acquainted: false,
    is_user: 0,
    invalid: true,
    inUpdating: false,
  };
  (vocab as VocabInfoSubDisplay).wFamily = wFamily
  return {
    src,
    vocab: reactive(vocab) as VocabInfoSubDisplay
  }
}

export function formVocabList(vocabulary: Array<LabelVocab | null>) {
  const all: SrcRow<VocabInfoSubDisplay>[] = []

  for (const v of vocabulary) {
    if (!v || v.variant) continue

    all.push(formVocab(v))
  }

  return all
}

async function toggleWordState(row: VocabInfoSieveDisplay, name: string) {
  const store = useVocabStore()
  row.inUpdating = true
  const res = await (row.acquainted ? revokeWord : acquaint)({
    word: row.w.replace(/'/g, `''`),
    user: name,
  })

  if (res?.affectedRows) {
    store.updateWord(row, !row.acquainted)
  }

  row.inUpdating = false
}

export async function handleVocabToggle(row: VocabInfoSieveDisplay) {
  const store = useVocabStore()
  if (store.user) {
    await toggleWordState(row, store.user)
  } else {
    loginNotify()
  }
}

export async function acquaintAll(tableDataOfVocab: SrcRow<VocabInfoSieveDisplay>[]) {
  const store = useVocabStore()
  if (!store.user) {
    loginNotify()
    return
  }

  const rowsMap: Record<string, SrcRow<VocabInfoSieveDisplay>> = {}
  const words: string[] = []
  tableDataOfVocab.forEach((row) => {
    if (!row.vocab.acquainted && row.vocab.w.length < 32) {
      const word = row.vocab.w.replace(/'/g, `''`)
      row.vocab.inUpdating = true
      rowsMap[word] = row
      words.push(word)
    }
  })
  const res = await batchAcquaint({ user: store.user, words }) as string
  if (res === 'success') {
    Object.values(rowsMap).forEach((row) => {
      store.updateWord(row.vocab, true)
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
        {`${t('please')} `}
        <i
          class="cursor-pointer"
          onClick={() => router.push('/login')}
        >
          {t('login')}
        </i>
        {` ${t('to mark words')}`}
      </span>
    ),
    offset: 40,
  })
}

export const generatedVocabTrie = (inputText: string) => {
  const { logTime, logEnd, logPerf } = useTimeStore()
  const store = useVocabStore()
  logTime(['-- All took', '    '])
  logTime('· init words')
  const trie = new LabeledTire()
  trie.add(inputText)
  logEnd('· init words')
  logTime(['· categorize vocabulary', ' +  '])
  logTime('%c  merge vocabulary', 'color: gray; font-style: italic; padding: 1px')
  trie.mergedVocabulary(store.baseVocab)
    .shareMerge(store.irregularMaps)
  logEnd('%c  merge vocabulary')
  logTime('%c  formLabel vocabulary', 'color: gray; font-style: italic; padding: 0.5px')
  const list = formVocabList(trie.vocabulary)
  logEnd('%c  formLabel vocabulary')
  logEnd(['· categorize vocabulary', ' +  '])
  logEnd(['-- All took', '    '])
  logVocabInfo(list)
  logPerf()
  return {
    list,
    count: trie.wordCount,
    sentences: trie.sentences,
  }
}

export function logVocabInfo(listOfVocab: SrcRow<VocabInfoSieveDisplay>[]) {
  const untouchedVocabList = [...listOfVocab].sort((a, b) => sortByChar(a.vocab.w, b.vocab.w))
  console.log(`(${untouchedVocabList.length}) words`, { _: untouchedVocabList })
}
