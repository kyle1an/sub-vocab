import {
  useDeferredValue,
  useEffect,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { atom, useAtom } from 'jotai'
import { useMediaQuery } from 'foxact/use-media-query'
import { FileSettings } from './file-settings'
import { FileInput } from '@/components/ui/FileInput'
import { TextareaInput } from '@/components/ui/TextareaInput'
import {
  type LabelDisplaySource,
  formVocab,
} from '@/lib/vocab'
import { VocabSourceTable } from '@/components/ui/VocabSource.tsx'
import {
  useIrregularMapsQuery,
  useVocabularyQuery,
} from '@/api/vocab-api'
import { purgedRows, statusRetainedList } from '@/lib/vocab-utils'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import { cn } from '@/lib/utils'
import { SquircleBg, SquircleMask } from '@/components/ui/squircle'
import { LabeledTire } from '@/lib/LabeledTire'
import { fileTypesAtom } from '@/store/useVocab'

const fileInfoAtom = atom('')
const sourceTextAtom = atom('')
const textCountAtom = atom(0)

function SourceVocab({
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
    const trie = new LabeledTire()
    trie.add(sourceText)
    trie.mergedVocabulary(baseVocab)
    trie.mergeDerivedWordIntoStem(irregulars)
    const list = trie.vocabulary.filter(Boolean).filter((v) => !v.variant).map(formVocab)
    setRows((r) => statusRetainedList(r, list))
    setSentences(trie.sentences)
    setCount(trie.wordCount)
  }, [sourceText, baseVocab, irregulars, setCount])

  function handlePurge() {
    setRows(purgedRows())
  }

  return (
    <VocabSourceTable
      data={rows}
      sentences={sentences}
      onPurge={handlePurge}
      className="h-full"
    />
  )
}

export function Home() {
  const { t } = useTranslation()
  const [fileInfo, setFileInfo] = useAtom(fileInfoAtom)
  const [sourceText, setSourceText] = useAtom(sourceTextAtom)
  const deferredSourceText = useDeferredValue(sourceText)

  function handleFileChange({ name, value }: { name: string, value: string }) {
    setFileInfo(name)
    setSourceText(value)
  }

  function handleTextareaChange({ name, value }: { name?: string, value: string }) {
    setSourceText(value)
    if (name) {
      setFileInfo(name)
    }
  }

  const [count] = useAtom(textCountAtom)
  const isMdScreen = useMediaQuery('(min-width: 768px)')
  const direction = isMdScreen ? 'horizontal' : 'vertical'
  let defaultSizes = [56, 44]
  if (direction === 'vertical') {
    defaultSizes = [
      36,
      64,
    ]
  }
  const [fileTypes] = useAtom(fileTypesAtom)

  return (
    <main className="m-auto h-[calc(100svh-4px*11)] w-full max-w-screen-xl px-5 pb-7">
      <div className="relative flex h-14 items-center gap-2">
        <FileInput
          onFileSelect={handleFileChange}
        >
          {t('browseFiles')}
        </FileInput>
        <FileSettings />
        <div className="grow" />
      </div>
      <SquircleBg className="flex h-[calc(100%-4px*14)] items-center justify-center overflow-hidden rounded-xl border">
        <SquircleMask asChild>
          <ResizablePanelGroup
            direction={direction}
            className={cn(
              'iOS:[body:has(&)]:overflow-hidden', // prevent overscroll
            )}
          >
            <ResizablePanel defaultSize={defaultSizes[0]}>
              <div className="flex h-full items-center justify-center">
                <div className="relative flex h-full grow flex-col overflow-hidden">
                  <div className="flex h-10 shrink-0 items-center border-b bg-zinc-50 py-2 pl-4 pr-2 text-xs text-neutral-600 dark:bg-slate-900 dark:text-slate-400">
                    <span className="grow truncate">{fileInfo}</span>
                    <span className="mx-2 inline-block h-[18px] w-px border-l align-middle" />
                    <span className="shrink-0 text-right tabular-nums">{`${count.toLocaleString('en-US')} ${t('words')}`}</span>
                  </div>
                  <div className="size-full grow text-base text-zinc-700 md:text-sm">
                    <TextareaInput
                      value={sourceText}
                      placeholder={t('inputArea')}
                      fileTypes={fileTypes}
                      onChange={handleTextareaChange}
                    />
                  </div>
                </div>
              </div>
            </ResizablePanel>
            <ResizableHandle
              withHandle
              className="focus-visible:bg-ring focus-visible:ring-offset-[-1px]"
            />
            <ResizablePanel defaultSize={defaultSizes[1]}>
              <SourceVocab
                text={deferredSourceText}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </SquircleMask>
      </SquircleBg>
    </main>
  )
}
