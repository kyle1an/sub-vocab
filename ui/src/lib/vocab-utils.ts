import { produce } from 'immer'

import type { InertialPhase, LabelDisplayTable } from '@/lib/vocab'

import type { VocabState } from './LabeledTire'

export function purgedRows<T extends LabelDisplayTable>() {
  return produce<T[]>((draft) => {
    draft.forEach((todo) => {
      todo.inertialPhase = todo.learningPhase
    })
  })
}

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
