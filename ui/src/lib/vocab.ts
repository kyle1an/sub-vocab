import {
  LEARNING_PHASE,
  type LearningPhase,
  type TrieWordLabel,
  type VocabState,
  type WordLocator,
} from '@/lib/LabeledTire.ts'

export type LabelDisplayTable = VocabState & InertialPhase & {
  wFamily: string[]
}

export type LabelSourceData = VocabState & {
  locations: WordLocator[]
  wFamily: string[]
}

export type LabelDisplaySource = LabelSourceData & InertialPhase

export type InertialPhase = {
  inertialPhase: LearningPhase
}

export function formVocab($: TrieWordLabel) {
  let src = [...$.src]
  const wFamily = $.wFamily ?? [$.path]

  if ($.derive?.length) {
    function collectNestedSource(derives: TrieWordLabel[]) {
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
    }

    collectNestedSource($.derive)
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
