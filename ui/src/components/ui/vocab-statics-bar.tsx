import { useTranslation } from 'react-i18next'
import { Icon } from '@/components/ui/icon'

export function VocabStatics(props: { rowsCountFiltered: number, rowsCountNew: number, rowsCountAcquainted: number }) {
  const { t } = useTranslation()
  return (
    <div className="flex items-center py-1.5 text-xs tabular-nums text-neutral-600 dark:text-neutral-400">
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
              <Icon
                icon="lucide:circle"
                width={14}
                className="text-neutral-400"
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
              <Icon
                icon="lucide:check-circle"
                width={14}
                className="text-neutral-400"
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
