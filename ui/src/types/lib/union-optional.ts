import type { KeysOfUnion, Simplify } from 'type-fest'

type UnionOptionalInner<BaseType extends object, EveryKey extends KeysOfUnion<BaseType> = KeysOfUnion<BaseType>> = Simplify<
  // 1. For each member of the union (Note: `T extends any` is distributive)
  BaseType extends object
    ? (
  // 2. Preserve the original type
      & BaseType
        // 3. And map other keys to `{ key?: undefined }`
      & { [K in Exclude<EveryKey, keyof BaseType>]?: undefined }
      )
    : never
>

export type UnionOptional<BaseType extends object> = UnionOptionalInner<BaseType>

export function unionOptional<T extends object>(obj: T) {
  return obj as UnionOptional<T>
}
