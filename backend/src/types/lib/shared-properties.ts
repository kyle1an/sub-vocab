// https://stackoverflow.com/a/68416189
/**
 * Omits properties that have type `never`. Utilizes key-remapping introduced in
 * TS4.1.
 *
 * @example
 * ```ts
 * type A = { x: never; y: string; }
 * OmitNever<A> // => { y: string; }
 * ```
 */
type OmitNever<T extends Record<string, unknown>> = {
  [K in keyof T as T[K] extends never ? never : K]: T[K];
}

/**
 * Constructs a Record type that only includes shared properties between `A` and
 * `B`. If the value of a key is different in `A` and `B`, `SharedProperties<A,
 * B>` attempts to choose a type that is assignable to the types of both values.
 *
 * Note that this is NOT equivalent to `A & B`.
 *
 * @example
 * ```ts
 * type A = { x: string; y: string; }
 * type B = { y: string; z: string }
 * type C = { y: string | number; }
 *
 * A & B                  // => { x: string; y: string; z: string; }
 * SharedProperties<A, B> // => { y: string; }
 * SharedProperties<B, C> // => { y: string | number; }
 * ```
 */
export type SharedProperties<A, B> = OmitNever<Pick<A & B, keyof A & keyof B>>
