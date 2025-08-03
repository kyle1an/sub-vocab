import type { Table } from '@tanstack/react-table'

import { Fragment } from 'react'
import MaterialSymbolsLightArrowBack2Outline from '~icons/material-symbols-light/arrow-back-2-outline'

import { Button } from '@/components/ui/button'
import { HEAD_HEIGHT } from '@/components/ui/table-element'

export function TableGoToLastPage<T>({
  table: { getRowModel, setPageIndex, getPageCount },
}: {
  table: Table<T>
}) {
  const dataRows = getRowModel().rows
  const canNavigateToLastPage = dataRows.length === 0 && getPageCount() > 0

  function handleGoToLastPage() {
    setPageIndex(getPageCount() - 1)
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
            <MaterialSymbolsLightArrowBack2Outline
              className="size-9"
            />
          </Button>
        </div>
      ) : null}
    </Fragment>
  )
}
