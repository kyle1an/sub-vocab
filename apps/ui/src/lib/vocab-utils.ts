import type { VocabularySourceState } from '@/lib/vocab'

export const statusRetainedList = (newRows: VocabularySourceState[]) => (oldRows: VocabularySourceState[]) => {
  const newRowMap = new Map<string, VocabularySourceState>()

  for (const newRow of newRows) {
    for (const { pathe } of newRow.wordFamily) {
      newRowMap.set(pathe, newRow)
    }
  }

  for (const oldRow of oldRows) {
    for (const { pathe } of oldRow.wordFamily) {
      const newRow = newRowMap.get(pathe)
      if (newRow) {
        if (newRow.inertialPhase !== oldRow.inertialPhase) {
          newRow.inertialPhase = oldRow.inertialPhase
        }
        break
      }
    }
  }

  return newRows
}
