import { clsx } from 'clsx/lite'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: unknown[]) {
  const classNames = inputs.filter(
    (input) => typeof input !== 'function',
  ) as string[]

  return twMerge(clsx(...classNames))
}
