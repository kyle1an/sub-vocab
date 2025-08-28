import type { FilterFn, Row } from '@tanstack/react-table'
import type { SetParameterType } from 'type-fest'

export const sortBySelection = <T>(rowA: Row<T>, rowB: Row<T>) => {
  const a = rowA.getIsSelected() ? 1 : 0
  const b = rowB.getIsSelected() ? 1 : 0
  return a - b
}

export const noFilter = () => true

export type ColumnFilterFn<T> = (rowValue: T) => boolean

type MyFilterFn<T> = Parameters<SetParameterType<FilterFn<T>, { 2: ColumnFilterFn<T> }>>

export const filterFn: <T>(...args: MyFilterFn<T>) => boolean = (row, columnId, filter) => filter(row.original)

export const combineFilters: <T>(filters: ColumnFilterFn<T>[]) => ColumnFilterFn<T> = (filters) => (rowValue) => filters.every((f) => f(rowValue))
