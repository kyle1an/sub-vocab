import { useTranslation } from 'react-i18next'
import { v4 as uuidv4 } from 'uuid'
import { Icon } from './icon'
import { cn } from '@/lib/utils'

export function SearchWidget({
  name = uuidv4(),
  value,
  useRegex = false,
  onSearch,
  onRegex,
}: {
  name?: string
  useRegex: boolean
  value: string
  onSearch: (arg: string) => void
  onRegex: (arg: boolean) => void
}) {
  const { t } = useTranslation()

  return (
    <div className="flex w-48 flex-row items-center gap-1 overflow-hidden rounded-md border p-1.5 outline-1 focus-within:outline dark:bg-slate-900 dark:text-slate-400">
      <Icon
        icon="ion:search"
        width={16}
        className="text-neutral-500 dark:text-neutral-400"
      />
      <input
        type="text"
        aria-label="Search"
        value={value}
        onChange={(e) => {
          onSearch(e.target.value)
        }}
        placeholder={t('search')}
        className="w-[0.1%] grow bg-transparent pl-0.5 leading-4 outline-none dark:placeholder:text-slate-600"
      />
      {value ? (
        <Icon
          icon="ep:circle-close-filled"
          width={17}
          className="text-neutral-700 dark:text-neutral-300"
          onClick={() => {
            onSearch('')
          }}
        />
      ) : null}
      <div>
        <label htmlFor={name}>
          <input
            id={name}
            type="checkbox"
            checked={useRegex}
            aria-label="Regular expression"
            className="hidden"
            onChange={() => {
              onRegex(!useRegex)
            }}
          />
          <div
            className={cn(
              'overflow-hidden rounded-[3px] border border-transparent text-neutral-400 transition-colors hover:border-current dark:text-neutral-200',
              useRegex ? 'border-current bg-current' : '',
            )}
          >
            <Icon
              icon="codicon:regex"
              width={16}
              className={cn(
                useRegex ? 'text-white dark:text-neutral-600' : 'text-neutral-400 dark:text-neutral-500',
              )}
            />
          </div>
        </label>
      </div>
    </div>
  )
}
