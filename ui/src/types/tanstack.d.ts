import type { RowData } from '@tanstack/react-table'

import type { RowSelectionChangeFn } from '@/types/utils'

declare module '@tanstack/react-table' {
  interface CellContext<TData extends RowData, TValue> {
    onExpandedChange?: (expanded: boolean) => void
    onRowSelectionChange?: RowSelectionChangeFn<TData> | undefined
  }
}
