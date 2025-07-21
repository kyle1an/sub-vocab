import type { Leaf, LearningPhase, TrackedWord, WordLocator } from '@/lib/LabeledTire'

import { buildTrackedWord } from '@/lib/LabeledTire'

export type WordOccurrencesInSentence = {
  sentenceId: number
  textSpans: {
    startOffset: number
    wordLength: number
  }[]
}

export type VocabularySourceState = {
  trackedWord: TrackedWord
  wordFamily: Leaf[]
  locators: WordLocator[]
  wordOccurrences: WordOccurrencesInSentence[]
  inertialPhase: LearningPhase
}

export function formVocab(lemma: Leaf): VocabularySourceState {
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

  locators.sort((a, b) => a.wordOrder - b.wordOrder)
  const wordOccurrences: WordOccurrencesInSentence[] = []
  locators
    .sort((a, b) => a.sentenceId - b.sentenceId || a.startOffset - b.startOffset)
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
    inertialPhase: trackedWord.learningPhase,
  }
}
