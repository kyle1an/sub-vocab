import {
  useEffect,
  useState,
} from 'react'
import type { LabelDisplayTable } from '@/lib/vocab'
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
    <div className="h-full pb-7">
      <div className="flex h-14">
        <div className="flex-auto grow" />
      </div>
      <div className="m-auto flex h-[calc(100vh-4px*36)] max-w-full items-center justify-center overflow-hidden rounded-xl border-[length:--l-w] squircle sq-radius-[--sq-r] sq-outline-[--l-w] sq-stroke-border [--l-w:1px] [--sq-r:9px] sq:rounded-none sq:border-0 md:h-[calc(100%-4px*14)]">
        <div className="flex size-full mask-squircle sq-radius-[calc(var(--sq-r)-var(--l-w)+0.5px)] sq-fill-white sq:size-[calc(100%-2px)]">
          <VocabDataTable
            data={rows}
            onPurge={handlePurge}
            className="size-full md:mx-0 md:grow"
          />
        </div>
      </div>
    </div>
  )
}
