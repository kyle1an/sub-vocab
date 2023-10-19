import { produce } from 'immer'
import type { VocabState } from './LabeledTire'
import type { InertialPhase, LabelDisplayTable } from '@/components/vocab'

export const purgedRows = <T extends LabelDisplayTable>() => produce<T[]>(
  (draft) => {
    draft.filter((todo) => todo.learningPhase !== todo.inertialPhase).forEach((todo) => {
      todo.inertialPhase = todo.learningPhase
    })
  },
)

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
