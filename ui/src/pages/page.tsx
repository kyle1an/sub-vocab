import NumberFlow from '@number-flow/react'
import { useMediaQuery } from 'foxact/use-media-query'
import { Link, Outlet } from 'react-router'

import {
  useIrregularMapsQuery,
  userVocabWithBaseVocabAtom,
} from '@/api/vocab-api'
import { VocabSourceTable } from '@/components/VocabSource'
import { LabeledTire } from '@/lib/LabeledTire'
import {
  formVocab,
  type LabelDisplaySource,
} from '@/lib/vocab'
import { statusRetainedList } from '@/lib/vocab-utils'
import { fileTypesAtom, sourceTextAtom } from '@/store/useVocab'

import { FileSettings } from './file-settings'

const fileInfoAtom = atom('')
const textCountAtom = atom(0)

function SourceVocab({
  text: sourceText,
}: {
  text: string
}) {
  const { data: irregulars = [] } = useIrregularMapsQuery()
  const [baseVocab] = useAtom(userVocabWithBaseVocabAtom)
  const [rows, setRows] = useState<LabelDisplaySource[]>([])
  const [sentences, setSentences] = useState<string[]>([])
  const setCount = useSetAtom(textCountAtom)

  useEffect(() => {
    const trie = new LabeledTire()
    trie.add(sourceText)
    trie.mergeDerivedWordIntoStem(irregulars)
    trie.mergedVocabulary(baseVocab)
    const vocabulary = trie.getVocabulary()
    const list = vocabulary
      .filter((v) => !v.variant)
      .map(formVocab)
      .filter((v) => v.locations.length >= 1)
      .sort((a, b) => (a.locations[0]?.wordOrder ?? 0) - (b.locations[0]?.wordOrder ?? 0))
    setRows((r) => statusRetainedList(r, list))
    setSentences(trie.sentences)
    setCount(trie.wordCount)
  }, [sourceText, baseVocab, irregulars, setCount])

  function handlePurge() {
    setRows(produce((draft) => {
      draft.forEach((todo) => {
        todo.inertialPhase = todo.vocab.learningPhase
      })
    }))
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
  const setFileInfo = useSetAtom(fileInfoAtom)
  const setSourceText = useSetAtom(sourceTextAtom)

  function handleFileChange({ name, value }: { name: string, value: string }) {
    setFileInfo(name)
    setSourceText(value)
  }

  return (
    <main className="m-auto h-[calc(100svh-4px*11)] w-full max-w-screen-xl px-5 pb-7">
      <div className="relative flex h-14 items-center gap-2">
        <FileInput
          onFileSelect={handleFileChange}
        >
          {t('browseFiles')}
        </FileInput>
        <FileSettings />
        <Button
          variant="outline"
          className="whitespace-nowrap p-0"
          size="sm"
        >
          <Link
            to="/subtitles"
            className="flex size-full items-center px-3"
          >
            Subtitles
          </Link>
        </Button>
        <div className="grow" />
      </div>
      <Outlet />
    </main>
  )
}

export function ResizeVocabularyPanel() {
  const { t } = useTranslation()
  const [fileInfo, setFileInfo] = useAtom(fileInfoAtom)
  const [sourceText, setSourceText] = useAtom(sourceTextAtom)
  const deferredSourceText = useDeferredValue(sourceText)

  function handleTextareaChange({ name, value }: { name?: string, value: string }) {
    setSourceText(value)
    if (name) {
      setFileInfo(name)
    }
  }

  const [count] = useAtom(textCountAtom)
  const isMdScreen = useMediaQuery('(min-width: 768px)')
  const direction = isMdScreen ? 'horizontal' : 'vertical'
  let defaultSizes = [50, 50]
  if (direction === 'vertical') {
    defaultSizes = [
      36,
      64,
    ]
  }
  const [fileTypes] = useAtom(fileTypesAtom)

  return (
    (
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
                  <div className="flex h-12 shrink-0 items-center bg-background py-2 pl-4 pr-2 text-xs">
                    <span className="grow truncate">{fileInfo}</span>
                    <span className="mx-2 inline-block h-[18px] w-px border-l align-middle" />
                    <span className="shrink-0 text-right tabular-nums">
                      <NumberFlow
                        value={count}
                        locales="en-US"
                        isolate
                      />
                      <span>
                        {` ${t('words')}`}
                      </span>
                    </span>
                  </div>
                  <div className="z-10 h-px w-full border-b border-solid border-border shadow-[0_0.4px_2px_0_rgb(0_0_0/0.05)]" />
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
    )
  )
}
