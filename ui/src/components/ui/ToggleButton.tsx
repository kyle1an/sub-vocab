import { Icon } from '@/components/ui/icon'
import { LEARNING_PHASE } from '@/lib/LabeledTire.ts'
import { cn } from '@/lib/utils'
import type { LabelDisplayTable } from '@/lib/vocab'

export function VocabToggle<T extends LabelDisplayTable>({
  row: {
    vocab,
  },
  onToggle,
}: {
  row: {
    vocab: T
  }
  onToggle: (arg: T) => void
}) {
  const { learningPhase } = vocab
  const updating = learningPhase === LEARNING_PHASE.ACQUAINTING || learningPhase === LEARNING_PHASE.REMOVING
  return (
    <button
      type="button"
      aria-label="Toggle vocabulary state"
      disabled={updating}
      className={cn(
        'box-border inline-flex size-6 max-h-full grow-0 items-center justify-center whitespace-nowrap rounded-full border p-[5px] text-center align-middle text-xs/3 transition-colors active:scale-95 [&:not(:disabled)]:cursor-pointer',
        learningPhase === LEARNING_PHASE.ACQUAINTED || learningPhase === LEARNING_PHASE.REMOVING ? 'border-amber-300 bg-amber-300 text-white dark:text-black' : 'border-zinc-300 dark:border-zinc-600',
        learningPhase === LEARNING_PHASE.ACQUAINTED && 'hover:bg-yellow-300 focus:bg-yellow-300 active:bg-yellow-200 dark:hover:bg-yellow-400 dark:focus:bg-yellow-500 dark:active:bg-yellow-500',
        learningPhase === LEARNING_PHASE.NEW && 'bg-transparent text-transparent hover:text-black active:bg-yellow-100 dark:hover:text-zinc-400 dark:active:bg-yellow-500',
        learningPhase === LEARNING_PHASE.ACQUAINTING && 'text-black',
        learningPhase === LEARNING_PHASE.REMOVING && 'bg-yellow-200 dark:bg-yellow-500',
      )}
      onClick={() => {
        onToggle(vocab)
      }}
    >
      <Icon
        icon="lucide:loader"
        className={cn('inline-flex w-full animate-spin items-center justify-center duration-2000', updating ? '' : 'hidden')}
      />
      <Icon
        icon="lucide:check"
        className={cn('inline-flex w-full items-center justify-center', !updating ? '' : 'hidden')}
      />
    </button>
  )
}
