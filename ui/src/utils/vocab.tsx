import { reactive } from 'vue'
import { ElNotification } from 'element-plus'
import type { LabelSieveDisplay, LabelSubDisplay, LabelVocab, SrcRow } from '@/types'
import { t } from '@/i18n'
import router from '@/router'
import { useVocabStore } from '@/store/useVocab'
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
            src = d$.src[0].wordSequence < src[0].wordSequence ? d$.src.concat(src) : src.concat(d$.src)
          } else {
            src = d$.src
          }
        }

        if (d$.derive?.length) collectNestedSource(d$.derive)
      }
    })($.derive)
  }

  const vocab = Object.assign($.vocab ?? {
    w: $.w,
    acquainted: false,
    is_user: 0,
    inStore: false,
    inUpdating: false,
    original: false,
    time_modified: null,
    rank: null,
  }, {
    wFamily,
  })

  return {
    src,
    vocab: reactive(vocab)
  }
}

export function formVocabList(vocabulary: Array<LabelVocab | null>) {
  const all: SrcRow<LabelSubDisplay>[] = []

  for (const v of vocabulary) {
    if (!v || v.variant) continue

    all.push(formVocab(v))
  }

  return all
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
    .mergeDerivedWordIntoStem(store.irregularMaps)
  logEnd('%c  merge vocabulary')
  logTime('%c  formLabel vocabulary', 'color: gray; font-style: italic; padding: 0.5px')
  const list = formVocabList(trie.vocabulary)
  logEnd('%c  formLabel vocabulary')
  logEnd(['· categorize vocabulary', ' +  '])
  logEnd(['-- All took', '    '])
  if (import.meta.env.VITE_SUB_ENV === 'dev') {
    logVocabInfo(list)
  }
  logPerf()
  return {
    list,
    count: trie.wordCount,
    sentences: trie.sentences,
  }
}

export function logVocabInfo(listOfVocab: SrcRow<LabelSieveDisplay>[]) {
  const untouchedVocabList = [...listOfVocab].sort((a, b) => sortByChar(a.vocab.w, b.vocab.w))
  console.log(`(${untouchedVocabList.length}) words`, { _: untouchedVocabList })
}
