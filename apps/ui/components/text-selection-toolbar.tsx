'use client'

import { useCompletion } from '@ai-sdk/react'
import { Cross2Icon, StopIcon } from '@radix-ui/react-icons'
import { Resizable } from 're-resizable'
import * as React from 'react'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Streamdown } from 'streamdown'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

export function TextSelectionToolbar() {
  const [selection, setSelection] = React.useState<string | null>(null)
  const [position, setPosition] = React.useState<{ top: number, left: number } | null>(null)
  const [mounted, setMounted] = React.useState(false)
  const [isDragging, setIsDragging] = React.useState(false)
  const [size, setSize] = React.useState({ width: 300, height: 300 })
  const lastSelectionRef = React.useRef<string | null>(null)
  const dragStartRef = React.useRef<{ x: number, y: number, initialLeft: number, initialTop: number } | null>(null)
  const hasDraggedRef = React.useRef(false)
  const cardRef = React.useRef<HTMLDivElement>(null)

  const { completion, complete, isLoading, setCompletion, error, stop } = useCompletion({
    api: '/api/explain',
  })

  useEffect(() => {
    const savedSize = localStorage.getItem('text-selection-toolbar-size')
    if (savedSize) {
      try {
        // @ts-expect-error
        setSize(JSON.parse(savedSize))
      } catch (e) {
        console.error('Failed to parse saved size', e)
      }
    }
    setMounted(true)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const handleSelectionChange = () => {
      const sel = window.getSelection()

      // If selection is inside the card, do nothing (don't close)
      if (sel && cardRef.current && (cardRef.current.contains(sel.anchorNode) || cardRef.current.contains(sel.focusNode))) {
        return
      }

      if (sel && !sel.isCollapsed && sel.toString().trim().length > 0) {
        const text = sel.toString()
        const range = sel.getRangeAt(0)
        const rect = range.getBoundingClientRect()

        setSelection(text)
        setPosition({
          top: rect.bottom + window.scrollY + 8,
          left: rect.left + window.scrollX + rect.width / 2,
        })

        if (lastSelectionRef.current !== text) {
          setCompletion('')
          lastSelectionRef.current = text
        }
      } else {
        setSelection(null)
        setPosition(null)
        setCompletion('')
        lastSelectionRef.current = null
      }
    }

    document.addEventListener('selectionchange', handleSelectionChange, { signal: controller.signal })
    return () => controller.abort()
  }, [setCompletion])

  useEffect(() => {
    if (!isDragging) return

    const controller = new AbortController()
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStartRef.current) return
      const dx = e.clientX - dragStartRef.current.x
      const dy = e.clientY - dragStartRef.current.y

      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        hasDraggedRef.current = true
      }

      setPosition({
        left: dragStartRef.current.initialLeft + dx,
        top: dragStartRef.current.initialTop + dy,
      })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      dragStartRef.current = null
    }

    document.addEventListener('mousemove', handleMouseMove, { signal: controller.signal })
    document.addEventListener('mouseup', handleMouseUp, { signal: controller.signal })

    return () => controller.abort()
  }, [isDragging])

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    if (e.button !== 0) return // Only left click

    setIsDragging(true)
    hasDraggedRef.current = false
    if (position) {
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        initialLeft: position.left,
        initialTop: position.top,
      }
    }
  }

  const handleExplain = (e: React.MouseEvent) => {
    if (!selection) return
    complete(selection)
  }

  if (!mounted || !selection || !position) return null

  return createPortal(
    <div
      ref={cardRef}
      className="absolute z-50 -translate-x-1/2"
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      {completion || isLoading ? (
        <Resizable
          defaultSize={size}
          onResizeStop={(e, direction, ref, d) => {
            const newSize = {
              width: size.width + d.width,
              height: size.height + d.height,
            }
            setSize(newSize)
            localStorage.setItem('text-selection-toolbar-size', JSON.stringify(newSize))
          }}
          minWidth={200}
          minHeight={150}
          enable={{
            top: false,
            right: false,
            bottom: false,
            left: false,
            topRight: false,
            bottomRight: true,
            bottomLeft: false,
            topLeft: false,
          }}
        >
          <Card className="h-full w-full overflow-hidden py-0 shadow-lg">
            <CardContent className="h-full p-0">
              <div className="relative flex h-full flex-col text-sm">
                <div
                  className={cn(
                    'flex shrink-0 items-center justify-between border-b bg-muted/50 px-3 py-2',
                    isDragging ? 'cursor-grabbing' : 'cursor-grab',
                  )}
                  onMouseDown={handleMouseDown}
                >
                  <span className="text-xs font-semibold text-muted-foreground">Explanation</span>
                  <div className="flex items-center gap-1">
                    {isLoading && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4"
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={stop}
                      >
                        <StopIcon />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4"
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={() => setSelection(null)}
                    >
                      <Cross2Icon />
                    </Button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-3 text-sm leading-relaxed">
                  <Streamdown>{completion}</Streamdown>
                  {isLoading && <Spinner className="ml-2 inline-block h-3 w-3" />}
                </div>
              </div>
            </CardContent>
          </Card>
        </Resizable>
      ) : (
        <Card className="animate-in overflow-hidden py-0 shadow-lg duration-200 fade-in zoom-in">
          <CardContent className="p-0">
            <div
              className={cn('w-24 p-1', isDragging ? 'cursor-grabbing' : 'cursor-grab')}
              onMouseDown={handleMouseDown}
            >
              <Button
                size="sm"
                onClick={handleExplain}
                onMouseDown={(e) => e.stopPropagation()}
                disabled={isLoading}
                className="h-7 w-full text-xs"
              >
                Explain
              </Button>
              {error ? <p className="mt-2 text-xs text-red-500">Failed to load explanation.</p> : null}
            </div>
          </CardContent>
        </Card>
      )}
    </div>,
    document.body,
  )
}
