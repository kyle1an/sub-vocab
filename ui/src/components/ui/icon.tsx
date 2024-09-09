import { Icon as Iconify, type IconifyIconProps } from '@iconify-icon/react'

import { cn } from '@/lib/utils'

export function Icon({
  className,
  ref,
  style,
  icon,
  ...props
}: IconifyIconProps) {
  let { width, height } = props
  if (width === undefined && height === undefined) {
    width = height = '1em'
  } else if (width === undefined) {
    width = height
  } else if (height === undefined) {
    height = width
  }

  return (
    <Iconify
      icon={icon || 'codicon:blank'}
      className={cn(
        'inline-block',
        className,
      )}
      style={{
        width,
        height,
        ...style,
      }}
      {...props}
    />
  )
}
