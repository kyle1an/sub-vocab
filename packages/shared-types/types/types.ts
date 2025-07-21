import type { ConditionalPick } from 'type-fest'

// https://stackoverflow.com/a/67452316
// https://stackoverflow.com/a/60142095
export type Entries<T> = Entry<T>[]

export type Entry<T> = NonNullable<{
  [K in keyof T]: [keyof ConditionalPick<Required<T>, Required<T>[K]>, Required<T>[K]]
}[keyof T]>
