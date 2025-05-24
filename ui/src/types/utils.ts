import type { CheckedState } from '@radix-ui/react-checkbox'
import type { Row, RowData } from '@tanstack/react-table'
import type z from 'zod/v4'

export type RowSelectionChangeFn<TData extends RowData> = (checked: CheckedState, row: Row<TData>, mode?: 'singleRow' | 'singleSubRow') => void

// https://github.com/colinhacks/zod/issues/53#issuecomment-1386446580
export type ZodObj<T extends Record<PropertyKey, unknown>> = {
  [key in keyof T]: z.ZodType<T[key]>
}

const cast = <T>(a: any) => a as T

// https://github.com/microsoft/TypeScript/issues/27024#issuecomment-421529650
export type Equals<X, Y> = (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? true : false
