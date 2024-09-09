import { flexRender, type Table } from '@tanstack/react-table'

import type { GroupHeader } from '@/types/vocab'

export function TableHeader<T extends Table<any>>({ header }: { header: GroupHeader<T> }) {
  // eslint-disable-next-line react-compiler/react-compiler
  'use no memo'
  return (
    header.isPlaceholder ? (
      <th
        colSpan={header.colSpan}
        className="border-y border-solid border-y-zinc-200 p-0 text-sm font-normal"
      />
    ) : (
      <>
        {flexRender(
          header.column.columnDef.header,
          header.getContext(),
        )}
      </>
    )
  )
}
