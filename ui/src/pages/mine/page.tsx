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
      <div
        className="group/p m-auto max-w-full squircle sq-rounded-[9px] sq-outline-[--line-width] sq-fill-border [--line-width:1px] md:h-[calc(100%-4px*14)]"
      >
        <div className="relative flex max-w-full flex-col overflow-hidden rounded-xl border-[length:--line-width] sq:rounded-none sq:border-transparent md:h-full">
          <div className="absolute bottom-[--group-line] left-[--group-line] size-full sq-rounded-[8px] sq-outline-0 *:absolute *:size-1/2 *:squircle dark:hidden">
            <div className="sq-fill-neutral-50" />
            <div className="right-0 top-0 sq-fill-neutral-50" />
            <div className="bottom-0 right-0 sq-fill-neutral-50" />
            <div className="bottom-0 left-0 sq-fill-neutral-50" />
          </div>
          <VocabDataTable
            data={rows}
            onPurge={handlePurge}
            className="h-[calc(100vh-4px*36)] sq:rounded-[17px] md:mx-0 md:h-[unset] md:grow"
          />
        </div>
      </div>
    </div>
  )
}
