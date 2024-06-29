import {
  useEffect,
  useState,
} from 'react'
import { type LabelDisplayTable, generateVocabTrie } from '@/lib/vocab'
import { purgedRows, statusRetainedList } from '@/lib/vocab-utils'
import { VocabDataTable } from '@/components/ui/VocabData'
import { useVocabularyQuery } from '@/api/vocab-api'
import { SquircleBg, SquircleMask } from '@/components/ui/squircle'

export function MinePage() {
  const { data: userWords = [] } = useVocabularyQuery()
  const [rows, setRows] = useState<LabelDisplayTable[]>([])

  useEffect(() => {
    generateVocabTrie('', userWords, [])
    const list = userWords.map((w) => ({
      ...w,
      wFamily: [w.word],
    }))
    setRows((r) => statusRetainedList(r, list))
  }, [userWords])

  function handlePurge() {
    setRows(purgedRows())
  }

  return (
    <div className="h-full pb-7">
      <div className="flex h-14">
        <div className="flex-auto grow" />
      </div>
      <SquircleBg className="m-auto flex h-[calc(100vh-4px*36)] max-w-full items-center justify-center overflow-hidden rounded-xl border-[length:--l-w] sq-outline-[--l-w] sq-stroke-border [--l-w:1px] [--sq-r:9px] md:h-[calc(100%-4px*14)]">
        <SquircleMask className="flex size-full sq-radius-[calc(var(--sq-r)-var(--l-w)+0.5px)]">
          <VocabDataTable
            data={rows}
            onPurge={handlePurge}
            className="size-full md:mx-0 md:grow"
          />
        </SquircleMask>
      </SquircleBg>
    </div>
  )
}
