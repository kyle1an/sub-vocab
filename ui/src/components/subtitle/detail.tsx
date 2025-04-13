import { cn } from '@/lib/utils'

export function Detail({
  className,
  children,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('px-6 pb-3 pt-1 md:pl-16 md:pr-12', className)}
      {...props}
    >
      <div
        className="flex h-[--h] items-center justify-center overflow-hidden rounded-xl border sq:rounded-[1.25rem] sq:[corner-shape:squircle]"
      >
        <div
          className="flex size-full flex-col bg-[--theme-bg]"
        >
          {children}
        </div>
      </div>
    </div>
  )
}
