/* eslint-disable react-compiler/react-compiler */
import type { Table } from '@tanstack/react-table'

import { uniq } from 'lodash-es'

function SizeSelectItem({ size }: { size: number }) {
  return (
    <SelectItem
      className="pr-4 text-xs tabular-nums"
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
  'use no memo'
  const itemsNum = uniq([table.getFilteredRowModel().rows.length]).filter(Boolean).filter((n) => !sizes.includes(n) && n > Math.min(...sizes))
  return (
    <Select
      defaultValue={String(pageSize)}
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
            <SizeSelectItem
              key={size}
              size={size}
            />
          ))}
        </SelectGroup>
        {![...sizes, ...itemsNum].includes(pageSize) ? (
          <>
            <SelectSeparator />
            <SelectGroup>
              {[pageSize].map((size) => (
                <SizeSelectItem
                  key={size}
                  size={size}
                />
              ))}
            </SelectGroup>
          </>
        ) : null}
        {itemsNum.length > 0 ? (
          <>
            <SelectSeparator />
            <SelectGroup>
              {itemsNum.map((size) => (
                <SizeSelectItem
                  key={size}
                  size={size}
                />
              ))}
            </SelectGroup>
          </>
        ) : null}
      </SelectContent>
    </Select>
  )
}
