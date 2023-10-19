import {
  useEffect, useState,
} from 'react'
import type { LabelDisplayTable } from '@/components/vocab'
import { purgedRows, statusRetainedList } from '@/lib/vocab-utils'
import { VocabDataTable } from '@/components/ui/VocabData'
import { useVocabularyQuery } from '@/api/vocab-api'

export function MinePage() {
  const { data: userWords = [] } = useVocabularyQuery()
  const [rows, setRows] = useState<LabelDisplayTable[]>([])

  useEffect(() => {
    setRows((r) => statusRetainedList(r, userWords))
  }, [userWords])

  function handlePurge() {
    setRows(purgedRows())
  }

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
