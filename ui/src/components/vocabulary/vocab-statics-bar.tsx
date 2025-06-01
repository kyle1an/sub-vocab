import CircularProgress from '@mui/joy/CircularProgress'
import NumberFlow from '@number-flow/react'
import clsx from 'clsx'
import { useDeferredValue, useEffect, useState } from 'react'
import IconLucideCheckCircle from '~icons/lucide/check-circle'
import IconLucideCircle from '~icons/lucide/circle'

export function VocabStatics({
  total,
  text = '',
  remaining,
  completed,
  animated: isAnimated = true,
  progress = false,
}: {
  total: number
  text: string
  remaining: number
  completed: number
  animated?: boolean
  progress?: boolean
}) {
  const [isPending, setAnimated] = useState(true)
  useEffect(() => {
    if (isAnimated) {
      const id = setTimeout(() => requestAnimationFrame(() => setAnimated(false)), 0)
      return () => clearTimeout(id)
    }
  // eslint-disable-next-line react-compiler/react-compiler
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const animated = !isPending && isAnimated
  const percentage = Number(total === 0 ? 0 : (100 * (completed / total)).toFixed(1))
  const deferredRemaining = useDeferredValue(remaining) || 0
  const deferredCompleted = useDeferredValue(completed) || 0
  return (
    <div className="flex h-7 items-center text-xs text-neutral-600 tabular-nums dark:text-neutral-400">
      <span>
        <NumberFlow
          value={total}
          locales="en-US"
          animated={animated}
          isolate
        />
        <span>
          {text}
        </span>
      </span>
      <div className="flex items-center gap-0.5">
        <>
          <div className={clsx(
            'flex items-center gap-2.5',
            remaining > 0 ? '' : 'hidden',
          )}
          >
            <span className="text-neutral-400">, </span>
            <div className="flex items-center gap-1">
              <span>
                <NumberFlow
                  value={animated ? deferredRemaining : remaining}
                  locales="en-US"
                  animated={animated}
                  isolate
                />
              </span>
              <IconLucideCircle
                className="size-3.5 text-neutral-400"
              />
            </div>
          </div>
        </>
        <>
          <div
            className={clsx(
              'flex items-center gap-2.5',
              completed > 0 ? '' : 'hidden',
            )}
          >
            <span className="text-neutral-400">, </span>
            <div className="flex items-center gap-1">
              <span>
                <NumberFlow
                  value={animated ? deferredCompleted : completed}
                  locales="en-US"
                  animated={animated}
                  isolate
                />
              </span>
              <IconLucideCheckCircle
                className="size-3.5 text-neutral-400"
              />
            </div>
          </div>
        </>
        {progress ? (
          <div className="flex items-center gap-0.5 pl-1">
            <span className="text-neutral-300 dark:text-neutral-600">(</span>
            <div className="flex items-center">
              <NumberFlow
                value={percentage}
                locales="en-US"
                animated={animated}
                isolate
              />
              %
            </div>
            <div className="flex justify-center *:[--CircularProgress-size:16px]!">
              <CircularProgress
                color="neutral"
                variant="soft"
                size="sm"
                thickness={3.5}
                determinate
                value={percentage}
                aria-label="progress"
              />
            </div>
            <span className="text-neutral-300 dark:text-neutral-600">)</span>
          </div>
        ) : null}
      </div>
    </div>
  )
}
