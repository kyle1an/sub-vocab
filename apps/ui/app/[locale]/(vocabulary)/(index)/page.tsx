'use client'

import type { ExtractAtomValue } from 'jotai'
import type { ImperativePanelGroupHandle } from 'react-resizable-panels'

import { useIsomorphicLayoutEffect } from '@react-hookz/web'
import clsx from 'clsx'
import { pipe } from 'effect'
import { atom, useAtom, useAtomValue } from 'jotai'
import Link from 'next/link'
import nstr from 'nstr'
import React, { Fragment, useDeferredValue, useRef } from 'react'
import getCaretCoordinates from 'textarea-caret'
// https://github.com/vercel/next.js/issues/84462
import { useEffectEvent } from 'use-effect-event'

import type { Sentence } from '@/app/[locale]/(vocabulary)/_lib/LexiconTrie'
import type { VocabularySourceData } from '@/app/[locale]/(vocabulary)/_lib/vocab'

import {
  baseVocabAtom,
  irregularWordsQueryAtom,
} from '@/app/[locale]/(vocabulary)/_api'
import { isSourceTextStaleAtom } from '@/app/[locale]/(vocabulary)/_atoms'
import { VocabSourceTable } from '@/app/[locale]/(vocabulary)/_components/source'
import { VocabStatics } from '@/app/[locale]/(vocabulary)/_components/statics-bar'
import { LEARNING_PHASE, LexiconTrie } from '@/app/[locale]/(vocabulary)/_lib/LexiconTrie'
import { fileTypesAtom } from '@/atoms/file-types'
import { fileInfoAtom, sourceTextAtom } from '@/atoms/vocabulary'
import { FileInput } from '@/components/file-input'
import { FileSettings } from '@/components/file-settings'
import { NoSSR } from '@/components/NoSsr'
import { Button } from '@/components/ui/button'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { TextareaInput } from '@/components/ui/textarea-input'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useI18n } from '@/locales/client'
import { mediaQueryFamily } from '@sub-vocab/utils/atoms'
import { useAtomEffect, useIsEllipsisActive, useRect } from '@sub-vocab/utils/hooks'
import { compareBy, isServer, normalizeNewlines, tap } from '@sub-vocab/utils/lib'

const sourceCountAtom = atom({
  totalText: 0,
  acquainted: 0,
  newCount: 0,
})
sourceCountAtom.debugLabel = 'sourceCountAtom'

function getCount(list: VocabularySourceData[]): ExtractAtomValue<typeof sourceCountAtom> {
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
}) {
  const { data: irregulars = [] } = useAtomValue(irregularWordsQueryAtom)
  const [baseVocab] = useAtom(baseVocabAtom)
  const trie = pipe(
    new LexiconTrie(),
    tap((x) => {
      x.add(text)
    }),
  )
  const list = trie
    .generate(irregulars, baseVocab)
    .filter((v) => v.locators.length > 0)
    .sort(compareBy((i) => [i.locators[0]!.sentenceId, i.locators[0]!.startOffset]))
  const sentences = trie.sentences
  useAtomEffect((_, set) => {
    set(sourceCountAtom, getCount(list))
  }, [list])
  return (
    <VocabSourceTable
      data={list}
      sentences={sentences}
      onSentenceTrack={(no) => {
        const sentence = sentences[no]
        if (sentence) {
          onSentenceTrack(sentence)
        }
      }}
      className="h-full"
    />
  )
}

const horizontalDefaultSizesAtom = atom([50, 50])
horizontalDefaultSizesAtom.debugLabel = 'horizontalDefaultSizesAtom'
const verticalDefaultSizesAtom = atom([
  36,
  64,
])
verticalDefaultSizesAtom.debugLabel = 'verticalDefaultSizesAtom'

export default function Layout() {
  const t = useI18n()
  const [fileInfo, setFileInfo] = useAtom(fileInfoAtom)
  const [sourceText, setSourceText] = useAtom(sourceTextAtom)
  const deferredSourceText = useDeferredValue(sourceText)
  useAtomEffect((get, set) => {
    const isStale = get(sourceTextAtom).epoch !== deferredSourceText.epoch
    if (get(isSourceTextStaleAtom) !== isStale) {
      set(isSourceTextStaleAtom, isStale)
    }
  }, [deferredSourceText.epoch])

  function handleTextareaChange(ev: React.ChangeEvent<HTMLTextAreaElement>) {
    setSourceText((v) => ({
      value: ev.target.value,
      epoch: v.epoch + 1,
    }))
  }

  const [{ totalText: count, acquainted: acquaintedWordCount, newCount: newWordCount }] = useAtom(sourceCountAtom)
  const [horizontalDefaultSizes, setHorizontalDefaultSizes] = useAtom(horizontalDefaultSizesAtom)
  const [verticalDefaultSizes, setVerticalDefaultSizes] = useAtom(verticalDefaultSizesAtom)
  const isLgScreen = useAtomValue(mediaQueryFamily.useA('(min-width: 1024px)'))
  const direction = isLgScreen ? 'horizontal' : 'vertical'
  const defaultSizes = direction === 'vertical' ? verticalDefaultSizes : horizontalDefaultSizes
  const panelGroupRef = useRef<ImperativePanelGroupHandle>(null)
  const resetPanelLayout = useEffectEvent(() => {
    const panelGroup = panelGroupRef.current
    if (panelGroup) {
      panelGroup.setLayout(defaultSizes)
    }
  })
  useIsomorphicLayoutEffect(() => {
    resetPanelLayout()
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
          top: coords.top - 4,
          behavior: 'smooth',
        })
      })
    }
  }

  const fileInfoRef = useRef<HTMLSpanElement>(null)
  const { x: fileInfoX } = useRect(fileInfoRef)
  const [isEllipsisActive, handleOnMouseOver] = useIsEllipsisActive()
  return (
    <Fragment>
      <Fragment>
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
              <Link href="/subtitles">
                Subtitles
              </Link>
            </Button>
            <div className="grow" />
          </div>
        </div>
        <div className="flex grow items-center justify-center overflow-hidden rounded-xl border drop-shadow-xs sq:rounded-3xl">
          <NoSSR>
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
                          className="max-w-(--max-width) border bg-background text-foreground shadow-xs slide-in-from-top-0! zoom-in-100! zoom-out-100! [word-wrap:break-word] **:data-[slot=tooltip-arrow]:hidden!"
                          style={{
                            '--max-width': `${nstr(isServer ? 0 : window.innerWidth - fileInfoX + 12 - 1)}px`,
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
          </NoSSR>
        </div>
      </Fragment>
    </Fragment>
  )
}
