import { Icon } from '@/components/ui/icon'
import { LEARNING_PHASE } from '@/lib/LabeledTire.ts'
import { cn } from '@/lib/utils'
import type { LabelDisplayTable } from '@/lib/vocab'

export function VocabToggle<T extends LabelDisplayTable>({
  row: {
    vocab,
  },
  onToggle,
  className = '',
}: {
  row: {
    vocab: T
  }
  onToggle: (arg: T) => void
  className?: string
}) {
  const phase = vocab.learningPhase
  const {
    NEW, ACQUAINTING, ACQUAINTED, REMOVING,
  } = LEARNING_PHASE
  return (
    <div className={cn('flex w-[calc(28px+.1px)] justify-center', className)}>
      <button
        type="button"
        aria-label="Toggle vocabulary state"
        disabled={phase === ACQUAINTING || phase === REMOVING}
        className={cn(
          'group/tgl inline-flex size-6 max-h-full grow-0 items-center justify-center whitespace-nowrap rounded-full border p-[5px] text-center align-middle text-xs/3 transition-colors [&:not(:disabled)]:cursor-pointer [&:not(:disabled)]:active:scale-95',
          phase === NEW && 'border-zinc-300 bg-transparent dark:border-zinc-600',
          phase === ACQUAINTING && 'border-transparent bg-amber-300/60 text-white dark:bg-amber-300/60 dark:text-black',
          phase === ACQUAINTED && 'border-amber-300 bg-amber-300 text-white hover:bg-amber-300/80 dark:text-black dark:hover:bg-amber-300/80',
          phase === REMOVING && 'border-amber-300/80 bg-amber-300/10 text-black dark:border-amber-300/60 dark:bg-amber-300/10 dark:text-zinc-300',
          className,
        )}
        onClick={() => {
          onToggle(vocab)
        }}
      >
        <Icon
          icon="lucide:loader"
          className={cn(
            'inline-flex w-full animate-spin items-center justify-center duration-2000',
            (phase === NEW || phase === ACQUAINTED) && 'hidden',
          )}
        />
        <Icon
          icon="lucide:check"
          className={cn(
            'inline-flex w-full items-center justify-center',
            (phase === ACQUAINTING || phase === REMOVING) && 'hidden',
            phase === NEW && 'text-transparent transition-colors duration-200 group-hover/tgl:text-black dark:group-hover/tgl:text-zinc-400',
          )}
        />
      </button>
    </div>
  )
}
