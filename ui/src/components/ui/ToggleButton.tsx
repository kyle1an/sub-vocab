import { Icon } from '@iconify/react'
import { LEARNING_PHASE } from '@/lib/LabeledTire.ts'
import { cn } from '@/lib/utils'
import type { LabelDisplayTable } from '@/components/vocab'

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
      disabled={updating}
      className={cn(
        'box-border inline-flex h-6 max-h-full w-6 grow-0 items-center justify-center whitespace-nowrap rounded-full border p-[5px] text-center align-middle text-xs/3 transition-colors active:scale-95 [&:not(:disabled)]:cursor-pointer',
        learningPhase === LEARNING_PHASE.ACQUAINTED || learningPhase === LEARNING_PHASE.REMOVING ? 'border-amber-300 bg-amber-300 text-white' : 'border-zinc-300',
        learningPhase === LEARNING_PHASE.ACQUAINTED && 'hover:bg-yellow-300 focus:bg-yellow-300 active:bg-yellow-200',
        learningPhase === LEARNING_PHASE.NEW && 'bg-transparent text-transparent hover:text-black active:bg-yellow-100',
        learningPhase === LEARNING_PHASE.ACQUAINTING && 'text-black',
        learningPhase === LEARNING_PHASE.REMOVING && 'bg-yellow-200',
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
