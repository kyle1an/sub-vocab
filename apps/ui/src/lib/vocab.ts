import type { LearningPhase, TrieWordLabel, WordLocator, WordState } from '@/lib/LabeledTire.ts'

import {
  LEARNING_PHASE,
} from '@/lib/LabeledTire.ts'

export type VocabularyCoreState = {
  lemmaState: WordState
  wFamily: TrieWordLabel[]
  locators: WordLocator[]
}

export type VocabularySourceState = VocabularyCoreState & {
  inertialPhase: LearningPhase
}

export function formVocab(lemma: TrieWordLabel) {
  let locators = [...lemma.src]
  const wFamily = [lemma]

  if (lemma.derive?.length) {
    function collectNestedSource(lexicalEntries: TrieWordLabel[]) {
      for (const lexicalEntry of lexicalEntries) {
        if (lexicalEntry.src[0]) {
          wFamily.push(lexicalEntry)
          if (locators[0]) {
            locators = lexicalEntry.src[0].wordOrder < locators[0].wordOrder
              ? lexicalEntry.src.concat(locators)
              : locators.concat(lexicalEntry.src)
          }
          else {
            locators = lexicalEntry.src
          }
        }

        if (lexicalEntry.derive?.length)
          collectNestedSource(lexicalEntry.derive)
      }
    }

    collectNestedSource(lemma.derive)
  }

  const labelDisplaySource: VocabularyCoreState = {
    lemmaState: {
      word: lemma.path,
      learningPhase: LEARNING_PHASE.NEW,
      isUser: false,
      original: false,
      timeModified: null,
      rank: null,
      ...lemma.vocab,
    },
    wFamily,
    locators,
  }

  return labelDisplaySource
}
