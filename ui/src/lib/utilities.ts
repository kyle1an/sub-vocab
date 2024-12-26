import type { Simplify } from 'type-fest'

import { isUndefined, omitBy } from 'es-toolkit'

type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
}

type RemoveUndefinedFields<T> = Simplify<Mutable<{
  [K in keyof T as undefined extends T[K] ? K : never]?: Exclude<T[K], undefined>;
} & {
  [K in keyof T as undefined extends T[K] ? never : K]: Mutable<T[K]>;
}>>

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
