import { useIsOnline } from 'foxact/use-is-online'
import { toast } from 'sonner'

import { useUserWordPhaseMutation } from '@/api/vocab-api'
import { LoginToast } from '@/components/login-toast'
import { sessionAtom } from '@/store/useVocab'

import type { VocabState } from '../lib/LabeledTire'

export function useVocabToggle() {
  const { mutateAsync: userWordPhaseMutation } = useUserWordPhaseMutation()
  const [session] = useAtom(sessionAtom)
  const user = session?.user
  const isOnline = useIsOnline()
  return <T extends VocabState>(vocab: T) => {
    if (!user) {
      toast(<LoginToast />)
      return
    }

    if (!isOnline) {
      toast('You must be online to save your progress.')
      return
    }

    const rows2Mutate = [vocab].filter((row) => row.word.length <= 32)
    if (rows2Mutate.length === 0) {
      return
    }

    userWordPhaseMutation(rows2Mutate)
      .catch(console.error)
  }
}

export function useAcquaintAll() {
  const { mutateAsync: userWordPhaseMutation } = useUserWordPhaseMutation()
  const [session] = useAtom(sessionAtom)
  const user = session?.user
  return <T extends VocabState>(rows: T[]) => {
    if (!user) {
      toast(<LoginToast />)
      return
    }

    userWordPhaseMutation(rows)
      .catch(console.error)
  }
}
