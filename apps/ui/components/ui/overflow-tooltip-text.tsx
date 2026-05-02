'use client'

import type { ComponentProps, MouseEvent, RefObject } from 'react'

import { useAbortableEffect } from 'foxact/use-abortable-effect'
import nstr from 'nstr'
import { useCallback, useRef, useState } from 'react'

import { cn } from '@/lib/utils'
import { useRect } from '@sub-vocab/utils/hooks'
import { isServer } from '@sub-vocab/utils/lib'

import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip'

type TooltipContentProps = ComponentProps<typeof TooltipContent>

type OverflowTooltipTextProps = Pick<
  TooltipContentProps,
  'align' | 'alignOffset' | 'avoidCollisions' | 'side' | 'sideOffset'
> & {
  className?: string
  contentClassName?: string
  delayDuration?: number
  maxWidthOffset?: number
  rootRef?: RefObject<HTMLDivElement | null>
  value: string
  wrapperClassName?: string
}

export function OverflowTooltipText({
  align = 'start',
  alignOffset = -8 - 1,
  avoidCollisions = false,
  className,
  contentClassName,
  delayDuration = 500,
  maxWidthOffset = 12 - 6,
  rootRef,
  side = 'bottom',
  sideOffset = -21 - 1,
  value,
  wrapperClassName = 'w-0 grow truncate',
}: OverflowTooltipTextProps) {
  const ref = useRef<HTMLDivElement>(null)
  const fallbackRootRef = useRef<HTMLDivElement>(null)
  const [contentElement, setContentElement] = useState<HTMLDivElement | null>(null)
  const rootRect = useRect(rootRef ?? fallbackRootRef)
  const refRect = useRect(ref)
  const [isTooltipVisible, setIsTooltipVisible] = useState(false)
  const [isTooltipClipped, setIsTooltipClipped] = useState(false)
  const rootRight = rootRect.x + rootRect.width
  const boundaryRight = !isServer && rootRect.width > 0 && rootRight > refRect.x ? Math.min(window.innerWidth, rootRight) : undefined
  const maxWidth = isServer ? 0 : (boundaryRight ?? window.innerWidth) - refRect.x + maxWidthOffset

  const isTriggerInsideRoot = useCallback(() => {
    const root = rootRef?.current
    const trigger = ref.current
    if (!root || !trigger) {
      return true
    }

    const rootBounds = root.getBoundingClientRect()
    const triggerBounds = trigger.getBoundingClientRect()

    return (
      triggerBounds.bottom > rootBounds.top
      && triggerBounds.top < rootBounds.bottom
      && triggerBounds.right > rootBounds.left
      && triggerBounds.left < rootBounds.right
    )
  }, [rootRef])

  function handleTriggerMouseOver(event: MouseEvent<HTMLElement>) {
    const element = event.currentTarget
    const isOverflowing = element.offsetWidth < element.scrollWidth
    setIsTooltipVisible(isOverflowing)
    if (isOverflowing) {
      setIsTooltipClipped(!isTriggerInsideRoot())
    }
  }

  const updateTooltipClip = useCallback(() => {
    setIsTooltipClipped(!isTriggerInsideRoot())
  }, [isTriggerInsideRoot])

  const handleContentWheel = useCallback((event: WheelEvent) => {
    const root = rootRef?.current
    if (!root) {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    root.scrollBy({
      left: event.deltaX,
      top: event.deltaY,
    })
  }, [rootRef])

  useAbortableEffect((signal) => {
    if (!contentElement) {
      return
    }

    contentElement.addEventListener('wheel', handleContentWheel, { passive: false, signal })
  }, [contentElement, handleContentWheel])

  useAbortableEffect((signal) => {
    const root = rootRef?.current
    if (!root) {
      return
    }
    const scrollRoot = root

    scrollRoot.addEventListener('scroll', () => {
      updateTooltipClip()
    }, { passive: true, signal })
  }, [rootRef, updateTooltipClip])

  return (
    <div
      ref={ref}
      className={wrapperClassName}
    >
      <Tooltip
        delayDuration={delayDuration}
      >
        <TooltipTrigger
          onMouseOver={handleTriggerMouseOver}
          render={(
            <div
              className={cn('truncate', className)}
            >
              {value}
            </div>
          )}
        />
        <TooltipContent
          side={side}
          sideOffset={sideOffset}
          align={align}
          alignOffset={alignOffset}
          avoidCollisions={avoidCollisions}
          positionerClassName="z-1000000000"
          hidden={!isTooltipVisible}
          aria-hidden={isTooltipClipped || undefined}
          className={cn(
            'max-w-(--max-width) border bg-background px-2 py-px text-foreground shadow-xs transition-opacity! outline-none! select-text [word-wrap:break-word] data-ending-style:scale-100! data-ending-style:opacity-0! data-starting-style:scale-100! data-starting-style:opacity-0! **:data-[slot=tooltip-arrow]:hidden!',
            isTooltipClipped && 'pointer-events-none opacity-0',
            contentClassName,
          )}
          style={{
            '--max-width': `${nstr(maxWidth)}px`,
          }}
          popupRef={setContentElement}
        >
          <span
            className={className}
          >
            {value}
          </span>
        </TooltipContent>
      </Tooltip>
    </div>
  )
}
