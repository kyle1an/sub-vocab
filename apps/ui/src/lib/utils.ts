import type { ClassArray, ClassDictionary, ClassValue } from 'clsx/lite'

import { clsx } from 'clsx/lite'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: Exclude<ClassValue, ClassArray | ClassDictionary>[]) {
  return twMerge(clsx(...inputs))
}

export function setMetaThemeColorAttribute(newThemeColor: string) {
  const metaThemeColorEl = document.querySelector('meta[name="theme-color"]')
  if (metaThemeColorEl) {
    if (metaThemeColorEl.getAttribute('content') !== newThemeColor)
      metaThemeColorEl.setAttribute('content', newThemeColor)
  }
}
