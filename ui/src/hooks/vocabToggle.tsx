import { toast } from 'sonner'
import { LEARNING_PHASE, type VocabState } from '../lib/LabeledTire'
import { useAcquaintWordsMutation, useRevokeWordMutation } from '@/api/vocab-api'
import { LoginToast } from '@/components/login-toast'
import { useVocabStore } from '@/store/useVocab'

export function useVocabToggle() {
  const { mutateAsync: mutateRevokeWordAsync } = useRevokeWordMutation()
  const { mutateAsync: mutateAcquaintWordsAsync } = useAcquaintWordsMutation()
  const username = useVocabStore((state) => state.username)
  return <T extends VocabState>(vocab: T) => {
    if (!username) {
      toast(<LoginToast />)
      return
    }

    const rows2Mutate = [vocab].filter((row) => row.word.length <= 32)
    if (rows2Mutate.length === 0) {
      return
    }

    if (vocab.learningPhase === LEARNING_PHASE.ACQUAINTED) {
      mutateRevokeWordAsync(rows2Mutate)
        .catch(console.error)
    } else {
      mutateAcquaintWordsAsync(rows2Mutate)
        .catch(console.error)
    }
  }
}

export function useAcquaintAll() {
  const { mutateAsync: mutateAcquaintWordsAsync } = useAcquaintWordsMutation()
  const username = useVocabStore((state) => state.username)
  return <T extends VocabState>(rows: T[]) => {
    if (!username) {
      toast(<LoginToast />)
      return
    }

    mutateAcquaintWordsAsync(rows)
      .catch(console.error)
  }
}
