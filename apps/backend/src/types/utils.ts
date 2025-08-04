import type { z } from 'zod'

export type ZodObj<T extends Record<PropertyKey, unknown>> = {
  [K in keyof T]: z.ZodType<T[K]>
}
