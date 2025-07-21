import type { ExtractAtomValue } from 'jotai'
import type { ImperativePanelGroupHandle } from 'react-resizable-panels'

import { useIsomorphicLayoutEffect } from '@react-hookz/web'
import clsx from 'clsx'
import { useMediaQuery } from 'foxact/use-media-query'
import { produce } from 'immer'
import { atom, useAtom, useSetAtom } from 'jotai'
import React, { useDeferredValue, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import getCaretCoordinates from 'textarea-caret'

import type { Sentence } from '@/lib/LabeledTire'
import type { VocabularySourceState } from '@/lib/vocab'

import {
  baseVocabAtom,
  useIrregularMapsQuery,
} from '@/api/vocab-api'
import { FileInput } from '@/components/file-input'
import { Button } from '@/components/ui/button'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { TextareaInput } from '@/components/ui/textarea-input'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { VocabSourceTable } from '@/components/VocabSource'
import { VocabStatics } from '@/components/vocabulary/vocab-statics-bar'
import { useIsEllipsisActive } from '@/hooks/useIsEllipsisActive'
import { LEARNING_PHASE, LexiconTrie } from '@/lib/LabeledTire'
import { normalizeNewlines } from '@/lib/utilities'
import { statusRetainedList } from '@/lib/vocab-utils'
import { FileSettings } from '@/pages/file-settings'
import { fileInfoAtom, fileTypesAtom, isSourceTextStaleAtom, sourceTextAtom } from '@/store/useVocab'

const sourceCountAtom = atom({
  totalText: 0,
  acquainted: 0,
  newCount: 0,
})

function getCount(list: VocabularySourceState[]): ExtractAtomValue<typeof sourceCountAtom> {
  let acquaintedCount = 0
  let newCount = 0
  let rest = 0
  for (const { trackedWord, locators } of list) {
    if (trackedWord.learningPhase === LEARNING_PHASE.ACQUAINTED) {
      acquaintedCount += locators.length
    } else if (trackedWord.learningPhase === LEARNING_PHASE.NEW) {
      newCount += locators.length
    } else {
      rest += locators.length
    }
  }
  return {
    acquainted: acquaintedCount,
    newCount,
    totalText: acquaintedCount + newCount + rest,
  }
}

function SourceVocab({
  text: {
    value: text,
  },
  onSentenceTrack,
}: {
  text: {
    value: string
  }
  onSentenceTrack: (sentenceId: Sentence) => void
  key: React.Key
}) {
  const { data: irregulars = [] } = useIrregularMapsQuery()
  const [baseVocab] = useAtom(baseVocabAtom)
  const [rows, setRows] = useState<VocabularySourceState[]>([])
  const setSourceCountAtom = useSetAtom(sourceCountAtom)
  const trie = new LexiconTrie()
  trie.add(text)
  const list = trie
    .generate(irregulars, baseVocab)
    .filter((v) => v.locators.length >= 1)
    .sort((a, b) => (a.locators[0]?.wordOrder ?? 0) - (b.locators[0]?.wordOrder ?? 0))
  const sentences = trie.sentences
  useEffect(() => {
    // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
    setRows(statusRetainedList(list))
  }, [list])
  useEffect(() => {
    setSourceCountAtom(getCount(list))
  }, [list, setSourceCountAtom])

  function handlePurge() {
    setRows(produce((draft) => {
      draft.forEach((row) => {
        if (row.inertialPhase !== row.trackedWord.learningPhase) {
          row.inertialPhase = row.trackedWord.learningPhase
        }
      })
    }))
  }

  function handleLocateSentence(no: number) {
    const sentence = sentences[no]
    if (sentence) {
      onSentenceTrack(sentence)
    }
  }

  return (
    <VocabSourceTable
      data={rows}
      sentences={sentences}
      onPurge={handlePurge}
      onSentenceTrack={handleLocateSentence}
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
    const isStale = sourceText.epoch !== deferredSourceText.epoch
    if (isSourceTextStale !== isStale) {
      setIsSourceTextStale(isStale)
    }
  })

  function handleTextareaChange(ev: React.ChangeEvent<HTMLTextAreaElement>) {
    setSourceText((v) => ({
      value: ev.target.value,
      epoch: v.epoch + 1,
    }))
  }

  const [{ totalText: count, acquainted: acquaintedWordCount, newCount: newWordCount }] = useAtom(sourceCountAtom)
  const [horizontalDefaultSizes, setHorizontalDefaultSizes] = useAtom(horizontalDefaultSizesAtom)
  const [verticalDefaultSizes, setVerticalDefaultSizes] = useAtom(verticalDefaultSizesAtom)
  const isMdScreen = useMediaQuery('(min-width: 1024px)')
  const direction = isMdScreen ? 'horizontal' : 'vertical'
  const defaultSizes = direction === 'vertical' ? verticalDefaultSizes : horizontalDefaultSizes
  const panelGroupRef = useRef<ImperativePanelGroupHandle>(null)
  useIsomorphicLayoutEffect(() => {
    const panelGroup = panelGroupRef.current
    if (panelGroup) {
      panelGroup.setLayout(defaultSizes)
    }
  // eslint-disable-next-line react-compiler/react-compiler
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [direction])

  function handleLayoutChange(sizes: number[]) {
    if (direction === 'vertical') {
      setVerticalDefaultSizes(sizes)
    } else {
      setHorizontalDefaultSizes(sizes)
    }
  }

  const [fileTypes] = useAtom(fileTypesAtom)

  function handleFileChange({ name, value }: { name?: string, value: string }) {
    setSourceText((v) => ({
      value: normalizeNewlines(value),
      epoch: v.epoch + 1,
    }))
    if (name) {
      setFileInfo(name)
    }
  }

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function onSentenceTrack(sentence: Sentence) {
    const textarea = textareaRef.current
    if (textarea) {
      requestAnimationFrame(() => {
        const coords = getCaretCoordinates(textarea, sentence.index)
        textarea.focus()
        textarea.setSelectionRange(sentence.index, sentence.index + sentence.text.length)
        textarea.scrollTo({
          top: coords.top - textarea.clientHeight / 2,
          behavior: 'smooth',
        })
      })
    }
  }

  const fileInfoRef = useRef<HTMLSpanElement>(null)
  const [isEllipsisActive, handleOnMouseOver] = useIsEllipsisActive()
  return (
    (
      <div className="flex h-full flex-col">
        <div className="pb-3">
          <div className="flex items-center gap-2">
            <FileInput
              onFileSelect={handleFileChange}
              className="*:*:text-xs *:*:data-[slot=button]:h-8 *:*:data-[slot=button]:px-3"
            >
              {t('browseFiles')}
            </FileInput>
            <FileSettings />
            <Button
              variant="secondary"
              className="h-8 px-3 text-xs"
              asChild
            >
              <Link to="/subtitles">
                Subtitles
              </Link>
            </Button>
            <div className="grow" />
          </div>
        </div>
        <div className="flex grow items-center justify-center overflow-hidden rounded-xl border drop-shadow-xs sq:rounded-3xl">
          <ResizablePanelGroup
            ref={panelGroupRef}
            direction={direction}
            className={clsx(
              '[body:has(&[data-panel-group-direction=vertical])]:overflow-hidden', // prevent overscroll
            )}
            onLayout={handleLayoutChange}
          >
            <ResizablePanel defaultSize={defaultSizes[0]}>
              <div className="flex h-full items-center justify-center">
                <div className="relative flex h-full grow flex-col overflow-hidden">
                  <div className="flex h-12 shrink-0 items-center bg-background py-2 pr-2 pl-4 text-xs">
                    <Tooltip
                      delayDuration={400}
                    >
                      <TooltipTrigger
                        onMouseOver={handleOnMouseOver}
                        asChild
                      >
                        <span
                          ref={fileInfoRef}
                          className="grow truncate"
                        >
                          {fileInfo}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent
                        side="bottom"
                        sideOffset={-22 - 1}
                        align="start"
                        alignOffset={-12 - 1}
                        avoidCollisions={false}
                        hidden={!isEllipsisActive}
                        className="max-w-(--max-width) border bg-background text-foreground shadow-xs slide-in-from-top-0! zoom-in-100! zoom-out-100! [word-wrap:break-word] **:[[data-slot=tooltip-arrow]]:hidden!"
                        style={{
                          '--max-width': `${window.innerWidth - (fileInfoRef.current?.getBoundingClientRect().x ?? 0) + 12 - 1}px`,
                        }}
                      >
                        {fileInfo}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="z-10 h-px w-full border-b border-solid border-border shadow-[0_0.4px_2px_0_rgb(0_0_0/0.05)]" />
                  <div className="size-full grow text-base text-zinc-700 md:text-sm">
                    <TextareaInput
                      ref={textareaRef}
                      value={sourceText.value}
                      placeholder={t('inputArea')}
                      fileTypes={fileTypes}
                      onChange={handleTextareaChange}
                      onFileChange={handleFileChange}
                    />
                  </div>
                  <div className="flex w-full justify-center border-t border-solid border-t-zinc-200 bg-background dark:border-neutral-800">
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
                key={deferredSourceText.epoch}
                text={deferredSourceText}
                onSentenceTrack={onSentenceTrack}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    )
  )
}
