import { useTranslation } from 'react-i18next'

import { Icon } from '@/components/ui/icon'
import { Squircle } from '@/components/ui/squircle'
import { Toggle } from '@/components/ui/toggle'

export function SearchWidget({
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
      squircle={{
        cornerRadius: 6,
      }}
      borderWidth={1}
      className="flex max-w-48 flex-row items-center gap-1 overflow-hidden bg-gray-200 p-1.5 before:bg-white has-[>:focus]:!bg-ring dark:bg-gray-800 dark:text-slate-400 dark:before:bg-slate-900"
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
        className="w-[.1%] grow bg-transparent pl-0.5 leading-4 outline-none dark:placeholder:text-slate-600"
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
      <div className="inline-flex items-center">
        <Toggle
          pressed={useRegex}
          aria-label="Regular expression"
          className="size-fit rounded-[3px] p-px text-muted-foreground"
          onPressedChange={() => {
            onRegex(!useRegex)
          }}
        >
          <Icon
            icon="codicon:regex"
            width={18}
          />
        </Toggle>
      </div>
    </Squircle>
  )
}
