import type { InertialPhase } from '@/lib/vocab'

import type { VocabState } from './LabeledTire'

export function statusRetainedList<T extends VocabState>(oldRows: (T & InertialPhase)[], newList: T[]) {
  const vocabLabel = new Map<string, T & InertialPhase>()
  const listDisplay = newList.map((sieve) => {
    const label: T & InertialPhase = {
      ...sieve,
      inertialPhase: sieve.learningPhase,
    }
    vocabLabel.set(sieve.word, label)
    return label
  })
  oldRows.forEach((row) => {
    const label = vocabLabel.get(row.word)
    if (label) {
      label.inertialPhase = row.inertialPhase
    }
  })

  return listDisplay
}
