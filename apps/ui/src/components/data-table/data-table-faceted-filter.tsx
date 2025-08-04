import { Fragment } from 'react'

import type { Option } from '@/types'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface DataTableFacetedFilterProps extends React.ComponentProps<'button'> {
  title?: string
  options: Option[]
  filterValue: Record<string, boolean>
  onFilterChange: (arg: Record<string, boolean>) => void
}

const numberFormat = new Intl.NumberFormat('en')

export function DataTableFacetedFilter({
  title,
  filterValue,
  onFilterChange,
  options,
  className = '',
}: DataTableFacetedFilterProps) {
  const selected = Object.values(filterValue).filter(Boolean)
  return (
    <Popover>
      <PopoverTrigger
        className="gap-0 border-dashed"
        asChild
      >
        <Button
          variant="outline"
          size="sm"
          className={cn('h-8 p-0 text-xs shadow-none drop-shadow-none!', className)}
        >
          <Fragment>
            <div className="inline-flex h-full items-center justify-center space-x-[2.5px] px-1.5 has-[>*:nth-child(2)]:pl-[5.5px]">
              {/* <IconSiFilterListDuotone className="size-[15px]" /> */}
              {/* <IconLucideFilter className="size-[16px]" /> */}
              <span className="">
                {title}
              </span>
            </div>
            {selected.length > 0 && (
              <Fragment>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex space-x-1 px-1 lg:hidden">
                  <Badge
                    variant="secondary"
                    className="px-1 font-normal [--sq-r:.5625rem]"
                  >
                    {selected.length}
                  </Badge>
                </div>
                <div className="hidden space-x-1 px-1 lg:flex">
                  {selected.length >= 2 ? (
                    <Badge
                      variant="secondary"
                      className="px-1 font-normal [--sq-r:.5625rem]"
                    >
                      {selected.length}
                    </Badge>
                  ) : (
                    options
                      .filter((option) => filterValue[option.value])
                      .map((option) => (
                        <Badge
                          variant="secondary"
                          key={option.value}
                          className="px-1 font-normal [--sq-r:.5625rem]"
                        >
                          {option.label}
                        </Badge>
                      ))
                  )}
                </div>
              </Fragment>
            )}
          </Fragment>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-50 p-0" align="start">
        <Command className="rounded-none bg-transparent">
          <CommandInput placeholder={title} />
          <CommandList className="max-h-full">
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup className="max-h-75 overflow-x-hidden overflow-y-auto">
              {options.map((option) => {
                const isSelected = Boolean(filterValue[option.value])
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      if (isSelected) {
                        onFilterChange({
                          ...filterValue,
                          [option.value]: false,
                        })
                      } else {
                        onFilterChange({
                          ...filterValue,
                          [option.value]: true,
                        })
                      }
                    }}
                    className="gap-2"
                  >
                    <div
                      className={cn(
                        'flex size-4 items-center justify-center border-primary',
                        isSelected ? '' : 'opacity-50',
                      )}
                    >
                      <Checkbox
                        checked={isSelected}
                        className="cursor-default **:data-[slot=check-icon]:size-3.5"
                      />
                    </div>
                    {option.icon ? (
                      <option.icon className="size-4 text-muted-foreground" />
                    ) : null}
                    <span>{option.label}</span>
                    {option.count ? (
                      <span className="ml-auto flex size-4 items-center justify-end text-xs tracking-[0.0625em] tabular-nums">
                        {numberFormat.format(option.count)}
                      </span>
                    ) : null}
                  </CommandItem>
                )
              })}
            </CommandGroup>
            {Object.values(filterValue).some(Boolean) && (
              <Fragment>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => onFilterChange({})}
                    className="justify-center text-center"
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </Fragment>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
