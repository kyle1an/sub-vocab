import type { InertialPhase, LabelData } from '@/lib/vocab'

export function statusRetainedList<T extends LabelData>(oldRows: (T & InertialPhase)[], newList: (T & Partial<InertialPhase>)[]) {
  type Row = typeof oldRows[number]
  const vocabLabel = new Map<string, Row>()
  newList.forEach((row) => {
    row.inertialPhase = row.vocab.learningPhase
    vocabLabel.set(row.vocab.word, row as Row)
  })
  oldRows.forEach((row) => {
    const label = vocabLabel.get(row.vocab.word)
    if (label && label.inertialPhase !== row.inertialPhase)
      label.inertialPhase = row.inertialPhase
  })

  return newList as Row[]
}
