import NumberFlow from '@number-flow/react'

export function VocabStatics(props: {
  rowsCountFiltered: number
  rowsCountNew: number
  rowsCountAcquainted: number
  animated?: boolean
}) {
  const { t } = useTranslation()
  const animated = props.animated ?? true
  return (
    <div className="flex h-7 items-center text-xs tabular-nums text-neutral-600 dark:text-neutral-400">
      <span>
        <NumberFlow
          value={props.rowsCountFiltered}
          locales="en-US"
          animated={animated}
          isolate
        />
        <span>
          {` ${t('vocabulary')}`}
        </span>
      </span>
      <div className="flex items-center gap-0.5">
        {props.rowsCountNew > 0 ? (
          <div className="flex items-center gap-2.5">
            <span className="text-neutral-400">, </span>
            <div className="flex items-center gap-1">
              <span>
                <NumberFlow
                  value={props.rowsCountNew}
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
        {props.rowsCountAcquainted > 0 ? (
          <div className="flex items-center gap-2.5">
            <span className="text-neutral-400">, </span>
            <div className="flex items-center gap-1">
              <span>
                <NumberFlow
                  value={props.rowsCountAcquainted}
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
