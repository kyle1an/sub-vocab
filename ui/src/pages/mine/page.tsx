import {
  type ComponentProps, useCallback, useEffect, useState,
} from 'react'
import { produce } from 'immer'
import { VocabDataTable } from '@/components/ui/VocabData'
import type { LabelDisplayTable } from '@/components/vocab'
import { useVocabularyQuery } from '@/lib/composables.ts'

export function MinePage() {
  const { data: userWords = [] } = useVocabularyQuery()

  const [rows, setRows] = useState<ComponentProps<typeof VocabDataTable>['data']>([])

  function statusRetainedList(oldRows: LabelDisplayTable[], newList: Omit<LabelDisplayTable, 'inertialPhase' | 'wFamily'>[]): LabelDisplayTable[] {
    const vocabLabel = new Map<string, LabelDisplayTable>()
    const listDisplay = newList.map((sieve) => {
      const label: LabelDisplayTable = {
        ...sieve,
        inertialPhase: sieve.learningPhase,
        wFamily: [sieve.word],
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

  useEffect(() => {
    setRows(statusRetainedList(rows, userWords))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userWords])

  const handlePurge = useCallback(() => {
    setRows(
      produce((draft) => {
        draft.filter((todo) => todo.learningPhase !== todo.inertialPhase).forEach((todo) => {
          todo.inertialPhase = todo.learningPhase
        })
      }),
    )
  }, [])

  return (
    <div className="h-full">
      <div className="flex h-14">
        <div className="flex-auto grow" />
      </div>
      <div className="m-auto flex max-w-full flex-col overflow-visible pb-6 md:h-[calc(100%-4px*14)] md:pb-8">
        <VocabDataTable
          data={rows}
          onPurge={handlePurge}
          className="h-[calc(100vh-4px*36)] md:mx-0 md:h-[unset]"
        />
      </div>
    </div>
  )
}
