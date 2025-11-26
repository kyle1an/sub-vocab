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
  const lastSelectionRef = React.useRef<string | null>(null)

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

  const handleExplain = () => {
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
      }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <Card className="w-64 animate-in shadow-lg duration-200 fade-in zoom-in">
        <CardContent className="p-2">
          {!completion && !isLoading ? (
            <React.Fragment>
              <Button size="sm" onClick={handleExplain} disabled={isLoading} className="h-8 w-full">
                Explain
              </Button>
              {error ? <p className="mt-2 text-xs text-red-500">Failed to load explanation.</p> : null}
            </React.Fragment>
          ) : (
            <div className="max-h-60 overflow-y-auto text-sm">
              <div className="sticky top-0 mb-2 flex items-center justify-between border-b bg-background pb-2">
                <span className="text-xs font-semibold text-muted-foreground">Explanation</span>
                <Button variant="ghost" size="icon" className="h-4 w-4" onClick={() => { }}>
                  <Cross2Icon />
                </Button>
              </div>
              <div className="text-xs leading-relaxed">
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
