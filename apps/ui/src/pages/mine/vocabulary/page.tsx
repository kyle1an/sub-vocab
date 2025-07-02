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
    <div className="flex h-full flex-col">
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
