import {
  memo, useDeferredValue, useEffect, useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { atom, useAtom } from 'jotai'
import { FileInput } from '@/components/ui/FileInput'
import { TextareaInput } from '@/components/ui/TextareaInput'
import {
  type LabelDisplaySource, generatedVocabTrie,
} from '@/components/vocab'
import { VocabSourceTable } from '@/components/ui/VocabSource.tsx'
import {
  useIrregularMapsQuery, useVocabularyQuery,
} from '@/api/vocab-api'
import { purgedRows, statusRetainedList } from '@/lib/vocab-utils'

const sourceTextAtom = atom('')
const textCountAtom = atom(0)

const SourceVocab = memo(function SourceVocab({
  text: sourceText,
}: {
  text: string
}) {
  const { data: baseVocab = [] } = useVocabularyQuery()
  const { data: irregulars = [] } = useIrregularMapsQuery()

  const [rows, setRows] = useState<LabelDisplaySource[]>([])
  const [sentences, setSentences] = useState<string[]>([])
  const [, setCount] = useAtom(textCountAtom)

  useEffect(() => {
    const { list, count: c, sentences: s } = generatedVocabTrie(sourceText, baseVocab, irregulars)
    setRows((r) => statusRetainedList(r, list))
    setSentences(s)
    setCount(c)
  }, [sourceText, baseVocab, irregulars, setCount])

  function handlePurge() {
    setRows(purgedRows())
  }

  return (
    <VocabSourceTable
      data={rows}
      sentences={sentences}
      onPurge={handlePurge}
      className="mx-5 mb-6 h-[calc(100vh-4px*36)] md:m-0 md:h-full md:w-[44%]"
    />
  )
})

export default function Home() {
  const { t } = useTranslation()
  const [fileInfo, setFileInfo] = useState('')
  const [sourceText, setSourceText] = useAtom(sourceTextAtom)
  const deferredSourceText = useDeferredValue(sourceText)

  function handleFileChange({ name, value }: { name: string; value: string }) {
    setFileInfo(name)
    setSourceText(value)
  }

  function handleTextareaChange({ name, value }: { name?: string; value: string }) {
    setSourceText(value)
    if (name) {
      setFileInfo(name)
    }
  }

  const [count] = useAtom(textCountAtom)

  return (
    <main className="m-auto w-full max-w-screen-xl md:h-[calc(100vh-4px*11)] md:px-5">
      <div className="relative mx-3 flex h-14 items-center md:mx-0">
        <FileInput
          onFileChange={handleFileChange}
        >
          {t('browseFiles')}
        </FileInput>
        <div className="grow" />
      </div>
      <div className="flex flex-col gap-6 md:h-[calc(100%-4px*14)] md:flex-row md:pb-8">
        <div className="relative box-border flex grow flex-col overflow-hidden border-y md:w-[56%] md:rounded-[12px] md:border-x md:shadow-sm">
          <div className="flex h-10 shrink-0 items-center border-b bg-zinc-50 py-2 pl-4 pr-2 text-xs text-neutral-600">
            <span className="grow truncate">{`${fileInfo} `}</span>
            <span className="mx-2 inline-block h-[18px] w-px border-l align-middle" />
            <span className="shrink-0 text-right tabular-nums">{`${count.toLocaleString('en-US')} ${t('words')}`}</span>
          </div>
          <div className="h-full w-full grow text-base text-zinc-700 md:text-sm">
            <TextareaInput
              value={sourceText}
              placeholder={t('inputArea')}
              onChange={handleTextareaChange}
            />
          </div>
        </div>
        <SourceVocab
          text={deferredSourceText}
        />
      </div>
    </main>
  )
}
