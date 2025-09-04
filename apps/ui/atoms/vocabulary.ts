import { atom } from 'jotai'

export const fileInfoAtom = atom('')
export const sourceTextAtom = atom({
  value: '',
  epoch: 0,
})
