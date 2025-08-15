import type { Table } from '@tanstack/react-table'

import { uniq } from 'es-toolkit'
import { Fragment } from 'react'

import { Select, SelectContent, SelectGroup, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from '@/components/ui/select'

function SizeSelectItem({ size }: { size: number }) {
  return (
    <SelectItem
      className="pr-4 text-xs tracking-[.03em] tabular-nums"
      value={String(size)}
    >
      {size.toLocaleString('en-US')}
    </SelectItem>
  )
}

export function TablePaginationSizeSelect<T>({
  table,
  sizes,
  value: pageSize,
}: {
  table: Table<T>
  sizes: readonly number[]
  value: number
}) {
  const itemsNum = uniq([table.getFilteredRowModel().rows.length]).filter(Boolean).filter((n) => !sizes.includes(n) && n > Math.min(...sizes))
  return (
    <Select
      defaultValue={String(pageSize)}
      onValueChange={(e) => {
        table.setPageSize(Number(e))
      }}
    >
      <SelectTrigger
        aria-label="pagination size"
        className="h-5! w-[unset] gap-0 px-2 py-0 text-xs tracking-[.03em] tabular-nums"
      >
        <SelectValue placeholder="Select" />
      </SelectTrigger>
      <SelectContent
        position="item-aligned"
      >
        <SelectGroup>
          {sizes.map((size) => (
            <SizeSelectItem
              key={size}
              size={size}
            />
          ))}
        </SelectGroup>
        {![...sizes, ...itemsNum].includes(pageSize) ? (
          <Fragment>
            <SelectSeparator />
            <SelectGroup>
              {[pageSize].map((size) => (
                <SizeSelectItem
                  key={size}
                  size={size}
                />
              ))}
            </SelectGroup>
          </Fragment>
        ) : null}
        {itemsNum.length > 0 ? (
          <Fragment>
            <SelectSeparator />
            <SelectGroup>
              {itemsNum.map((size) => (
                <SizeSelectItem
                  key={size}
                  size={size}
                />
              ))}
            </SelectGroup>
          </Fragment>
        ) : null}
      </SelectContent>
    </Select>
  )
}
