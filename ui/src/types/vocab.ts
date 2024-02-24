import type { Table } from '@tanstack/react-table'

export type GroupHeader<T extends Table<any>> = ReturnType<T['getHeaderGroups']>[number]['headers'][number]
