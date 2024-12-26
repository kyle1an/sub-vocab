/* eslint-disable react-compiler/react-compiler */
import type { Table } from '@tanstack/react-table'

import { uniq } from 'lodash-es'

export function TablePaginationSizeSelect<T>({
  table,
  sizes,
  value: pageSize,
  defaultValue,
}: {
  table: Table<T>
  sizes: readonly number[]
  value: number
  defaultValue: string
}) {
  'use no memo'
  const itemsNum = uniq([table.getFilteredRowModel().rows.length]).filter(Boolean).filter((n) => !sizes.includes(n) && n > Math.min(...sizes))
  return (
    <Select
      defaultValue={defaultValue}
      onValueChange={(e) => {
        table.setPageSize(Number(e))
      }}
    >
      <SelectTrigger className="h-5 w-[unset] px-2 py-0 text-xs tabular-nums">
        <SelectValue placeholder="Select" />
      </SelectTrigger>
      <SelectContent
        position="item-aligned"
      >
        <SelectGroup>
          {sizes.map((size) => (
            <SelectItem
              className="pr-4 text-xs tabular-nums"
              key={size}
              value={String(size)}
            >
              {size}
            </SelectItem>
          ))}
        </SelectGroup>
        {![...sizes, ...itemsNum].includes(pageSize) ? (
          <>
            <SelectSeparator />
            <SelectGroup>
              {[pageSize].map((size) => (
                <SelectItem
                  className="pr-4 text-xs tabular-nums"
                  key={size}
                  value={String(size)}
                >
                  {size}
                </SelectItem>
              ))}
            </SelectGroup>
          </>
        ) : null}
        {itemsNum.length > 0 ? (
          <>
            <SelectSeparator />
            <SelectGroup>
              {itemsNum.map((size) => (
                <SelectItem
                  className="pr-4 text-xs tabular-nums"
                  key={size}
                  value={String(size)}
                >
                  {size}
                </SelectItem>
              ))}
            </SelectGroup>
          </>
        ) : null}
      </SelectContent>
    </Select>
  )
}
