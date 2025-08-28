import type { ExtractAtomValue } from 'jotai'

import { atomWithStorage } from 'jotai/utils'

import { SUPPORTED_FILE_EXTENSIONS } from '@/lib/filesHandler'

export const fileTypesAtom = atomWithStorage(
  'fileTypesAtom',
  SUPPORTED_FILE_EXTENSIONS.sort((a, b) => a.localeCompare(b)).map((type) => ({
    type,
    checked: true,
  })),
)

export type FileType = ExtractAtomValue<typeof fileTypesAtom>[1]
