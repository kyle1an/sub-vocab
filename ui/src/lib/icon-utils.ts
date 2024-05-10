import type { SortDirection } from '@tanstack/react-table'
import type { ComponentProps } from 'react'
import type { Icon } from '@/components/ui/icon'

export function sortIcon(isSorted: SortDirection | false): ComponentProps<typeof Icon>['icon'] {
  if (isSorted === 'asc') {
    return 'lucide:chevron-up'
  }
  if (isSorted === 'desc') {
    return 'lucide:chevron-down'
  }
  return ''
}
