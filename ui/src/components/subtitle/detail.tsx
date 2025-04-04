import { SquircleBg, SquircleMask } from '@/components/ui/squircle'
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
      <SquircleBg
        className="flex h-[--h] items-center justify-center overflow-hidden rounded-xl border"
      >
        <SquircleMask
          className="flex size-full flex-col bg-[--theme-bg]"
        >
          {children}
        </SquircleMask>
      </SquircleBg>
    </div>
  )
}
