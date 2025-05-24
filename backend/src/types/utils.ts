import type { z } from 'zod'

export type ZodObj<T extends Record<PropertyKey, unknown>> = {
  [key in keyof T]: z.ZodType<T[key]>
}
