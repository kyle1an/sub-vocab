import { create } from 'zustand'
import Cookies from 'js-cookie'
import type { VocabState } from '@/lib/LabeledTire'

interface BearState {
  username: string
  setUsername: (by: string) => void
  subSourceText: string
  setSubSourceText: (by: string) => void
  usersVocabulary: VocabState[]
  setUsersVocabulary: (by: VocabState[]) => void
}

export const useBearStore = create<BearState>()((set) => ({
  username: Cookies.get('_user') ?? '',
  setUsername: (by) => set((state) => ({ username: by })),
  subSourceText: '',
  setSubSourceText: (by) => set((state) => ({ subSourceText: by })),
  usersVocabulary: [],
  setUsersVocabulary: (vocabStates) => set((state) => ({ usersVocabulary: vocabStates })),
}))
