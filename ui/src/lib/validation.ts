import { z } from 'zod'

export const inputNameSchema = z.string()
  .min(1, { message: 'Please input name' })

export const usernameSchema = inputNameSchema
  .min(2, { message: 'NameLimitMsg' })
  .max(20, { message: 'Please use a shorter name' })

export const inputPasswordSchema = z.string()
  .min(1, { message: 'Please input the password' })
