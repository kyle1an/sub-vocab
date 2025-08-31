import type { SortDirection } from '@tanstack/react-table'

import { Slot } from '@radix-ui/react-slot'
import clsx from 'clsx'

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
  fallback = fallback ?? <svg className="icon-[codicon--blank]" />
  return (
    <div className="relative size-4 text-zinc-400">
      <div
        className={clsx(
          'absolute inset-0 transition-transform duration-300 transform-3d',
          isSorted === 'asc' && '[transform:rotateX(0deg)]',
          isSorted === 'desc' && '[transform:rotateX(180deg)]',
          !isSorted && '[transform:rotateX(90deg)] opacity-0',
        )}
      >
        <svg
          className={cn('icon-[lucide--chevron-up] size-full align-bottom', className)}
        />
      </div>
      <div
        className={clsx(
          'absolute inset-0 transition-transform duration-300 transform-3d',
          isSorted && 'opacity-0',
        )}
      >
        <Slot
          className={cn('size-full align-bottom', className)}
        >
          {fallback}
        </Slot>
      </div>
    </div>
  )
}
