import { useClipboard } from 'foxact/use-clipboard'
import ms from 'ms'

import type { Sentence } from '@/app/[locale]/(vocabulary)/_lib/LexiconTrie'
import type { WordOccurrencesInSentence } from '@/app/[locale]/(vocabulary)/_lib/vocab'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function SentenceCopy({
  sentence,
}: {
  sentence: string
}) {
  const { copy, copied, error } = useClipboard({
    timeout: ms('1s'),
  })
  return (
    <Button
      variant="ghost"
      className={cn(
        'inline-flex size-(--leading) h-[unset] items-start p-0',
      )}
      onClick={() => copy(sentence)}
    >
      <div className="flex size-(--leading) items-center justify-center *:size-[11px]!">
        <svg
          className={cn('icon-[mingcute--check-fill]', copied ? '' : 'hidden')}
        />
        <svg
          className={cn('icon-[bx--bxs-error-circle] text-red-500', error ? '' : 'hidden')}
        />
        <svg
          className={cn('icon-[ooui--copy-ltr] opacity-0 transition-opacity delay-50 duration-100 in-data-[state=open]:group-hover:opacity-100', copied || error ? 'hidden' : '')}
        />
      </div>
    </Button>
  )
}

export function ExampleSentence({
  sentences,
  wordOccurrences,
  className = '',
  onSentenceTrack,
}: {
  sentences: Sentence[]
  wordOccurrences: WordOccurrencesInSentence[]
  className?: string
  onSentenceTrack: (sentenceId: number) => void
}) {
  return (
    <div className={cn('mr-3 mb-1 ml-2 flex flex-col gap-[.5px] text-[.8125rem] leading-(--leading) text-neutral-600 [--leading:1.125rem]', className)}>
      {wordOccurrences.map(({ sentenceId, textSpans }) => {
        let progress = 0
        const sentence = sentences[sentenceId]?.text ?? ''
        return (
          <div
            key={sentenceId}
            className="group flex items-stretch gap-1 wrap-break-word [word-break:break-word] transition-colors duration-150 hover:text-black dark:text-neutral-500 dark:hover:text-neutral-300"
          >
            <Button
              variant="ghost"
              className="flex h-auto min-w-(--leading) items-start p-0 opacity-0 transition-opacity delay-50 duration-100 in-data-[state=open]:group-hover:opacity-100"
              onClick={() => onSentenceTrack(sentenceId)}
            >
              <div className="flex size-(--leading) items-center justify-center pl-[.5px]">
                <svg
                  className="icon-[iconamoon--arrow-right-1-bold] size-[11px]"
                />
              </div>
            </Button>
            <div>
              {textSpans.map(({ startOffset, wordLength }) => {
                const oldProgress = progress
                progress = startOffset + wordLength
                return (
                  <span key={startOffset}>
                    <span>
                      {sentence.slice(oldProgress, startOffset)}
                    </span>
                    <span className="text-black underline underline-offset-[.145em] dark:text-neutral-300">
                      {sentence.slice(startOffset, progress)}
                    </span>
                  </span>
                )
              })}
              <span>{sentence.slice(progress)}</span>
              <div className="inline-flex h-lh items-center justify-center pl-1 align-bottom">
                <SentenceCopy
                  sentence={sentence}
                />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
