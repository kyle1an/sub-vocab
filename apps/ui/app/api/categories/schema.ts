import { z } from 'zod/v4-mini'

export const categorySchema = z.object({
  properName: z.array(z.string()),
  acronym: z.array(z.string()),
})
