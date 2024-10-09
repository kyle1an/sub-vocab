import type { InertialPhase, LabelData } from '@/lib/vocab'

export function statusRetainedList<T extends LabelData>(oldRows: (T & InertialPhase)[], newList: T[]) {
  const vocabLabel = new Map<string, T & InertialPhase>()
  const listDisplay = newList.map((sieve) => {
    const label: (typeof oldRows)[number] = {
      ...sieve,
      inertialPhase: sieve.vocab.learningPhase,
    }
    vocabLabel.set(sieve.vocab.word, label)
    return label
  })
  oldRows.forEach((row) => {
    const label = vocabLabel.get(row.vocab.word)
    if (label) {
      label.inertialPhase = row.inertialPhase
    }
  })

  return listDisplay
}
