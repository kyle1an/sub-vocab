import { cn } from '@/lib/utils.ts'
import type { WordLocator } from '@/lib/LabeledTire'

export function Examples({
  sentences,
  src = [],
  className = '',
}: {
  sentences: string[]
  src: WordLocator[]
  className?: string
}) {
  const vocabPositions: [number, [number, number][]][] = []
  const srcSorted = [...src].sort((a, b) => a.sentenceId - b.sentenceId || a.startOffset - b.startOffset)

  for (const { sentenceId, startOffset, wordLength } of srcSorted) {
    if (vocabPositions.length === 0) {
      vocabPositions.push([sentenceId, [[startOffset, wordLength]]])
      continue
    }

    const adjacentSentence = vocabPositions[vocabPositions.length - 1]
    if (!adjacentSentence) {
      continue
    }
    const adjacentSentenceIndex = adjacentSentence[0]
    const areCurrentAndAdjacentInTheSameSentence = sentenceId === adjacentSentenceIndex
    if (areCurrentAndAdjacentInTheSameSentence) {
      adjacentSentence[1].push([startOffset, wordLength])
    } else {
      vocabPositions.push([sentenceId, [[startOffset, wordLength]]])
    }
  }

  return (
    <div className={cn('mb-1 ml-5 mr-3 text-sm text-neutral-600', className)}>
      {vocabPositions.map(([no, wordIndexes], index) => {
        let progress = 0
        const sentence = sentences[no] ?? ''
        return (
          <div
            key={no}
            className="break-words transition-colors duration-150 hover:text-black dark:text-slate-500 dark:hover:text-slate-300"
            style={{ wordBreak: 'break-word' }}
          >
            {wordIndexes.map(([start, count], i) => {
              const oldProgress = progress
              progress = start + count
              return (
                <span key={start}>
                  <span>
                    {sentence.slice(oldProgress, start)}
                  </span>
                  <span className="text-black underline underline-offset-[0.145em] dark:text-slate-300">
                    {sentence.slice(start, progress)}
                  </span>
                </span>
              )
            })}
            <span>{sentence.slice(progress)}</span>
          </div>
        )
      })}
    </div>
  )
}
