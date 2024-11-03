import NumberFlow from '@number-flow/react'
import { useEffectOnce } from 'react-use'

export function VocabStatics({
  rowsCountFiltered,
  rowsCountNew,
  rowsCountAcquainted,
  animated: isAnimated = true,
}: {
  rowsCountFiltered: number
  rowsCountNew: number
  rowsCountAcquainted: number
  animated?: boolean
}) {
  const { t } = useTranslation()
  const [isPending, startTransition] = useTransition()
  useEffectOnce(() => startTransition(() => {}))
  const animated = !isPending && isAnimated
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
          {` ${t('vocabulary')}`}
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
      </div>
    </div>
  )
}
