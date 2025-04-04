import { useTranslation } from 'react-i18next'
import IconCodiconRegex from '~icons/codicon/regex'
import IconEpCircleCloseFilled from '~icons/ep/circle-close-filled'
import IconIonSearch from '~icons/ion/search'

import { Squircle } from '@/components/ui/squircle'
import { Toggle } from '@/components/ui/toggle'

export function SearchWidget({
  value,
  isUsingRegex = false,
  onSearch,
  onRegex,
}: {
  name?: string
  isUsingRegex: boolean
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
      className="flex max-w-48 flex-row items-center gap-1 overflow-hidden bg-border p-1.5 before:bg-background has-[>:focus]:!bg-ring dark:text-slate-400"
    >
      <IconIonSearch
        className="size-4 text-neutral-500 dark:text-neutral-400"
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
        <IconEpCircleCloseFilled
          className="size-[17px] text-neutral-700 dark:text-neutral-300"
          onClick={() => {
            onSearch('')
          }}
        />
      ) : null}
      <div className="inline-flex items-center">
        <Toggle
          pressed={isUsingRegex}
          aria-label="Regular expression"
          className="size-fit rounded-[3px] p-px text-muted-foreground"
          onPressedChange={() => {
            onRegex(!isUsingRegex)
          }}
        >
          <IconCodiconRegex
            className="size-[18px]"
          />
        </Toggle>
      </div>
    </Squircle>
  )
}
