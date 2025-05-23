import type { SortDirection } from '@tanstack/react-table'

import { Slot } from '@radix-ui/react-slot'
import clsx from 'clsx'
import IconCodiconBlank from '~icons/codicon/blank'
import IconLucideChevronUp from '~icons/lucide/chevron-up'

import { cn } from '@/lib/utils'

export function SortIcon({
  isSorted,
  className = '',
  fallback,
}: {
  isSorted: SortDirection | false
  className?: string
  fallback?: React.ReactNode
}) {
  fallback = fallback ?? <IconCodiconBlank />
  return (
    <div className="relative size-4 text-zinc-400">
      <div
        className={clsx(
          'absolute inset-0 transition-all duration-300 [transform-style:preserve-3d]',
          isSorted === 'asc' && '[transform:rotateX(0deg)]',
          isSorted === 'desc' && '[transform:rotateX(180deg)]',
          !isSorted && 'opacity-0',
        )}
      >
        <IconLucideChevronUp
          className={cn('size-4', className)}
        />
      </div>
      <div
        className={clsx(
          'absolute inset-0 transition-all duration-300 [transform-style:preserve-3d]',
          isSorted && 'opacity-0',
        )}
      >
        <Slot
          className={cn('size-4', className)}
        >
          {fallback}
        </Slot>
      </div>
    </div>
  )
}
