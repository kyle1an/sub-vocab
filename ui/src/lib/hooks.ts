import { useEffect, useRef } from 'react'
import { atom } from 'jotai'

export function syncAtomWithStorage<T>(key: string, initialValue: T) {
  const stringAtom = atom(localStorage.getItem(key) ?? initialValue)

  const strAtomWithPersistence = atom(
    (get) => get(stringAtom),
    (get, set, newString: T) => {
      set(stringAtom, newString)
      localStorage.setItem(key, String(newString))
    },
  )

  return strAtomWithPersistence
}

export function useComponentWillUnmount(cleanupCallback = () => { }) {
  const callbackRef = useRef(cleanupCallback)
  callbackRef.current = cleanupCallback
  useEffect(() => {
    return () => callbackRef.current()
  }, [])
}
