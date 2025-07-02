import clsx from 'clsx'
import { useRef } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
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
  const inputRef = useRef<HTMLInputElement>(null)
  useHotkeys('meta+f', (e) => {
    if (document.activeElement === inputRef.current)
      return
    e.preventDefault()
    const el = inputRef.current
    if (el) {
      el.focus()
      el.select()
    }
  }, {
    enableOnFormTags: ['textarea', 'input'],
  })

  return (
    <div
      className={cn(
        'flex max-w-48 flex-row items-center gap-1 overflow-visible rounded-md border p-1.5 pr-[.3125rem] dark:text-neutral-400',
        'shadow-xs [--sq-r:.75rem] sq:rounded-(--sq-r) sq:shadow-none sq:drop-shadow-xs',
        'transition-[color,box-shadow,border-color] has-[>:focus]:border-ring has-[>:focus]:ring-[3px] has-[>:focus]:ring-ring/50',
      )}
    >
      <IconIonSearch
        className="size-4 text-neutral-500 dark:text-neutral-400"
      />
      <input
        ref={inputRef}
        type="text"
        aria-label="Search"
        value={value}
        onChange={(e) => {
          onSearch(e.target.value)
        }}
        placeholder={t('search')}
        className={clsx(
          'w-[.1%] grow bg-transparent pl-0.5 leading-4 outline-hidden dark:placeholder:text-neutral-600',
          !value && 'select-none',
        )}
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
          className="size-fit min-w-0 touch-manipulation rounded-[3px] p-px text-muted-foreground"
          onPressedChange={() => {
            onRegex(!isUsingRegex)
          }}
        >
          <IconCodiconRegex
            className="size-4.5"
          />
        </Toggle>
      </div>
    </div>
  )
}
