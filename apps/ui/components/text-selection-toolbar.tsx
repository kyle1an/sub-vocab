'use client'

import { useCompletion } from '@ai-sdk/react'
import { Cross2Icon } from '@radix-ui/react-icons'
import * as React from 'react'
import { createPortal } from 'react-dom'
import { Streamdown } from 'streamdown'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'

export function TextSelectionToolbar() {
  const [selection, setSelection] = React.useState<string | null>(null)
  const [position, setPosition] = React.useState<{ top: number, left: number } | null>(null)
  const [mounted, setMounted] = React.useState(false)
  const [isDragging, setIsDragging] = React.useState(false)
  const lastSelectionRef = React.useRef<string | null>(null)
  const dragStartRef = React.useRef<{ x: number, y: number, initialLeft: number, initialTop: number } | null>(null)
  const hasDraggedRef = React.useRef(false)

  const { completion, complete, isLoading, setCompletion, error } = useCompletion({
    api: '/api/explain',
  })

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    const handleSelectionChange = () => {
      const sel = window.getSelection()
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

    document.addEventListener('selectionchange', handleSelectionChange)
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange)
    }
  }, [setCompletion])

  React.useEffect(() => {
    if (!isDragging) return

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

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
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
    if (hasDraggedRef.current) return
    if (!selection) return
    complete(selection)
  }

  if (!mounted || !selection || !position) return null

  return createPortal(
    <div
      style={{
        position: 'absolute',
        top: position.top,
        left: position.left,
        transform: 'translateX(-50%)',
        zIndex: 50,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onMouseDown={handleMouseDown}
    >
      <Card className="w-64 animate-in overflow-hidden py-0 shadow-lg duration-200 fade-in zoom-in">
        <CardContent className="p-0">
          {!completion && !isLoading ? (
            <div className="p-2">
              <Button
                size="sm"
                onClick={handleExplain}
                onMouseDown={(e) => e.stopPropagation()}
                disabled={isLoading}
                className="h-8 w-full"
              >
                Explain
              </Button>
              {error ? <p className="mt-2 text-xs text-red-500">Failed to load explanation.</p> : null}
            </div>
          ) : (
            <div className="flex max-h-60 flex-col text-sm">
              <div className="flex shrink-0 items-center justify-between border-b bg-muted/50 px-3 py-2">
                <span className="text-xs font-semibold text-muted-foreground">Explanation</span>
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
              <div className="overflow-y-auto p-3 text-xs leading-relaxed">
                <Streamdown>{completion}</Streamdown>
                {isLoading && <Spinner className="ml-2 inline-block h-3 w-3" />}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>,
    document.body,
  )
}
