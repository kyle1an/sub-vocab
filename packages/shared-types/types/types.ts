// https://stackoverflow.com/a/67452316
// https://stackoverflow.com/a/60142095
export type Entries<T> = Entry<T>[]

type PickByValue<T, V> = Pick<T, { [K in keyof T]: T[K] extends V ? K : never }[keyof T]>

export type Entry<T> = NonNullable<{
  [K in keyof T]: [keyof PickByValue<Required<T>, Required<T>[K]>, Required<T>[K]]
}[keyof T]>

export type AnyFunc = (...args: any) => any

// from ts-toolbelt `F.Narrow`
type Narrowable = string | number | bigint | boolean
export type NarrowRaw<A> = (A extends [] ? [] : never) | (A extends Narrowable ? A : never) | ({
  [K in keyof A]: A[K] extends AnyFunc ? A[K] : NarrowRaw<A[K]>;
})

export type NarrowShallow<A> = (A extends [] ? [] : never) | (A extends Narrowable ? A : never) | ({
  [K in keyof A]: A[K] extends Narrowable ? NarrowRaw<A[K]> : A[K];
})

export type NonArrayObject = object & { [Symbol.iterator]?: never }
