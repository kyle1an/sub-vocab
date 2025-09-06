import type { CheckedState } from '@radix-ui/react-checkbox'
import type { Row, RowData } from '@tanstack/react-table'
import type { PartialDeep } from 'type-fest'
import type z from 'zod/v4-mini'

export type RowSelectionChangeFn<TData extends RowData> = (checked: CheckedState, row: Row<TData>, mode?: 'singleRow' | 'singleSubRow') => void

// https://github.com/colinhacks/zod/issues/53#issuecomment-1386446580
export type ZodObj<T extends Record<PropertyKey, unknown>> = {
  [key in keyof T]: z.ZodMiniType<T[key]>
}

export type PartialObjectZ<T> = PartialDeep<T, { recurseIntoArrays: true }>
