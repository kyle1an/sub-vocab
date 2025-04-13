import type { ImperativePanelGroupHandle } from 'react-resizable-panels'

import { useIsomorphicLayoutEffect } from '@react-hookz/web'
import clsx from 'clsx'
import { useMediaQuery } from 'foxact/use-media-query'
import { produce } from 'immer'
import { atom, useAtom, useSetAtom } from 'jotai'
import { useDeferredValue, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { LabelDisplaySource } from '@/lib/vocab'

import {
  baseVocabAtom,
  useIrregularMapsQuery,
} from '@/api/vocab-api'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { TextareaInput } from '@/components/ui/textarea-input'
import { VocabSourceTable } from '@/components/VocabSource'
import { VocabStatics } from '@/components/vocabulary/vocab-statics-bar'
import { LabeledTire, LEARNING_PHASE } from '@/lib/LabeledTire'
import {
  formVocab,
} from '@/lib/vocab'
import { statusRetainedList } from '@/lib/vocab-utils'
import { fileTypesAtom, isSourceTextStaleAtom, sourceTextAtom } from '@/store/useVocab'

const fileInfoAtom = atom('')
const textCountAtom = atom(0)
const acquaintedWordCountAtom = atom(0)
const newWordCountAtom = atom(0)

function SourceVocab({
  text: { text: sourceText },
}: {
  text: { text: string }
}) {
  const { data: irregulars = [] } = useIrregularMapsQuery()
  const [baseVocab] = useAtom(baseVocabAtom)
  const [rows, setRows] = useState<LabelDisplaySource[]>([])
  const [sentences, setSentences] = useState<string[]>([])
  const setCount = useSetAtom(textCountAtom)
  const setNewCount = useSetAtom(newWordCountAtom)
  const setAcquaintedCount = useSetAtom(acquaintedWordCountAtom)

  useEffect(() => {
    const trie = new LabeledTire()
    trie.add(sourceText)
    trie.mergeDerivedWordIntoStem(irregulars)
    trie.mergedVocabulary(baseVocab)
    const list = trie.getVocabulary()
      .map(formVocab)
      .filter((v) => v.locations.length >= 1)
      .sort((a, b) => (a.locations[0]?.wordOrder ?? 0) - (b.locations[0]?.wordOrder ?? 0))
    setRows((r) => statusRetainedList(r, list))
    setSentences(trie.sentences)
    let acquaintedCount = 0
    let newCount = 0
    let rest = 0
    for (const item of list) {
      if (item.vocab.learningPhase === LEARNING_PHASE.ACQUAINTED)
        acquaintedCount += item.locations.length
      else if (item.vocab.learningPhase === LEARNING_PHASE.NEW)
        newCount += item.locations.length
      else
        rest += item.locations.length
    }
    setAcquaintedCount(acquaintedCount)
    setNewCount(newCount)
    setCount(acquaintedCount + newCount + rest)
  }, [sourceText, baseVocab, irregulars, setCount, setAcquaintedCount, setNewCount])

  function handlePurge() {
    setRows(produce((draft) => {
      draft.forEach((todo) => {
        if (todo.inertialPhase !== todo.vocab.learningPhase)
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

const horizontalDefaultSizesAtom = atom([50, 50])
const verticalDefaultSizesAtom = atom([
  36,
  64,
])

export default function ResizeVocabularyPanel() {
  const { t } = useTranslation()
  const [fileInfo, setFileInfo] = useAtom(fileInfoAtom)
  const [sourceText, setSourceText] = useAtom(sourceTextAtom)
  const deferredSourceText = useDeferredValue(sourceText)
  const [isSourceTextStale, setIsSourceTextStale] = useAtom(isSourceTextStaleAtom)
  useEffect(() => {
    const isStale = sourceText.version !== deferredSourceText.version
    if (isSourceTextStale !== isStale)
      setIsSourceTextStale(isStale)
  })

  function handleTextareaChange({ name, value }: { name?: string, value: string }) {
    setSourceText((v) => ({
      text: value,
      version: v.version++,
    }))
    if (name)
      setFileInfo(name)
  }

  const [count] = useAtom(textCountAtom)
  const [acquaintedWordCount] = useAtom(acquaintedWordCountAtom)
  const [newWordCount] = useAtom(newWordCountAtom)
  const [horizontalDefaultSizes, setHorizontalDefaultSizes] = useAtom(horizontalDefaultSizesAtom)
  const [verticalDefaultSizes, setVerticalDefaultSizes] = useAtom(verticalDefaultSizesAtom)
  const isMdScreen = useMediaQuery('(min-width: 768px)')
  const direction = isMdScreen ? 'horizontal' : 'vertical'
  const defaultSizes = direction === 'vertical' ? verticalDefaultSizes : horizontalDefaultSizes
  const panelGroupRef = useRef<ImperativePanelGroupHandle>(null)
  useIsomorphicLayoutEffect(() => {
    panelGroupRef.current?.setLayout(defaultSizes)
  // eslint-disable-next-line react-compiler/react-compiler
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [direction])

  function onLayout(sizes: number[]) {
    if (direction === 'vertical')
      setVerticalDefaultSizes(sizes)
    else
      setHorizontalDefaultSizes(sizes)
  }

  const [fileTypes] = useAtom(fileTypesAtom)

  return (
    (
      <div className="flex h-[calc(100%-4px*14)] items-center justify-center overflow-hidden rounded-xl border drop-shadow-sm sq:rounded-3xl sq:[corner-shape:squircle]">
        <>
          <ResizablePanelGroup
            ref={panelGroupRef}
            direction={direction}
            className={clsx(
              'iOS:[body:has(&)]:overflow-hidden', // prevent overscroll
            )}
            onLayout={onLayout}
          >
            <ResizablePanel defaultSize={defaultSizes[0]}>
              <div className="flex h-full items-center justify-center">
                <div className="relative flex h-full grow flex-col overflow-hidden">
                  <div className="flex h-12 shrink-0 items-center bg-background py-2 pl-4 pr-2 text-xs">
                    <span className="grow truncate">{fileInfo}</span>
                  </div>
                  <div className="z-10 h-px w-full border-b border-solid border-border shadow-[0_0.4px_2px_0_rgb(0_0_0/0.05)]" />
                  <div className="size-full grow text-base text-zinc-700 md:text-sm">
                    <TextareaInput
                      value={sourceText.text}
                      placeholder={t('inputArea')}
                      fileTypes={fileTypes}
                      onChange={handleTextareaChange}
                    />
                  </div>
                  <div className="flex w-full justify-center border-t border-solid border-t-zinc-200 bg-background dark:border-slate-800">
                    <VocabStatics
                      total={count}
                      text={` ${t('words')}`}
                      remaining={newWordCount}
                      completed={acquaintedWordCount}
                      progress
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
        </>
      </div>
    )
  )
}
