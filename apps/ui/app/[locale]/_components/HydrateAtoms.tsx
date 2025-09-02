'use client'

import type { User } from '@supabase/supabase-js'

import { useHydrateAtoms } from 'jotai/utils'

import type { ColorModeValue } from '@/components/themes'

import { colorModeSettingAtom } from '@/atoms'
import { userAtom } from '@/atoms/auth'

export const HydrateAtoms = ({
  colorModeSetting,
  user,
  children,
}: {
  colorModeSetting: ColorModeValue
  user: User | undefined
  children: React.ReactNode
}) => {
  useHydrateAtoms([
    [colorModeSettingAtom, colorModeSetting],
    [userAtom, user],
  ])
  return children
}
