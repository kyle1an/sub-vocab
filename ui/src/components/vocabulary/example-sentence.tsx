import IconamoonArrowRight1Bold from '~icons/iconamoon/arrow-right-1-bold'

import type { Sentence, WordLocator } from '@/lib/LabeledTire'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function ExampleSentence({
  sentences,
  src,
  className = '',
  onSentenceTrack,
}: {
  sentences: Sentence[]
  src?: WordLocator[]
  className?: string
  onSentenceTrack: (sentenceId: number) => void
}) {
  const vocabPositions: [number, [number, number][]][] = []
  const srcSorted = [...src ?? []].sort((a, b) => a.sentenceId - b.sentenceId || a.startOffset - b.startOffset)

  for (const { sentenceId, startOffset, wordLength } of srcSorted) {
    if (vocabPositions.length === 0) {
      vocabPositions.push([sentenceId, [[startOffset, wordLength]]])
      continue
    }

    const adjacentSentence = vocabPositions[vocabPositions.length - 1]
    if (!adjacentSentence)
      continue

    const adjacentSentenceIndex = adjacentSentence[0]
    const areCurrentAndAdjacentInTheSameSentence = sentenceId === adjacentSentenceIndex
    if (areCurrentAndAdjacentInTheSameSentence)
      adjacentSentence[1].push([startOffset, wordLength])

    else
      vocabPositions.push([sentenceId, [[startOffset, wordLength]]])
  }

  return (
    <div className={cn('mb-1 ml-2 mr-3 flex flex-col gap-[.5px] text-[.8125rem] leading-[var(--leading)] tracking-wide text-neutral-600 [--leading:1.125rem]', className)}>
      {vocabPositions.map(([no, wordIndexes], index) => {
        let progress = 0
        const sentence = sentences[no]?.text ?? ''
        return (
          <div
            key={no}
            className="group flex items-stretch gap-1 break-words transition-colors duration-150 [word-break:break-word] hover:text-black dark:text-slate-500 dark:hover:text-slate-300"
          >
            <Button
              variant="ghost"
              className="group/button flex h-auto min-w-[var(--leading)] items-start p-0 opacity-0 transition-opacity delay-100 group-hover:opacity-100"
              onClick={() => onSentenceTrack(no)}
            >
              <div className="flex size-[var(--leading)] items-center justify-center pl-[.5px]">
                <IconamoonArrowRight1Bold
                  className="size-[11px]"
                />
              </div>
            </Button>
            <div>
              {wordIndexes.map(([start, count], i) => {
                const oldProgress = progress
                progress = start + count
                return (
                  <span key={start}>
                    <span>
                      {sentence.slice(oldProgress, start)}
                    </span>
                    <span className="text-black underline underline-offset-[.145em] dark:text-slate-300">
                      {sentence.slice(start, progress)}
                    </span>
                  </span>
                )
              })}
              <span>{sentence.slice(progress)}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
