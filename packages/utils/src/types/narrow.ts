import type { NarrowRaw, NarrowShallow } from '@sub-vocab/shared-types/types'

export const narrow = <T>(t: NarrowRaw<T>) => t

export const narrowShallow = <T>(t: NarrowShallow<T>) => t
