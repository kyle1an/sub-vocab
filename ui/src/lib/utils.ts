import type React from 'react'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { QueryClient } from '@tanstack/react-query'

export function sortByChar(a: string, b: string) {
  return a.localeCompare(b, 'en', { sensitivity: 'base' })
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function onPromise<T>(
  // used to wrap react-hook-forms's submit handler
  // https://github.com/react-hook-form/react-hook-form/discussions/8020#discussioncomment-3429261
  promise: (event: React.SyntheticEvent) => Promise<T>,
) {
  return (event: React.SyntheticEvent) => {
    if (promise) {
      promise(event).catch((error) => {
        console.error('Unexpected error', error)
      })
    }
  }
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 60 * (60 * 1000),
      staleTime: 45 * (60 * 1000),
    },
  },
})
