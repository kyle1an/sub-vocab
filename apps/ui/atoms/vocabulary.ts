import { atom } from 'jotai'

export const fileInfoAtom = atom('')
fileInfoAtom.debugLabel = 'fileInfoAtom'
export const sourceTextAtom = atom({
  value: '',
  epoch: 0,
})
sourceTextAtom.debugLabel = 'sourceTextAtom'
