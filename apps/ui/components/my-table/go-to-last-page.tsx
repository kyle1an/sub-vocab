import type { Table } from '@tanstack/react-table'

import { Fragment } from 'react'

import { Button } from '@/components/ui/button'
import { HEAD_HEIGHT } from '@/components/ui/table-element'

export function TableGoToLastPage<T>({
  table,
}: {
  table: Table<T>
}) {
  const dataRows = table.getRowModel().rows
  const canNavigateToLastPage = dataRows.length === 0 && table.getPageCount() > 0

  function handleGoToLastPage() {
    table.setPageIndex(table.getPageCount() - 1)
  }

  return (
    <Fragment>
      {canNavigateToLastPage ? (
        <div
          style={{
            '--h': `${HEAD_HEIGHT}px`,
          }}
          className="h-[calc(100%-var(--h))]"
        >
          <Button
            variant="ghost"
            className="size-full rounded-none sq:rounded-none"
            onClick={handleGoToLastPage}
          >
            <svg
              className="icon-[material-symbols-light--arrow-back-2-outline] size-9"
            />
          </Button>
        </div>
      ) : null}
    </Fragment>
  )
}
