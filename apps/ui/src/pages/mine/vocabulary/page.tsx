import { produce } from 'immer'
import { useAtom } from 'jotai'
import { useEffect, useState } from 'react'

import type { VocabularySourceState } from '@/lib/vocab'

import { baseVocabAtom, useIrregularMapsQuery } from '@/api/vocab-api'
import { VocabDataTable } from '@/components/VocabData'
import { LexiconTrie } from '@/lib/LabeledTire'
import { statusRetainedList } from '@/lib/vocab-utils'

export default function VocabularyPage() {
  const [userWords] = useAtom(baseVocabAtom)

  const [rows, setRows] = useState<VocabularySourceState[]>([])
  const { data: irregulars = [] } = useIrregularMapsQuery()
  const trie = new LexiconTrie()
  trie.input(userWords.map((w) => w.form))
  const list = trie.generate(irregulars, userWords)

  useEffect(() => {
    // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
    setRows(statusRetainedList(list))
  }, [list])

  function handlePurge() {
    setRows(produce((draft) => {
      draft.forEach((row) => {
        if (row.inertialPhase !== row.trackedWord.learningPhase) {
          row.inertialPhase = row.trackedWord.learningPhase
        }
      })
    }))
  }

  return (
    <div className="flex h-full flex-col [[data-slot=content-root]:has(&)]:overflow-hidden">
      <div className="pb-3">
        <div className="flex">
          <div className="h-8 flex-auto grow" />
        </div>
      </div>
      <div className="flex grow items-center justify-center overflow-hidden rounded-xl border sq:rounded-3xl">
        <div className="flex size-full">
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
