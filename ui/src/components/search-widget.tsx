import { useTranslation } from 'react-i18next'
import IconCodiconRegex from '~icons/codicon/regex'
import IconEpCircleCloseFilled from '~icons/ep/circle-close-filled'
import IconIonSearch from '~icons/ion/search'

import { Toggle } from '@/components/ui/toggle'
import { cn } from '@/lib/utils'

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
    <div
      className={cn(
        'flex max-w-48 flex-row items-center gap-1 overflow-hidden rounded-md border p-1.5 before:bg-background sq:[corner-shape:squircle] dark:text-slate-400',
        'relative [--offset:2px] [--sq-r:.8125rem] sq:overflow-visible sq:rounded-[--sq-r] sq:drop-shadow-sm sq:has-[>:focus]:ring-0 sq:has-[>:focus]:after:absolute sq:has-[>:focus]:after:-left-[--offset] sq:has-[>:focus]:after:-top-[--offset] sq:has-[>:focus]:after:-z-10 sq:has-[>:focus]:after:size-[calc(100%+2*var(--offset))] sq:has-[>:focus]:after:rounded-[calc(var(--sq-r)+var(--offset))] sq:has-[>:focus]:after:border sq:has-[>:focus]:after:border-[--ring] sq:has-[>:focus]:after:[corner-shape:squircle]',
      )}
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
          // https://x.com/JohnPhamous/status/1909293861547262141
          className="size-fit rounded-[3px] p-px text-muted-foreground [touch-action:manipulation]"
          onPressedChange={() => {
            onRegex(!isUsingRegex)
          }}
        >
          <IconCodiconRegex
            className="size-[18px]"
          />
        </Toggle>
      </div>
    </div>
  )
}
