import clsx from 'clsx'
import { useClipboard } from 'foxact/use-clipboard'
import ms from 'ms'
import { useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function VocabularyMenu({
  tabIndex,
  word,
}: {
  tabIndex?: number
  word: string
}) {
  const { copy, copied, error } = useClipboard({
    timeout: ms('1s'),
  })
  return (
    <Button
      aria-label={`Copy ${word}`}
      tabIndex={tabIndex}
      variant="ghost"
      className={cn(
        'size-full min-w-(--leading) flex-wrap content-center items-start p-0 [--sq-r:.5rem]',
      )}
      onClick={() => copy(word)}
    >
      <div className="flex size-(--leading) items-center justify-center *:size-3!">
        <svg
          className={cn('icon-[mingcute--check-fill]', copied ? '' : 'hidden')}
        />
        <svg
          className={cn('icon-[bx--bxs-error-circle] text-red-500', error ? '' : 'hidden')}
        />
        <svg
          className={cn('icon-[ooui--copy-ltr] transition-opacity delay-50 duration-100 group-hover:opacity-100', copied || error ? 'hidden' : '')}
        />
      </div>
    </Button>
  )
}

export function VocabularyWordAction({
  isMuted,
  word,
}: {
  isMuted: boolean
  word: string
}) {
  const rootRef = useRef<HTMLSpanElement>(null)
  const [open, setOpen] = useState(false)
  const [placement, setPlacement] = useState<'inline' | 'top'>('top')

  function openAction() {
    const root = rootRef.current
    const tableHead = root?.closest('table')?.querySelector('thead')

    if (root && tableHead) {
      const { top } = root.getBoundingClientRect()
      const { bottom } = tableHead.getBoundingClientRect()

      setPlacement(top - 24 <= bottom + 2 ? 'inline' : 'top')
    }

    setOpen(true)
  }

  return (
    <span
      ref={rootRef}
      className="relative inline-block cursor-text pl-1 tracking-[.04em] select-text"
      onBlurCapture={(event) => {
        const nextFocusTarget = event.relatedTarget
        if (!(nextFocusTarget instanceof Node) || !event.currentTarget.contains(nextFocusTarget)) {
          setOpen(false)
        }
      }}
      onClick={(event) => event.stopPropagation()}
      onFocusCapture={openAction}
      onMouseEnter={openAction}
      onMouseLeave={() => setOpen(false)}
      onPointerEnter={openAction}
      onPointerLeave={() => setOpen(false)}
    >
      <span
        className={clsx(
          'rounded-lg px-1 py-0.5 transition-colors delay-100 hover:bg-background-focus',
          isMuted ? 'text-neutral-500 dark:text-neutral-400' : '',
        )}
      >
        {word}
      </span>
      <span
        aria-hidden={!open}
        className={clsx(
          'absolute z-999999999 flex size-6 justify-center rounded-md border bg-popover p-0.5 text-popover-foreground shadow-md transition-opacity duration-100 ease-out',
          placement === 'inline' ? 'top-1/2 left-[calc(100%+2px)] -translate-y-1/2' : 'right-0 bottom-[calc(100%-2px)]',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      >
        <VocabularyMenu
          tabIndex={open ? 0 : -1}
          word={word}
        />
      </span>
    </span>
  )
}
