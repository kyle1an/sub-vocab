import { produce } from 'immer'
import { useState } from 'react'

import type { VocabularySourceData, VocabularySourceState } from '@/app/[locale]/(vocabulary)/_lib/vocab'

const preserveInertialPhase = (list: VocabularySourceState[]) => (oldRows: VocabularySourceState[]) => {
  const listItemMap = new Map<string, VocabularySourceState>()

  for (const listItem of list) {
    for (const { pathe } of listItem.wordFamily) {
      listItemMap.set(pathe, listItem)
    }
  }

  for (const oldRow of oldRows) {
    for (const { pathe } of oldRow.wordFamily) {
      const listItem = listItemMap.get(pathe)
      if (listItem) {
        if (listItem.inertialPhase !== oldRow.inertialPhase) {
          listItem.inertialPhase = oldRow.inertialPhase
        }
        break
      }
    }
  }

  return list
}

export const useManagedVocabulary = (list: VocabularySourceData[]) => {
  const vocabularyStates: VocabularySourceState[] = list.map((i) => ({
    ...i,
    inertialPhase: i.trackedWord.learningPhase,
  }))
  const [previousVocabularyStates, setPreviousVocabularyStates] = useState(vocabularyStates)
  const [rows, setRows] = useState(vocabularyStates)
  // https://react.dev/reference/react/useState#storing-information-from-previous-renders
  if (previousVocabularyStates !== vocabularyStates) {
    setPreviousVocabularyStates(vocabularyStates)
    setRows(preserveInertialPhase(vocabularyStates))
  }
  const syncPhases = () => {
    setRows(produce((draft) => {
      draft.forEach((row) => {
        if (row.inertialPhase !== row.trackedWord.learningPhase) {
          row.inertialPhase = row.trackedWord.learningPhase
        }
      })
    }))
  }
  return [rows, syncPhases] as const
}
