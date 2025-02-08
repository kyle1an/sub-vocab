import type { ArraySplice, ConditionalKeys, Simplify, UnknownArray, ValueOf } from 'type-fest'

import { isUndefined, omitBy } from 'es-toolkit'

type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
}

type RemoveNeverFields<T> = Omit<T, ConditionalKeys<Required<T>, never>>

type RemoveUndefinedFields<T> = Simplify<RemoveNeverFields<Mutable<{
  [K in keyof T as undefined extends T[K] ? K : never]?: Exclude<T[K], undefined>;
} & {
  // eslint-disable-next-line ts/no-unsafe-function-type
  [K in keyof T as undefined extends T[K] ? never : K]: T[K] extends Function ? T[K] : Mutable<T[K]> ;
}>>>

export function omitUndefined<const T extends object>(obj: T) {
  return omitBy(obj, isUndefined) as RemoveUndefinedFields<T>
}

export function findClosest(goal: number, nums: readonly number[]) {
  return nums.reduce((prev, curr) => {
    return Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev
  })
}

// https://stackoverflow.com/a/14879700/10903455
export function naturalNumLength(num: number) {
  return Math.log(num) * Math.LOG10E + 1 | 0
}

export type FallBack<M, U> = Simplify<ValueOf<M> | Exclude<U, keyof M>>

export function getFallBack<P extends string, T extends Record<string, string>>(key: P, map: T) {
  return (map[key] ?? key) as FallBack<T, P>
}

export type ArrayConcat<T extends UnknownArray, Item extends UnknownArray> = ArraySplice<T, T['length'], 0, Item>
