import type { Row } from '@tanstack/react-table'

export const sortBySelection = <T>(rowA: Row<T>, rowB: Row<T>) => {
  const a = rowA.getIsSelected() ? 1 : 0
  const b = rowB.getIsSelected() ? 1 : 0
  return a - b
}
