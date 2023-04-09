import type { LabelSieveDisplay, MyVocabRow } from '@/types'
import { useVocabStore } from '@/store/useVocab'

function handleVocabToggle(vocab: LabelSieveDisplay) {
  if (vocab.acquainted) {
    useVocabStore().revokeVocab(vocab)
  } else {
    useVocabStore().acquaintEveryVocab([{ vocab }])
  }
}

export function VocabToggle({ row }: { row: MyVocabRow }) {
  return (
    <button
      disabled={row.vocab?.inUpdating}
      class={`${row.vocab?.inUpdating ? '[.un&]:text-black' : ''} ${row.vocab?.acquainted ? 'border-[#facc15] bg-[#facc15] text-white hover:bg-[rgb(252,219,91)] focus:bg-[rgb(252,219,91)]' : 'un border-zinc-300 bg-transparent text-transparent hover:text-black'} box-border inline-flex h-6 max-h-full w-6 grow-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-[50%] border p-[5px] text-center align-middle text-xs/3 tracking-wide transition-colors`}
      onClick={() => handleVocabToggle(row.vocab)}
    >
      <i class={`${row.vocab?.inUpdating ? '' : 'hidden'} relative inline-flex animate-[rotating_2s_linear_infinite] items-center justify-center fill-current leading-[1em] text-inherit`}>
        <svg
          class="h-[1em] w-[1em]"
          viewBox="0 0 1024 1024"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="currentColor"
            d="M512 64a32 32 0 0 1 32 32v192a32 32 0 0 1-64 0V96a32 32 0 0 1 32-32zm0 640a32 32 0 0 1 32 32v192a32 32 0 1 1-64 0V736a32 32 0 0 1 32-32zm448-192a32 32 0 0 1-32 32H736a32 32 0 1 1 0-64h192a32 32 0 0 1 32 32zm-640 0a32 32 0 0 1-32 32H96a32 32 0 0 1 0-64h192a32 32 0 0 1 32 32zM195.2 195.2a32 32 0 0 1 45.248 0L376.32 331.008a32 32 0 0 1-45.248 45.248L195.2 240.448a32 32 0 0 1 0-45.248zm452.544 452.544a32 32 0 0 1 45.248 0L828.8 783.552a32 32 0 0 1-45.248 45.248L647.744 692.992a32 32 0 0 1 0-45.248zM828.8 195.264a32 32 0 0 1 0 45.184L692.992 376.32a32 32 0 0 1-45.248-45.248l135.808-135.808a32 32 0 0 1 45.248 0zm-452.544 452.48a32 32 0 0 1 0 45.248L240.448 828.8a32 32 0 0 1-45.248-45.248l135.808-135.808a32 32 0 0 1 45.248 0z"
          />
        </svg>
      </i>
      <i class={`${row.vocab?.inUpdating ? 'hidden' : ''} relative inline-flex items-center justify-center fill-current leading-[1em] text-inherit`}>
        <svg
          class="h-[1em] w-[1em]"
          viewBox="0 0 1024 1024"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="currentColor"
            d="M406.656 706.944 195.84 496.256a32 32 0 1 0-45.248 45.248l256 256 512-512a32 32 0 0 0-45.248-45.248L406.592 706.944z"
          />
        </svg>
      </i>
    </button>
  )
}
