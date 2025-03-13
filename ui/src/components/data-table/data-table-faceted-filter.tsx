import type { Option } from '@/types'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn('h-8 border-none p-0 shadow-none [--l-w:0] [--sq-r:6px] sq:[mask:paint(squircle)]', className)}
        >
          <div className="inline-flex size-full items-center justify-center rounded-[8px] border border-dashed border-border">
            <div className="inline-flex h-full items-center justify-center space-x-[2.5px] px-[6px] has-[>*:nth-child(2)]:pl-[5.5px]">
              {/* <IconSiFilterListDuotone className="size-[15px]" /> */}
              {/* <IconLucideFilter className="size-[16px]" /> */}
              <span className="">
                {title}
              </span>
            </div>
            {selected.length > 0 && (
              <>
                <Separator orientation="vertical" className="h-4" />
                <Badge
                  variant="secondary"
                  className="rounded-sm px-1 font-normal lg:hidden"
                >
                  {selected.length}
                </Badge>
                <div className="hidden space-x-1 px-[5px] lg:flex">
                  {selected.length >= 2 ? (
                    <Badge
                      variant="secondary"
                      className="rounded-sm px-1 font-normal"
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
                          className="rounded-sm px-1 font-normal"
                        >
                          {option.label}
                        </Badge>
                      ))
                  )}
                </div>
              </>
            )}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[12.5rem] p-0" align="start">
        <Command className="rounded-none bg-transparent sq:p-px">
          <CommandInput placeholder={title} />
          <CommandList className="max-h-full">
            <CommandEmpty className="py-[26px]">No results found.</CommandEmpty>
            <CommandGroup className="max-h-[18.75rem] overflow-y-auto overflow-x-hidden">
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
                      }
                      else {
                        onFilterChange({
                          ...filterValue,
                          [option.value]: true,
                        })
                      }
                    }}
                    className="gap-2 [--sq-r:4.5px]"
                  >
                    <div
                      className={cn(
                        'flex size-4 items-center justify-center border-primary',
                        isSelected ? '' : 'opacity-50',
                      )}
                    >
                      <Checkbox
                        checked={isSelected}
                        className="cursor-default"
                      />
                    </div>
                    {option.icon && (
                      <option.icon className="size-4 text-muted-foreground" />
                    )}
                    <span>{option.label}</span>
                    {option.count && (
                      <span className="font-mono ml-auto flex size-4 items-center justify-center text-xs">
                        {option.count}
                      </span>
                    )}
                  </CommandItem>
                )
              })}
            </CommandGroup>
            {Object.values(filterValue).some(Boolean) && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => onFilterChange({})}
                    className="justify-center text-center [--sq-r:4.5px]"
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
