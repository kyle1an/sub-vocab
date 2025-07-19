import { useNetworkState } from '@react-hookz/web'
import { useAtom } from 'jotai'
import { toast } from 'sonner'

import type { WordState } from '@/lib/LabeledTire'

import { useUserWordPhaseMutation } from '@/api/vocab-api'
import { LoginToast } from '@/components/login-toast'
import { sessionAtom } from '@/store/useVocab'

export function useVocabToggle() {
  const { mutateAsync: userWordPhaseMutation } = useUserWordPhaseMutation()
  const [session] = useAtom(sessionAtom)
  const user = session?.user
  const { online: isOnline } = useNetworkState()
  return <T extends WordState>(vocab: T) => {
    if (!user) {
      toast(<LoginToast />)
      return
    }

    if (!isOnline) {
      toast('You must be online to save your progress.')
      return
    }

    const rows2Mutate = [vocab].filter((row) => row.word.length <= 32)
    if (rows2Mutate.length === 0)
      return

    userWordPhaseMutation(rows2Mutate)
      .catch(console.error)
  }
}

export function useAcquaintAll() {
  const { mutateAsync: userWordPhaseMutation } = useUserWordPhaseMutation()
  const [session] = useAtom(sessionAtom)
  const user = session?.user
  return <T extends WordState>(rows: T[]) => {
    if (!user) {
      toast(<LoginToast />)
      return
    }

    userWordPhaseMutation(rows)
      .catch(console.error)
  }
}
