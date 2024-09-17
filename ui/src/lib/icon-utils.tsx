import type { SortDirection } from '@tanstack/react-table'

export function SortIcon({
  isSorted,
  className = '',
  fallback,
}: {
  isSorted: SortDirection | false
  className?: string
  fallback?: React.ReactNode
}) {
  const iconClassName = cn('inline-block size-4 text-zinc-400 transition-all duration-200', className)
  fallback = fallback ?? <IconCodiconBlank />
  return (
    <>
      <IconLucideChevronUp
        className={cn(
          iconClassName,
          !isSorted && 'hidden',
          '[transform-style:preserve-3d]',
          isSorted === 'desc' && '[transform:rotateX(180deg)]',
        )}
      />
      <SVGSlot
        className={cn(
          iconClassName,
          isSorted && 'hidden',
        )}
      >
        {fallback}
      </SVGSlot>
    </>
  )
}
