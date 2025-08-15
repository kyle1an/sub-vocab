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

export type AppendParameters<T extends (...args: any) => any, A extends UnknownArray> = (...arg: ArrayConcat<Parameters<T>, A>) => ReturnType<T>

// https://www.reddit.com/r/typescript/comments/s1rdbp/comment/ihh0hyx/
export function hasKey<T extends string>(obj: unknown, key: T): obj is { [key in T]: unknown } {
  return Boolean(typeof obj === 'object' && obj && key in obj)
}

export const normalizeNewlines = (inputText: string) => inputText.replace(/\r\n?/g, '\n')

export function normalizeThemeColor(color: string) {
  if (color === 'rgb(0, 0, 0)') {
    return 'rgb(1,1,1)'
  } else if (color === 'rgb(255, 255, 255)') {
    return 'rgb(254,254,254)'
  }
  return color
}

export function isRegexValid(pattern: string) {
  try {
    return new RegExp(pattern)
  } catch (e) {
    return false
  }
}

export function arrayCompare<
  const A extends readonly number[],
  const B extends readonly number[] & { length: A['length'] },
>(a: A, b: B) {
  const len = Math.min(a.length, b.length)

  for (let i = 0; i < len; i++) {
    // If we find a difference at any index, we can return it immediately.
    const diff = a[i]! - b[i]!
    if (diff !== 0) {
      return diff
    }
  }

  // If all common elements are the same, the longer array is "greater".
  return a.length - b.length
}

export function compareBy<T>(map: (i: T) => number[], order: -1 | 1 = 1) {
  return (a: T, b: T) => {
    return arrayCompare(map(a), map(b)) * order
  }
}

export function equalBy<T>(map: (i: T) => any) {
  return (a: T, b: T) => {
    return map(a) === map(b)
  }
}
