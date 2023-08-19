import { reactive } from 'vue'
import { ElNotification } from 'element-plus'
import type { SrcWith } from '@/types'
import { type VocabState } from '@/store/useVocab'
import { t } from '@/i18n'
import router from '@/router'
import { sortByChar } from '@/lib/utils'
import LabeledTire, { type TrieWordLabel } from '@/lib/LabeledTire'
import { useTimeStore } from '@/store/usePerf'

export interface LabelDisplayTable extends VocabState {
  wFamily: string[]
}

function formVocab($: TrieWordLabel) {
  let src = [...$.src]
  const wFamily = $.wFamily ?? [$.path]

  if ($.derive?.length) {
    ;(function collectNestedSource(derives: TrieWordLabel[]) {
      for (const d$ of derives) {
        if (d$.src.length) {
          wFamily.push(d$.path)
          if (src.length) {
            src = d$.src[0].wordOrder < src[0].wordOrder ? d$.src.concat(src) : src.concat(d$.src)
          } else {
            src = d$.src
          }
        }

        if (d$.derive?.length) {
          collectNestedSource(d$.derive)
        }
      }
    })($.derive)
  }

  const vocab: LabelDisplayTable = Object.assign($.vocab ?? {
    word: $.path,
    acquainted: false,
    is_user: false,
    inStore: false,
    updating: false,
    original: false,
    time_modified: null,
    rank: null,
  }, {
    wFamily,
  })

  return {
    src,
    vocab: reactive(vocab),
  }
}

export function loginNotify() {
  ElNotification({
    message: (
      <span class="text-[teal]">
        {`${t('please')} `}
        <i
          class="cursor-pointer"
          onClick={() => {
            router.push('/').catch(console.error)
          }}
        >
          {t('login')}
        </i>
        {` ${t('to mark words')}`}
      </span>
    ),
    offset: 40,
  })
}

export const generatedVocabTrie = (inputText: string, baseVocab: VocabState[], irregularMaps: string[][]) => {
  const { logTime, logEnd, logPerf } = useTimeStore()
  logTime(['-- All took', '    '])
  logTime('· init words')
  const trie = new LabeledTire()
  trie.add(inputText)
  logEnd('· init words')
  logTime(['· categorize vocabulary', ' +  '])
  logTime('%c  merge vocabulary', 'color: gray; font-style: italic; padding: 1px')
  trie.mergedVocabulary(baseVocab)
    .mergeDerivedWordIntoStem(irregularMaps)
  logEnd('%c  merge vocabulary')
  logTime('%c  formLabel vocabulary', 'color: gray; font-style: italic; padding: 0.5px')
  const list = trie.vocabulary.filter(v => v && !v.variant).map(v => formVocab(v as TrieWordLabel))
  logEnd('%c  formLabel vocabulary')
  logEnd(['· categorize vocabulary', ' +  '])
  logEnd(['-- All took', '    '])
  if (import.meta.env.VITE_SUB_ENV === 'dev') {
    logVocabInfo(list)
    console.log('trie', trie)
  }
  logPerf()
  return {
    list,
    count: trie.wordCount,
    sentences: trie.sentences,
  }
}

export function logVocabInfo(listOfVocab: SrcWith<VocabState>[]) {
  const untouchedVocabList = [...listOfVocab].sort((a, b) => sortByChar(a.vocab.word, b.vocab.word))
  console.log(`(${untouchedVocabList.length}) words`, { _: untouchedVocabList })
}
