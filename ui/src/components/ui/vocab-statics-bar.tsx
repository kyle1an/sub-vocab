export function VocabStatics(props: { rowsCountFiltered: number, rowsCountNew: number, rowsCountAcquainted: number }) {
  const { t } = useTranslation()
  return (
    <div className="flex h-7 items-center text-xs tabular-nums text-neutral-600 dark:text-neutral-400">
      <span>
        {`${props.rowsCountFiltered.toLocaleString('en-US')} ${t('vocabulary')}`}
      </span>
      <div className="flex items-center gap-0.5">
        {props.rowsCountNew > 0 ? (
          <div className="flex items-center gap-2.5">
            <span className="text-neutral-400">, </span>
            <div className="flex items-center gap-1">
              <span>
                {props.rowsCountNew.toLocaleString('en-US')}
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
                {props.rowsCountAcquainted.toLocaleString('en-US')}
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
