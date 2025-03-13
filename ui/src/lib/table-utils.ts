import type { FilterFnOption, Row } from '@tanstack/react-table'

export const sortBySelection = <T>(rowA: Row<T>, rowB: Row<T>) => {
  const a = rowA.getIsSelected() ? 1 : 0
  const b = rowB.getIsSelected() ? 1 : 0
  return a - b
}

export const noFilter = () => true

export type ColumnFilterFn<T> = (rowValue: T) => boolean

export function getFilterFn<T>(): FilterFnOption<T> {
  return (row, columnId, fn: ColumnFilterFn<T>) => fn(row.original)
}
