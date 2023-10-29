import { type IconProps, Icon as Iconify } from '@iconify/react'
import { cn } from '@/lib/utils'

export function Icon({ className, ...props }: IconProps) {
  let { width, height } = props
  if (width === undefined && height === undefined) {
    width = height = '1em'
  }

  return (
    <div
      className={cn(className)}
      style={{
        width,
        height,
      }}
    >
      <Iconify
        {...props}
      />
    </div>
  )
}
