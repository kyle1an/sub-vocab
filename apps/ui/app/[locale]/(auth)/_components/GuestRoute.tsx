'use client'

import type React from 'react'

import { useAtom } from 'jotai'

import { authChangeEventAtom, userAtom } from '@/atoms/auth'
import Navigate from '@/components/Navigate'

export function GuestRoute({ children }: { children: React.ReactNode }) {
  const [user] = useAtom(userAtom)
  const [authChangeEvent] = useAtom(authChangeEventAtom)
  if (!authChangeEvent) {
    return null
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return children
}
