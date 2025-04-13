import { produce } from 'immer'
import { useAtom } from 'jotai'
import { useEffect, useState } from 'react'

import type { LabelDisplayTable } from '@/lib/vocab'

import { baseVocabAtom, useIrregularMapsQuery } from '@/api/vocab-api'
import { VocabDataTable } from '@/components/VocabData'
import { LabeledTire } from '@/lib/LabeledTire'
import { formVocab } from '@/lib/vocab'
import { statusRetainedList } from '@/lib/vocab-utils'

export default function VocabularyPage() {
  const [userWords] = useAtom(baseVocabAtom)

  const [rows, setRows] = useState<LabelDisplayTable[]>([])
  const { data: irregulars = [] } = useIrregularMapsQuery()

  useEffect(() => {
    const trie = new LabeledTire()
    for (const word of userWords)
      trie.update(word.word, -1, -1)

    trie.mergedVocabulary(userWords)
    trie.mergeDerivedWordIntoStem(irregulars)
    const list = trie.getVocabulary().map(formVocab)
    setRows((r) => statusRetainedList(r, list))
  }, [irregulars, userWords])

  function handlePurge() {
    setRows(produce((draft) => {
      draft.forEach((todo) => {
        if (todo.inertialPhase !== todo.vocab.learningPhase)
          todo.inertialPhase = todo.vocab.learningPhase
      })
    }))
  }

  return (
    <div className="h-full pb-7">
      <div className="flex h-14">
        <div className="flex-auto grow" />
      </div>
      <div className="m-auto flex h-[calc(100vh-4px*36)] max-w-full items-center justify-center overflow-hidden rounded-xl border sq:rounded-3xl sq:[corner-shape:squircle] md:h-[calc(100%-4px*14)]">
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
