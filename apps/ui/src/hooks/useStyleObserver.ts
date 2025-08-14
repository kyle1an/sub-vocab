import type { OverrideProperties, SetParameterType } from 'type-fest'

import { useEffect } from 'react'
import StyleObserver from 'style-observer'

import type { NonArrayObject } from '@sub-vocab/shared-types/types'

type StyleObserver_Record = Parameters<ConstructorParameters<typeof StyleObserver>[0]>[0][number]

type StyleObserverCallback = ConstructorParameters<typeof StyleObserver>[0]

type StyleObserverOptionsOrStrings = ConstructorParameters<typeof StyleObserver>[1]

type StyleObserverOptions = Extract<StyleObserverOptionsOrStrings, NonArrayObject>

type GenericStyleObserver_Records<T extends string[]> = {
  [I in keyof T]: OverrideProperties<StyleObserver_Record, {
    property: T[I]
  }>
}

type GenericStyleObserverCallback<Props extends string[]> = SetParameterType<StyleObserverCallback, {
  0: GenericStyleObserver_Records<Props>
}>

type GenericStyleObserverOptions<Props extends string[]> = OverrideProperties<StyleObserverOptions, {
  properties: Props
}>

export const useStyleObserver = <
  T extends HTMLElement,
  const Props extends string[],
>(
  target: React.RefObject<T | null> | T | null,
  callback: GenericStyleObserverCallback<Props>,
  options: GenericStyleObserverOptions<Props>,
) => {
  const tgt = target && 'current' in target ? target.current : target
  useEffect(() => {
    const tgt = target && 'current' in target ? target.current : target
    if (!tgt) {
      return
    }
    const observer = new StyleObserver(callback as StyleObserverCallback, options)
    observer.observe(tgt)
    return () => {
      observer.unobserve(tgt)
    }
  }, [callback, options, target, tgt])
}
