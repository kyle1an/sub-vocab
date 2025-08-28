import { cn } from '@/lib/utils'

export function Detail({
  className,
  children,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('px-6 pt-1 pb-3 md:pr-12 md:pl-16', className)}
      {...props}
    >
      <div
        className="flex h-(--h) items-center justify-center overflow-hidden rounded-xl border sq:rounded-[1.25rem]"
      >
        <div
          className="flex size-full flex-col"
        >
          {children}
        </div>
      </div>
    </div>
  )
}
