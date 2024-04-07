import { create } from 'zustand'
import Cookies from 'js-cookie'

type Store = {
  username: string
  setUsername: (name: string) => void
}

const initialState = {
  username: Cookies.get('_user') ?? '',
}

export const useVocabStore = create<Store>()(
  (set) => ({
    ...initialState,
    setUsername: (username) => {
      set((state) => ({
        username,
      }))
    },
  }),
)
