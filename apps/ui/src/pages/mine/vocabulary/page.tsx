import { useAtom, useAtomValue } from 'jotai'

import { baseVocabAtom, irregularWordsQueryAtom } from '@/api/vocab-api'
import { VocabDataTable } from '@/components/vocabulary/data'
import { LexiconTrie } from '@/lib/LexiconTrie'

export default function VocabularyPage() {
  const [userWords] = useAtom(baseVocabAtom)

  const { data: irregulars = [] } = useAtomValue(irregularWordsQueryAtom)
  const trie = new LexiconTrie()
  trie.input(userWords.map((w) => w.form))
  const list = trie.generate(irregulars, userWords)

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
            data={list}
            className="size-full md:mx-0 md:grow"
          />
        </div>
      </div>
    </div>
  )
}
