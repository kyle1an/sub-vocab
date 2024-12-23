import type { z } from 'zod'

// https://github.com/colinhacks/zod/issues/53#issuecomment-1386446580
export type ZodObj<T extends Record<PropertyKey, unknown>> = {
  [key in keyof T]: z.ZodType<T[key]>
}

const cast = <T>(a: any) => a as T
