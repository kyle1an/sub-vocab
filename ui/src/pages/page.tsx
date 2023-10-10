import {
  memo, useCallback, useDeferredValue, useEffect, useState,
} from 'react'
import { produce } from 'immer'
import { useTranslation } from 'react-i18next'
import { FileInput } from '@/components/ui/FileInput'
import { TextareaInput } from '@/components/ui/TextareaInput'
import { setSubSourceText, useSnapshotStore } from '@/store/useVocab.ts'
import { type LabelDisplaySource, generatedVocabTrie } from '@/components/vocab'
import { VocabSourceTable } from '@/components/ui/VocabSource.tsx'
import {
  useIrregularMapsQuery, useVocabularyQuery,
} from '@/lib/composables.ts'

function statusRetainedList(oldRows: LabelDisplaySource[], newList: Omit<LabelDisplaySource, 'inertialPhase'>[]): LabelDisplaySource[] {
  const vocabLabel = new Map<string, LabelDisplaySource>()
  const listDisplay = newList.map((sieve) => {
    const label: LabelDisplaySource = {
      ...sieve,
      inertialPhase: sieve.learningPhase,
    }
    vocabLabel.set(sieve.word, label)
    return label
  })
  oldRows.forEach((row) => {
    const label = vocabLabel.get(row.word)
    if (label) {
      label.inertialPhase = row.inertialPhase
    }
  })

  return listDisplay
}

const SourceVocab = memo(function SourceVocab({
  text: sourceText,
  onNewCount,
}: {
  text: string
  onNewCount: (arg: number) => void
}) {
  const { data: baseVocab = [] } = useVocabularyQuery()
  const { data: irregulars = [] } = useIrregularMapsQuery()

  const [rows, setRows] = useState<LabelDisplaySource[]>([])
  const [sentences, setSentences] = useState<string[]>([])

  useEffect(() => {
    const { list, count: c, sentences: s } = generatedVocabTrie(sourceText, baseVocab, irregulars)
    setRows(statusRetainedList(rows, list))
    setSentences(s)
    onNewCount(c)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceText, baseVocab, irregulars])

  useEffect(() => {
    setSubSourceText(sourceText)
  }, [sourceText])

  const handlePurge = useCallback(() => {
    setRows(produce((draft) => {
      draft.filter((todo) => todo.learningPhase !== todo.inertialPhase).forEach((todo) => {
        todo.inertialPhase = todo.learningPhase
      })
    }))
  }, [])

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
  const { subSourceText } = useSnapshotStore()
  const [sourceText, setSourceText] = useState(subSourceText)
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

  const [count, setCount] = useState(0)

  return (
    <main className="m-auto w-full max-w-screen-xl md:h-[calc(100vh-4px*11)]">
      <div className="relative mx-3 flex h-14 items-center xl:mx-0">
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
          onNewCount={setCount}
        />
      </div>
    </main>
  )
}
