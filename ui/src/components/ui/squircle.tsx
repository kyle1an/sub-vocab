import type { SetOptional } from 'type-fest'

import { Slot } from '@radix-ui/react-slot'
import { type FigmaSquircleParams, getSvgPath } from 'figma-squircle'
import { mergeRefs } from 'react-merge-refs'

import { useRect } from '@/lib/hooks'

type SquircleParams = Omit<FigmaSquircleParams, 'width' | 'height'>

const SQUIRCLE_PARAMS_DEFAULT = {
  preserveSmoothing: true,
  cornerSmoothing: 1,
  cornerRadius: 0,
} satisfies SquircleParams

export interface DivProps extends
  React.HTMLAttributes<HTMLDivElement>,
  React.RefAttributes<HTMLDivElement> {
  asChild?: boolean
}

export function Squircle({
  ref,
  children,
  asChild = false,
  className,
  style,
  borderWidth = 0,
  squircle,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLElement> & {
  asChild?: boolean
  borderWidth?: number
  squircle?: SetOptional<SquircleParams, keyof typeof SQUIRCLE_PARAMS_DEFAULT>
}) {
  const elRef = useRef<HTMLElement>(null)
  function refCallback(el: HTMLElement | null) {
    elRef.current = el
  }

  const [clipPath, setClipPath] = useState('')
  const [clipPathPseudo, setClipPathPseudo] = useState('')
  const { width, height } = useRect(elRef)

  useEffect(() => {
    const element = elRef.current
    if (element) {
      const squircleParams = {
        ...SQUIRCLE_PARAMS_DEFAULT,
        ...squircle,
        width,
        height,
      } satisfies FigmaSquircleParams
      setClipPath(`path('${getSvgPath(squircleParams)}')`)

      const svgPathPseudo = getSvgPath({
        ...squircleParams,
        width: width - borderWidth * 2,
        height: height - borderWidth * 2,
        cornerRadius: squircleParams.cornerRadius - borderWidth,
      })
      setClipPathPseudo(`path('${svgPathPseudo}')`)
    }
  }, [width, height, squircle, borderWidth])

  const refs = mergeRefs([
    ref,
    refCallback,
  ])

  const Component = asChild ? Slot : 'div'

  return (
    <Component
      {...props}
      ref={refs}
      className={cn(
        'relative before:absolute before:inset-[var(--inset)] before:-z-10 before:block before:[clip-path:var(--clip-path)]',
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
}: DivProps) {
  const Component = asChild ? Slot : 'div'
  return (
    <Component
      className={cn('drop-shadow-sm squircle sq-radius-[--sq-r] sq-fill-border [--sq-r:9px] sq:rounded-none sq:border-0', className)}
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
}: DivProps) {
  const Component = asChild ? Slot : 'div'
  return (
    <Component
      className={cn('mask-squircle sq-radius-[calc(var(--sq-r)-1px+0.5px)] sq-fill-white sq:size-[calc(100%-2px)]', className)}
      {...props}
    >
      {children}
    </Component>
  )
}
