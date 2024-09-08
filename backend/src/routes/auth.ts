import type { AuthError, AuthTokenResponsePassword } from '@supabase/supabase-js'
import type { Request, Response } from 'express'

import express from 'express'

import type { Credential } from '../../../ui/src/shared/api.js'

import { sql, supabase } from '../utils/db.js'

type ParamsDictionary = Record<string, string>

const router = express.Router()

router.post('/sign-in', async (req: Request<ParamsDictionary, any, Credential>, res: Response<AuthTokenResponsePassword>) => {
  const { username, password } = req.body
  const rows = await sql<[{ email: string }]>`
SELECT
  u.email
FROM
  public.profiles p
  JOIN auth.users u ON u.id = p.id
WHERE
  p.username = ${username}
LIMIT
  1;
`.catch((error) => {
    console.error('Error in /sign-in:', error)
  })

  if (rows && rows.length >= 1) {
    const [{ email }] = rows
    const authResponse = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    res.json(authResponse)
    return
  }
  res.json({
    data: {
      user: null,
      session: null,
      weakPassword: null,
    },
    error: {
      message: 'Invalid username or password.',
    } as AuthError,
  })
})

export default router
