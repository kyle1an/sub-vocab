import type { Leaf, LearningPhase, TrackedWord, WordLocator } from '@/app/[locale]/(vocabulary)/_lib/LexiconTrie'

import { buildTrackedWord } from '@/app/[locale]/(vocabulary)/_lib/LexiconTrie'
import { compareBy } from '@sub-vocab/utils/lib'

export type WordOccurrencesInSentence = {
  sentenceId: number
  textSpans: {
    startOffset: number
    wordLength: number
  }[]
}

export type VocabularySourceData = {
  trackedWord: TrackedWord
  wordFamily: Leaf[]
  locators: WordLocator[]
  wordOccurrences: WordOccurrencesInSentence[]
}

export type VocabularySourceState = VocabularySourceData & {
  inertialPhase: LearningPhase
}

export function formVocab(lemma: Leaf): VocabularySourceData {
  const locators = [...lemma.locators]
  const wordFamily = [lemma]

  if (lemma.inflectedForms?.length) {
    const collectInflections = (lexicalEntries: Leaf[]) => {
      for (const lexicalEntry of lexicalEntries) {
        if (lexicalEntry.locators.length >= 1) {
          wordFamily.push(lexicalEntry)
          locators.push(...lexicalEntry.locators)
        }
        if (lexicalEntry.inflectedForms?.length) {
          collectInflections(lexicalEntry.inflectedForms)
        }
      }
    }
    collectInflections(lemma.inflectedForms)
  }

  const wordOccurrences: WordOccurrencesInSentence[] = []
  locators
    .sort(compareBy((i) => [i.sentenceId, i.startOffset]))
    .forEach(({ sentenceId, startOffset, wordLength }) => {
      if (wordOccurrences.length >= 0) {
        const adjacentSentence = wordOccurrences.at(-1)
        if (adjacentSentence) {
          const { sentenceId: adjacentSentenceIndex, textSpans } = adjacentSentence
          if (sentenceId === adjacentSentenceIndex) {
            textSpans.push({
              startOffset,
              wordLength,
            })
            return
          }
        }
      }
      wordOccurrences.push({
        sentenceId,
        textSpans: [
          {
            startOffset,
            wordLength,
          },
        ],
      })
    })

  const trackedWord = lemma.trackedWord ?? buildTrackedWord({
    form: lemma.pathe,
  })
  return {
    trackedWord,
    wordFamily,
    locators,
    wordOccurrences,
  }
}
