import type { MergeDeep } from 'type-fest'

import '@sub-vocab/shared-types'

declare module 'es-toolkit' {
  export function merge<T extends Record<PropertyKey, any>, S extends Record<PropertyKey, any>>(target: T, source: S): MergeDeep<T, S>
}

export {}
