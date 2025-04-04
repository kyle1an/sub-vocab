import type { FigmaSquircleParams } from 'figma-squircle'
import type { SetOptional } from 'type-fest'

import { Slot } from '@radix-ui/react-slot'
import { getSvgPath } from 'figma-squircle'
import { useMemo, useRef } from 'react'

import type { DivProps } from '@/components/ui/html-elements'

import { useRect } from '@/lib/hooks'
import { mergeRefs } from '@/lib/merge-refs'
import { cn } from '@/lib/utils'

type SquircleParams = Omit<FigmaSquircleParams, 'width' | 'height'>

const SQUIRCLE_PARAMS_DEFAULT = {
  preserveSmoothing: true,
  cornerSmoothing: 1,
  cornerRadius: 0,
} satisfies SquircleParams

export function Squircle({
  ref,
  children,
  asChild = false,
  className,
  style,
  borderWidth = 0,
  squircle,
  ...props
}: React.ComponentProps<'div'> & {
  asChild?: boolean
  borderWidth?: number
  squircle?: SetOptional<SquircleParams, keyof typeof SQUIRCLE_PARAMS_DEFAULT>
}) {
  const elRef = useRef<HTMLDivElement>(null!)
  const { width, height } = useRect(elRef)

  const squircleParams = useMemo(() => ({
    ...SQUIRCLE_PARAMS_DEFAULT,
    ...squircle,
  } satisfies Omit<FigmaSquircleParams, 'width' | 'height'>), [squircle])
  const clipPath = useMemo(() => `path('${getSvgPath({
    ...squircleParams,
    width,
    height,
  })}')`, [height, squircleParams, width])

  const clipPathPseudo = useMemo(() => `path('${getSvgPath({
    ...squircleParams,
    width: width - borderWidth * 2,
    height: height - borderWidth * 2,
    cornerRadius: squircleParams.cornerRadius - borderWidth,
  })}')`, [borderWidth, height, squircleParams, width])

  const Component = asChild ? Slot : 'div'

  return (
    <Component
      {...props}
      ref={mergeRefs(
        ref,
        elRef,
      )}
      className={cn(
        'relative before:absolute before:inset-[--inset] before:-z-10 before:block before:[clip-path:var(--clip-path)]',
        className,
      )}
      style={{
        clipPath,
        '--inset': `${borderWidth}px`,
        '--clip-path': clipPathPseudo,
        ...style,
      }}
    >
      {children}
    </Component>
  )
}

export function SquircleBg({
  className,
  asChild = false,
  children,
  ...props
}: DivProps & {
  asChild?: boolean
}) {
  const Component = asChild ? Slot : 'div'
  return (
    <Component
      className={cn('drop-shadow-sm sq-radius-[--sq-r] sq-fill-[--border] [--sq-r:9px] sq:rounded-none sq:border-0 sq:bg-transparent sq:[background:paint(squircle)]', className)}
      {...props}
    >
      {children}
    </Component>
  )
}

export function SquircleMask({
  className,
  asChild = false,
  children,
  ...props
}: DivProps & {
  asChild?: boolean
}) {
  const Component = asChild ? Slot : 'div'
  return (
    <Component
      className={cn('sq-radius-[calc(var(--sq-r)-1px+0.5px)] sq-fill-white sq:size-[calc(100%-2px)] sq:[mask:paint(squircle)]', className)}
      {...props}
    >
      {children}
    </Component>
  )
}
