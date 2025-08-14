import type { NonEmptyArray } from 'effect/Array'
import type { MergeDeep, PartialDeep, SetNonNullable } from 'type-fest'

import { merge } from 'es-toolkit'

export const createFactory = <T extends object>() => <TDefault extends PartialDeep<T>>(getDefaults: () => TDefault) => {
  function build(): TDefault
  function build<TOverrides extends PartialDeep<T>>(overrides: TOverrides): MergeDeep<TDefault, TOverrides>
  function build<TOverrides extends PartialDeep<T>>(overrides?: TOverrides) {
    return !overrides ? getDefaults() : merge(getDefaults(), overrides)
  }

  return build
}

export const hasValue = <T extends [any, any]>(entry: T): entry is SetNonNullable<T, '1'> => entry[1]

export const isNonEmptyArray = <T>(arr: T[]): arr is NonEmptyArray<T> => arr.length > 0

export const isSingleItemArray = <T>(arr: ArrayLike<T>): arr is [T] => arr.length === 1

export function tap<T>(fn: (a: T) => void | undefined) {
  return (a: T) => {
    fn(a)
    return a
  }
}
