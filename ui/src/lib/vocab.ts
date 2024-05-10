import type { SetOptional } from 'type-fest'
import { sortByChar } from '@/lib/utils.ts'
import {
  LEARNING_PHASE,
  LabeledTire,
  type LearningPhase,
  type TrieWordLabel,
  type VocabState,
  type WordLocator,
} from '@/lib/LabeledTire.ts'

export type LabelDisplayTable = VocabState & InertialPhase

export type LabelSourceData = VocabState & {
  locations: WordLocator[]
  wFamily: string[]
}

export type LabelDisplaySource = LabelSourceData & InertialPhase

export type InertialPhase = {
  inertialPhase: LearningPhase
}

function formVocab($: TrieWordLabel) {
  let src = [...$.src]
  const wFamily = $.wFamily ?? [$.path]

  if ($.derive?.length) {
    ;(function collectNestedSource(derives: TrieWordLabel[]) {
      for (const d$ of derives) {
        if (d$.src[0]) {
          wFamily.push(d$.path)
          if (src[0]) {
            src = d$.src[0].wordOrder < src[0].wordOrder ? d$.src.concat(src) : src.concat(d$.src)
          } else {
            src = d$.src
          }
        }

        if (d$.derive?.length) {
          collectNestedSource(d$.derive)
        }
      }
    }($.derive))
  }

  const vocab: VocabState = {
    word: $.path,
    learningPhase: LEARNING_PHASE.NEW,
    isUser: false,
    original: false,
    timeModified: null,
    rank: null,
    ...$.vocab,
  }

  const labelDisplaySource: LabelSourceData = {
    ...vocab,
    wFamily,
    locations: src,
  }

  return labelDisplaySource
}

function logVocabInfo<T extends VocabState>(listOfVocab: T[]) {
  const untouchedVocabList = [...listOfVocab].sort((a, b) => sortByChar(a.word, b.word))
  console.log(`(${untouchedVocabList.length}) words`, { _: untouchedVocabList })
}

export function generatedVocabTrie(inputText: string, baseVocab: VocabState[], irregularMaps: string[][]) {
  const trie = new LabeledTire()
  trie.add(inputText)
  trie.mergedVocabulary(baseVocab)
  trie.mergeDerivedWordIntoStem(irregularMaps)
  const list = trie.vocabulary.filter(Boolean).filter((v) => !v.variant).map(formVocab)

  if (import.meta.env.DEV) {
    logVocabInfo(list)
    console.log('trie', trie)
  }

  return {
    list,
    count: trie.wordCount,
    sentences: trie.sentences,
  }
}

function getDefaultVocabState() {
  return {
    isUser: true,
    original: true,
    timeModified: new Date().toISOString(),
    rank: null,
  } satisfies Partial<VocabState>
}

export function newVocabState(state: SetOptional<VocabState, keyof ReturnType<typeof getDefaultVocabState>>) {
  return {
    ...getDefaultVocabState(),
    ...state,
  } satisfies VocabState
}
