import type { Simplify } from 'type-fest'

import { isUndefined, omitBy } from 'es-toolkit'

type RemoveUndefinedFields<T> = Simplify<{
  [K in keyof T as undefined extends T[K] ? K : never]?: Exclude<T[K], undefined>;
} & {
  [K in keyof T as undefined extends T[K] ? never : K]: T[K];
}>

export function omitUndefined<const T extends object>(obj: T) {
  return omitBy(obj, isUndefined) as RemoveUndefinedFields<T>
}
