import type { ClassArray, ClassDictionary, ClassValue } from 'clsx/lite'

import { clsx } from 'clsx/lite'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: Exclude<ClassValue, ClassArray | ClassDictionary>[]) {
  return twMerge(clsx(...inputs))
}
