import type { StyleObserverCallback, StyleObserverChanges, StyleObserverConfig } from '@bramus/style-observer'
import type { ArrayValues, OverrideProperties, ValueOf } from 'type-fest'

import StyleObserver, { NotificationMode, ReturnFormat } from '@bramus/style-observer'
import { useSyncedRef } from '@react-hookz/web'
import { useEffect } from 'react'

type StyleObserverChangeObject = Exclude<ValueOf<StyleObserverChanges>, string>

type GenericStyleObserverChangeObject<T extends HTMLElement> = OverrideProperties<StyleObserverChangeObject, {
  previousValue: string | undefined
  element: T
}>

type GenericStyleObserverCallback<T extends HTMLElement, Prop extends string, Format extends ReturnFormat> = Format extends ReturnFormat.VALUE_ONLY
  ? (values: Readonly<Record<Prop, string>>) => void
  : (values: Readonly<Record<Prop, GenericStyleObserverChangeObject<T>>>) => void

interface GenericStyleObserverConfig<Props extends string[], Format extends ReturnFormat> extends StyleObserverConfig {
  properties: Props
  returnFormat?: Format
}

export const useStyleObserver = <
  T extends HTMLElement,
  const Props extends string[],
  Format extends ReturnFormat = ReturnFormat.OBJECT,
>(
  target: React.RefObject<T | null> | T,
  callback: GenericStyleObserverCallback<T, ArrayValues<Props>, Format>,
  config: GenericStyleObserverConfig<Props, Format>,
) => {
  const cb = useSyncedRef(callback as StyleObserverCallback)
  const tgt = target && 'current' in target ? target.current : target
  useEffect(() => {
    const tgt = target && 'current' in target ? target.current : target
    if (!tgt) {
      return
    }
    const observer = new StyleObserver(cb.current, {
      returnFormat: ReturnFormat.OBJECT,
      notificationMode: NotificationMode.ALL,
      ...config,
    })
    observer.observe(tgt)
    return () => {
      observer.unobserve(tgt)
    }
  }, [cb, config, target, tgt])
}
