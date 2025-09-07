'use client'

import { pipe } from 'effect'
import { useAtom, useAtomValue } from 'jotai'

import { baseVocabAtom, irregularWordsQueryAtom } from '@/app/[locale]/(vocabulary)/_api'
import { VocabDataTable } from '@/app/[locale]/(vocabulary)/_components/data'
import { LexiconTrie } from '@/app/[locale]/(vocabulary)/_lib/LexiconTrie'
import { NoSSR } from '@/components/NoSsr'
import { tap } from '@sub-vocab/utils/lib'

export default function VocabularyPage() {
  const [userWords] = useAtom(baseVocabAtom)
  const { data: irregulars = [] } = useAtomValue(irregularWordsQueryAtom)
  const list = pipe(
    new LexiconTrie(),
    tap((x) => {
      x.input(userWords.map((w) => w.form))
    }),
    (x) => {
      return x.generate(irregulars, userWords)
    },
  )
  return (
    <NoSSR>
      <VocabDataTable
        data={list}
        className="size-full md:mx-0 md:grow"
      />
    </NoSSR>
  )
}
