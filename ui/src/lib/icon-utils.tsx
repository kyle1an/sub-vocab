import type { SortDirection } from '@tanstack/react-table'

import { Slot } from '@radix-ui/react-slot'

export function SortIcon({
  isSorted,
  className = '',
  fallback,
}: {
  isSorted: SortDirection | false
  className?: string
  fallback?: React.ReactNode
}) {
  const iconClassName = cn('absolute inset-0 inline-block size-4 text-zinc-400', className)
  fallback = fallback ?? <IconCodiconBlank />
  return (
    <div className="relative size-4">
      <div
        className={cn(
          'absolute inset-0 transition-all duration-300 [transform-style:preserve-3d]',
          isSorted === 'asc' && '[transform:rotateX(0deg)]',
          isSorted === 'desc' && '[transform:rotateX(180deg)]',
          !isSorted && 'opacity-0',
        )}
      >
        <IconLucideChevronUp
          className={cn(
            iconClassName,
          )}
        />
      </div>
      <div
        className={cn(
          'absolute inset-0 transition-all duration-300 [transform-style:preserve-3d]',
          isSorted && 'opacity-0',
        )}
      >
        <Slot
          className={cn(
            iconClassName,
          )}
        >
          {fallback}
        </Slot>
      </div>
    </div>
  )
}
