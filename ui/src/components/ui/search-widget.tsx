import { useTranslation } from 'react-i18next'
import { v4 as uuidv4 } from 'uuid'
import { Squircle } from '@/components/ui/squircle'
import { Icon } from '@/components/ui/icon'
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
    <Squircle
      cornerRadius={6}
      borderWidth={1}
      className="flex w-48 flex-row items-center gap-1 overflow-hidden bg-gray-200 p-1.5 before:bg-white focus-within:!bg-ring dark:bg-gray-800 dark:text-slate-400 dark:before:bg-slate-900"
    >
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
            className="peer hidden"
            onChange={() => {
              onRegex(!useRegex)
            }}
          />
          <Squircle
            cornerRadius={4}
            borderWidth={1}
            className={cn(
              'group overflow-hidden bg-transparent p-px text-neutral-400 transition-colors before:bg-white peer-checked:border-current peer-checked:before:bg-current dark:text-neutral-200 dark:before:bg-transparent',
            )}
          >
            <Icon
              icon="codicon:regex"
              width={18}
              className={cn(
                'text-neutral-400 peer-checked:group-[]:text-white dark:text-neutral-500 peer-checked:group-[]:dark:text-neutral-600',
              )}
            />
          </Squircle>
        </label>
      </div>
    </Squircle>
  )
}
