import type { AtomFamily } from 'jotai/vanilla/utils/atomFamily'

import { useResizeObserver } from '@react-hookz/web'
import { clone, identity } from 'es-toolkit'
import { useEffect, useRef, useState } from 'react'

const DOM_RECT: Omit<DOMRect, 'toJSON'> = { x: 0, y: 0, width: 0, height: 0, top: 0, right: 0, bottom: 0, left: 0 }

export function useRect<T extends Element>(target: React.RefObject<T | null>) {
  const [rect, setRect] = useState(DOM_RECT)
  useResizeObserver(target, (entry) => {
    const { top, right, bottom, left, width, height, x, y } = entry.target.getBoundingClientRect()
    setRect({ top, right, bottom, left, width, height, x, y })
  })
  return rect
}

export function useLastTruthy<T>(value: T) {
  const lastTruthy = useRef<T>(value)
  useEffect(() => {
    if (lastTruthy.current !== value && value) {
      lastTruthy.current = value
    }
  }, [value])
  return () => value || lastTruthy.current
}

// https://github.com/reactwg/react-compiler/discussions/18
export const useIdentity = identity

function call<Param, AtomType>(family: AtomFamily<Param, AtomType>, param: Param): AtomType
function call<A extends any[], R>(fn: (...args: A) => R, ...args: A): R
function call<A extends any[], R>(fn: (...args: A) => R, ...args: A): R {
  return fn(...args)
}

export const useCall = call

export const useClone = clone
