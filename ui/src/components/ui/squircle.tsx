import {
  useEffect,
  useRef,
  useState,
} from 'react'
import { useMeasure } from 'react-use'
import { mergeRefs } from 'react-merge-refs'
import { type FigmaSquircleParams, getSvgPath } from 'figma-squircle'
import type { SetOptional } from 'type-fest'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'

const SQUIRCLE_PARAMS_DEFAULT = {
  preserveSmoothing: true,
  cornerSmoothing: 1,
} as const satisfies Partial<FigmaSquircleParams>

export interface DivProps
  extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean
}

export function Squircle({
  ref,
  children,
  asChild = false,
  className,
  style,
  borderWidth = 0,
  cornerRadius = 0,
  ...props
}: SetOptional<Omit<FigmaSquircleParams, 'width' | 'height'>, keyof typeof SQUIRCLE_PARAMS_DEFAULT> & {
  borderWidth?: number
} & DivProps & React.RefAttributes<HTMLElement>) {
  const [refMeasure, { width, height }] = useMeasure()
  const elRef = useRef<HTMLElement>(null)
  function refCallback(el: HTMLElement | null) {
    elRef.current = el
  }

  const [clipPath, setClipPath] = useState('')
  const [clipPathPseudo, setClipPathPseudo] = useState('')

  useEffect(() => {
    const element = elRef.current
    if (element) {
      const { width, height } = element.getBoundingClientRect()

      const squircleParams = {
        ...SQUIRCLE_PARAMS_DEFAULT,
        cornerRadius,
        width,
        height,
        ...props,
      } satisfies FigmaSquircleParams
      setClipPath(`path('${getSvgPath(squircleParams)}')`)

      const svgPathPseudo = getSvgPath({
        ...squircleParams,
        width: width - borderWidth * 2,
        height: height - borderWidth * 2,
        cornerRadius: cornerRadius - borderWidth,
      })
      setClipPathPseudo(`path('${svgPathPseudo}')`)
    }
  }, [width, height, props, borderWidth, cornerRadius])

  const refs = [
    ref,
    refMeasure,
    refCallback as React.Ref<Element>,
  ]

  const Component = asChild ? Slot : 'div'

  return (
    <Component
      {...props}
      ref={mergeRefs(refs)}
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
