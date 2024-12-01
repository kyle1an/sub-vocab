import type { Table } from '@tanstack/react-table'

export type GroupHeader<T> = ReturnType<Table<T>['getHeaderGroups']>[number]['headers'][number]
