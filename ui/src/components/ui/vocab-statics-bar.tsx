import CircularProgress from '@mui/joy/CircularProgress'
import NumberFlow from '@number-flow/react'

export function VocabStatics({
  rowsCountFiltered,
  text = '',
  rowsCountNew,
  rowsCountAcquainted,
  animated: isAnimated = true,
  progress = false,
}: {
  rowsCountFiltered: number
  text: string
  rowsCountNew: number
  rowsCountAcquainted: number
  animated?: boolean
  progress?: boolean
}) {
  const [isPending, startTransition] = useTransition()
  useEffect(() => startTransition(() => {}), [])
  const animated = !isPending && isAnimated
  const percentage = Number((rowsCountFiltered === 0 ? 0 : 100 * (rowsCountAcquainted / rowsCountFiltered)).toFixed(1))
  return (
    <div className="flex h-7 items-center text-xs tabular-nums text-neutral-600 dark:text-neutral-400">
      <span>
        <NumberFlow
          value={rowsCountFiltered}
          locales="en-US"
          animated={animated}
          isolate
        />
        <span>
          {text}
        </span>
      </span>
      <div className="flex items-center gap-0.5">
        {rowsCountNew > 0 ? (
          <div className="flex items-center gap-2.5">
            <span className="text-neutral-400">, </span>
            <div className="flex items-center gap-1">
              <span>
                <NumberFlow
                  value={rowsCountNew}
                  locales="en-US"
                  animated={animated}
                  isolate
                />
              </span>
              <IconLucideCircle
                className="size-[14px] text-neutral-400"
              />
            </div>
          </div>
        ) : null}
        {rowsCountAcquainted > 0 ? (
          <div className="flex items-center gap-2.5">
            <span className="text-neutral-400">, </span>
            <div className="flex items-center gap-1">
              <span>
                <NumberFlow
                  value={rowsCountAcquainted}
                  locales="en-US"
                  animated={animated}
                  isolate
                />
              </span>
              <IconLucideCheckCircle
                className="size-[14px] text-neutral-400"
              />
            </div>
          </div>
        ) : null}
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
            <div className="flex justify-center *:![--CircularProgress-size:16px]">
              <CircularProgress
                color="neutral"
                variant="soft"
                size="sm"
                thickness={3.5}
                determinate
                value={percentage}
              />
            </div>
            <span className="text-neutral-300 dark:text-neutral-600">)</span>
          </div>
        ) : null}
      </div>
    </div>
  )
}
