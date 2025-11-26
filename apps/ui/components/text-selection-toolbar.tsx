'use client'

import { Cross2Icon } from '@radix-ui/react-icons'
import * as React from 'react'
import { createPortal } from 'react-dom'

import { explainText } from '@/app/actions/explain'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'

export function TextSelectionToolbar() {
  const [selection, setSelection] = React.useState<string | null>(null)
  const [position, setPosition] = React.useState<{ top: number, left: number } | null>(null)
  const [explanation, setExplanation] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)
  const lastSelectionRef = React.useRef<string | null>(null)

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
          setExplanation(null)
          lastSelectionRef.current = text
        }
      } else {
        setSelection(null)
        setPosition(null)
        setExplanation(null)
        lastSelectionRef.current = null
      }
    }

    document.addEventListener('selectionchange', handleSelectionChange)
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange)
    }
  }, [])

  const handleExplain = async () => {
    if (!selection) return
    setLoading(true)
    const result = await explainText(selection)
    setLoading(false)
    if (result.success) {
      setExplanation(result.data || 'No explanation found.')
    } else {
      setExplanation('Failed to get explanation.')
    }
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
          {!explanation ? (
            <Button size="sm" onClick={handleExplain} disabled={loading} className="h-8 w-full">
              {loading ? <Spinner className="mr-2 h-3 w-3" /> : null}
              Explain
            </Button>
          ) : (
            <div className="max-h-60 overflow-y-auto text-sm">
              <div className="sticky top-0 mb-2 flex items-center justify-between border-b bg-background pb-2">
                <span className="text-xs font-semibold text-muted-foreground">Explanation</span>
                <Button variant="ghost" size="icon" className="h-4 w-4" onClick={() => setExplanation(null)}>
                  <Cross2Icon />
                </Button>
              </div>
              <p className="text-xs leading-relaxed">{explanation}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>,
    document.body,
  )
}
