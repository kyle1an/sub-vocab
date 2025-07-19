import type { VocabularyCoreState, VocabularySourceState } from '@/lib/vocab'

export function statusRetainedList(oldRows: VocabularySourceState[], newList: VocabularyCoreState[]) {
  const vocabLabel = new Map<string, VocabularySourceState>()
  const newRows = newList.map((item) => {
    const newRow = Object.assign(item, {
      inertialPhase: item.lemmaState.learningPhase,
    })
    for (const w of newRow.wFamily) {
      const path = w.path
      vocabLabel.set(path, newRow)
    }
    return newRow
  })
  oldRows.forEach((oldRow) => {
    for (const w of oldRow.wFamily) {
      const path = w.path
      const label = vocabLabel.get(path)
      if (label) {
        if (label.inertialPhase !== oldRow.inertialPhase) {
          label.inertialPhase = oldRow.inertialPhase
        }
        break
      }
    }
  })

  return newRows
}
