import type * as React from 'react'
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

export function setMetaThemeColorAttribute(newThemeColor: string) {
  const metaThemeColorEl = document.querySelector('meta[name="theme-color"]')
  if (
    metaThemeColorEl
    && (
      newThemeColor === 'transparent'
      || newThemeColor === 'black'
      || !document.querySelector('[vaul-drawer][data-state="open"]')
    )
  ) {
    if (metaThemeColorEl.getAttribute('content') !== newThemeColor) {
      metaThemeColorEl.setAttribute('content', newThemeColor)
    }
  }
}

// https://stackoverflow.com/a/13382873/10903455
export function getScrollbarWidth() {
  // Creating invisible container
  const outer = document.createElement('div')
  outer.style.visibility = 'hidden'
  outer.style.overflow = 'scroll' // forcing scrollbar to appear
  // @ts-expect-error
  outer.style.msOverflowStyle = 'scrollbar' // needed for WinJS apps
  document.body.appendChild(outer)

  // Creating inner element and placing it in the container
  const inner = document.createElement('div')
  outer.appendChild(inner)

  // Calculating difference between container's full width and the child width
  const scrollbarWidth = (outer.offsetWidth - inner.offsetWidth)

  // Removing temporary elements from the DOM
  outer.parentNode?.removeChild(outer)

  return scrollbarWidth
}
