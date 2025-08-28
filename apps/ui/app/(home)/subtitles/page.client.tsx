import type { InitialTableState } from '@tanstack/react-table'

import usePagination from '@mui/material/usePagination'
import NumberFlow from '@number-flow/react'
import { useUnmountEffect } from '@react-hookz/web'
import { useQuery } from '@tanstack/react-query'
import { createColumnHelper, getCoreRowModel, getExpandedRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'
import clsx from 'clsx'
import { format } from 'date-fns'
import { pipe } from 'effect'
import { identity, uniqBy } from 'es-toolkit'
import { useDebouncedValue } from 'foxact/use-debounced-value'
import { produce } from 'immer'
import { atom, useAtom, useAtomValue, useSetAtom, useStore } from 'jotai'
import { useImmerAtom } from 'jotai-immer'
import { atomWithStorage } from 'jotai/utils'
import ms from 'ms'
import { Fragment, startTransition, useRef } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'
import { useImmer } from 'use-immer'
import IconClarityStarSolid from '~icons/clarity/star-solid'
import IconF7ArrowDownCircleFill from '~icons/f7/arrow-down-circle-fill'
import F7CaptionsBubbleFill from '~icons/f7/captions-bubble-fill'
import IconF7MultiplyCircle from '~icons/f7/multiply-circle'
import IconLucideChevronRight from '~icons/lucide/chevron-right'
import IconLucideLoader2 from '~icons/lucide/loader2'
import MiChevronLeft from '~icons/mi/chevron-left'
import IconOuiTokenKey from '~icons/oui/token-key'

import type { Download } from '@/api/opensubtitles'
import type { tmdb } from '@sub-vocab/utils/types'

import { $osApi, openSubtitlesDownloadAtom, openSubtitlesTextAtom } from '@/api/opensubtitles'
import { $api } from '@/api/tmdb'
import { osLanguageAtom } from '@/atoms'
import { fileIdsAtom, mediaSubtitleAtomFamily } from '@/atoms/subtitles'
import { fileInfoAtom, sourceTextAtom } from '@/atoms/vocabulary'
import { MediaDetails } from '@/components/media-details'
import { SortIcon } from '@/components/my-icon/sort-icon'
import { TableGoToLastPage } from '@/components/my-table/go-to-last-page'
import { TablePagination } from '@/components/my-table/pagination'
import { TablePaginationSizeSelect } from '@/components/my-table/pagination-size-select'
import { OpensubtitlesAuthentication } from '@/components/subtitle/opensubtitles-authentication'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Div } from '@/components/ui/html-elements'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { HeaderTitle, TableDataCell, TableHeader, TableHeaderCell, TableHeaderCellRender, TableRow } from '@/components/ui/table-element'
import { filterFn } from '@/lib/table-utils'
import { useClone } from '@sub-vocab/utils/hooks'
import { findClosest, tap } from '@sub-vocab/utils/lib'

const mediaSearchAtom = atomWithStorage('mediaSearchAtom', '')

const popularityNumberFormat = new Intl.NumberFormat('en', { maximumFractionDigits: 1, minimumFractionDigits: 1 })
const voteNumberFormat = new Intl.NumberFormat('en', { maximumFractionDigits: 1, minimumFractionDigits: 1 })
const voteCountFormat = new Intl.NumberFormat('en', { notation: 'compact', compactDisplay: 'short' })
const listFormatter = new Intl.ListFormat('en', { style: 'long', type: 'conjunction' })

type TableData = NonNullable<tmdb.paths['/3/search/multi']['get']['responses'][200]['content']['application/json']['results']>[number]

/// keep-unique
const PAGE_SIZES = [5, 10, 20] as const

const cacheStateAtom = atom({
  initialTableState: identity<InitialTableState>({
    pagination: {
      pageSize: findClosest(100, PAGE_SIZES),
      pageIndex: 0,
    },
  }),
})

function useColumns<T extends TableData>(rootRef: React.RefObject<HTMLDivElement | null>) {
  // Add this to prevent all columns from re-rendering on sort
  const { t } = useTranslation()
  const columnHelper = createColumnHelper<T>()
  return [
    columnHelper.accessor((row) => row.id, {
      id: 'action',
      header: ({ header }) => {
        const isSorted = header.column.getIsSorted()
        return (
          <TableHeaderCell
            header={header}
            className="w-[.1%] active:signal/active [&:active+th]:signal/active"
          >
            <Div
              className="min-w-10 justify-center gap-2 select-none signal/active:bg-background-active"
              onClick={(e) => {
                header.column.getToggleSortingHandler()?.(e)
                requestAnimationFrame(() => rootRef?.current?.scrollTo({ top: 0 }))
              }}
            >
              <div
                className="flex"
              >
                <SortIcon isSorted={isSorted} />
              </div>
            </Div>
          </TableHeaderCell>
        )
      },
      cell: ({ row, cell, onExpandedChange }) => {
        const isExpanded = row.getIsExpanded()
        return (
          <TableDataCell
            cell={cell}
          >
            <Div className="pr-px pl-0.5 text-zinc-400">
              {row.getCanExpand() ? (
                <div
                  className="flex h-full grow cursor-pointer items-center justify-center select-none"
                  onClick={() => {
                    onExpandedChange?.(isExpanded)
                  }}
                >
                  {/*
                <Checkbox
                  onClick={(e) => e.stopPropagation()}
                />
                */}
                  {/* https://stackoverflow.com/questions/2876424/html-double-click-selection-oddity */}
                  {'\u200B'}
                  <IconLucideChevronRight
                    className={clsx(
                      'size-3.5 text-zinc-400 transition-transform dark:text-zinc-500',
                      isExpanded ? 'rotate-90' : '',
                    )}
                  />
                </div>
              ) : (
                <div className="w-full justify-end px-3">
                  <Checkbox
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}
            </Div>
          </TableDataCell>
        )
      },
    }),
    columnHelper.accessor((row) => row.release_date ?? row.first_air_date, {
      id: 'upload_date',
      header: ({ header }) => {
        const title = 'Year'
        const isSorted = header.column.getIsSorted()
        return (
          <TableHeaderCell
            header={header}
            className="w-[.1%] active:bg-background-active active:signal/active [&:active+th]:signal/active"
          >
            <Div
              className="group gap-2 pr-1 select-none"
              onClick={(e) => {
                header.column.getToggleSortingHandler()?.(e)
                requestAnimationFrame(() => rootRef?.current?.scrollTo({ top: 0 }))
              }}
            >
              <Separator
                orientation="vertical"
                className="h-5 signal/active:h-full"
              />
              <HeaderTitle
                title={title}
                isSorted={isSorted}
                className="*:data-title:text-left"
              />
            </Div>
          </TableHeaderCell>
        )
      },
      cell: ({ cell, getValue }) => {
        const value = getValue()
        return (
          <TableDataCell
            cell={cell}
          >
            <Div className="justify-center pr-px pl-0.5 tracking-[.03em] tabular-nums">
              {value ? format(value, 'yyyy') : null}
            </Div>
          </TableDataCell>
        )
      },
    }),
    columnHelper.accessor((row) => row.media_type, {
      id: 'media_type',
      header: ({ header }) => {
        const title = 'Media'
        const isSorted = header.column.getIsSorted()
        return (
          <TableHeaderCell
            header={header}
            className="w-[.1%] active:bg-background-active active:signal/active [&:active+th]:signal/active"
          >
            <Div
              className="group gap-2 pr-1 select-none"
              onClick={(e) => {
                header.column.getToggleSortingHandler()?.(e)
                requestAnimationFrame(() => rootRef?.current?.scrollTo({ top: 0 }))
              }}
            >
              <Separator
                orientation="vertical"
                className="h-5 signal/active:h-full"
              />
              <HeaderTitle
                title={title}
                isSorted={isSorted}
                className="*:data-title:text-right"
              />
            </Div>
          </TableHeaderCell>
        )
      },
      cell: ({ cell, getValue }) => {
        const value = getValue()
        return (
          <TableDataCell
            cell={cell}
          >
            <Div
              className="justify-center pr-px pl-0.5 capitalize data-[value=tv]:tracking-[.05em] data-[value=tv]:uppercase"
              data-value={value}
            >
              {value}
            </Div>
          </TableDataCell>
        )
      },
    }),
    columnHelper.accessor((row) => row.title ?? row.original_title ?? row.original_name, {
      id: 'movie_name',
      filterFn,
      header: ({ header }) => {
        const title = 'Name'
        const isSorted = header.column.getIsSorted()
        return (
          <TableHeaderCell
            header={header}
            className="active:bg-background-active active:signal/active [&:active+th]:signal/active"
          >
            <Div
              className="group gap-2 pr-1"
              onClick={(e) => {
                header.column.getToggleSortingHandler()?.(e)
                requestAnimationFrame(() => rootRef?.current?.scrollTo({ top: 0 }))
              }}
            >
              <Separator
                orientation="vertical"
                className="h-5 signal/active:h-full"
              />
              <HeaderTitle
                title={title}
                isSorted={isSorted}
                className="*:data-title:text-left"
              />
            </Div>
          </TableHeaderCell>
        )
      },
      cell: ({ cell, getValue }) => {
        const value = getValue()
        return (
          <TableDataCell
            cell={cell}
          >
            <Div
              className="cursor-text py-1 pr-px pl-2.5 tracking-[.04em] select-text"
              onClick={(ev) => ev.stopPropagation()}
            >
              <span>{value}</span>
            </Div>
          </TableDataCell>
        )
      },
    }),
    columnHelper.accessor((row) => row.vote_average, {
      id: 'vote_average',
      header: ({ header }) => {
        const title = 'Rating'
        const isSorted = header.column.getIsSorted()
        return (
          <TableHeaderCell
            header={header}
            className="w-[.1%] active:bg-background-active active:signal/active [&:active+th]:signal/active"
          >
            <Div
              className="group gap-2 pr-1 select-none"
              onClick={(e) => {
                header.column.getToggleSortingHandler()?.(e)
                requestAnimationFrame(() => rootRef?.current?.scrollTo({ top: 0 }))
              }}
            >
              <Separator
                orientation="vertical"
                className="h-5 signal/active:h-full"
              />
              <HeaderTitle
                title={title}
                isSorted={isSorted}
                className="*:data-title:text-left"
              />
            </Div>
          </TableHeaderCell>
        )
      },
      cell: ({ cell, row, getValue }) => {
        const value = getValue()
        const voteCount = row.original.vote_count
        return (
          <TableDataCell
            cell={cell}
          >
            {
              voteCount >= 1 ? (
                <Div className="flex flex-nowrap gap-1 px-1 tracking-[.03em] tabular-nums">
                  <div className="flex items-center gap-1.5">
                    <IconClarityStarSolid className="text-neutral-800 dark:text-neutral-100" />
                    <span className="font-semibold">
                      {voteNumberFormat.format(value)}
                    </span>
                  </div>
                  <span>
                    {`(${voteCountFormat.format(voteCount)})`}
                  </span>
                </Div>
              ) : (
                <Fragment></Fragment>
              )
            }
          </TableDataCell>
        )
      },
    }),
    columnHelper.accessor((row) => row.popularity || 0, {
      id: 'popularity',
      header: ({ header }) => {
        const title = 'Popularity'
        const isSorted = header.column.getIsSorted()
        return (
          <TableHeaderCell
            header={header}
            className="w-[.1%] active:bg-background-active active:signal/active [&:active+th]:signal/active"
          >
            <Div
              className="group gap-2 pr-1 select-none"
              onClick={(e) => {
                header.column.getToggleSortingHandler()?.(e)
                requestAnimationFrame(() => rootRef?.current?.scrollTo({ top: 0 }))
              }}
            >
              <Separator
                orientation="vertical"
                className="h-5 signal/active:h-full"
              />
              <HeaderTitle
                title={title}
                isSorted={isSorted}
                className="*:data-title:text-right"
              />
            </Div>
          </TableHeaderCell>
        )
      },
      cell: ({ cell, getValue }) => {
        const value = getValue()
        return (
          <TableDataCell
            cell={cell}
          >
            <Div className="justify-end pr-5 pl-0.5 tracking-[.03em] tabular-nums">
              <span>
                {popularityNumberFormat.format(value)}
              </span>
            </Div>
          </TableDataCell>
        )
      },
    }),
  ]
}

export default function Subtitles() {
  const store = useStore()
  const { isPending: isDownloadPending, mutateAsync: downloadText } = useAtomValue(openSubtitlesTextAtom)
  const { isPending: isFileDownloadPending, mutateAsync: downloadFile } = useAtomValue(openSubtitlesDownloadAtom)
  const [query, setQuery] = useAtom(mediaSearchAtom)
  const [{ initialTableState }, setCacheState] = useImmerAtom(cacheStateAtom)
  const debouncedQuery = useDebouncedValue(query, 500)
  const rootRef = useRef<HTMLDivElement>(null)
  const columns = useColumns(rootRef)
  const setFileInfo = useSetAtom(fileInfoAtom)
  const setSourceText = useSetAtom(sourceTextAtom)
  const [subtitleDownloadProgress, setSubtitleDownloadProgress] = useImmer([] as Download['Body'][])
  const queryEnabled = Boolean(debouncedQuery)
  const { data: multiData, isFetching: isSearchLoading } = useQuery($api.queryOptions(
    'get',
    '/3/search/multi',
    {
      params: {
        query: {
          query: debouncedQuery,
        },
      },
    },
    {
      enabled: queryEnabled,
      placeholderData: (prev) => prev,
    },
  ))
  const { data: languages = [] } = useQuery($osApi.queryOptions(
    'get',
    '/infos/languages',
    {
    },
    {
      gcTime: ms('1 weeks'),
      staleTime: ms('1 weeks'),
      select: ({ data }) => data,
      placeholderData: (prev) => prev,
    },
  ))
  const languageOptions = [
    {
      language_code: 'all',
      language_name: 'All Languages',
    },
    ...uniqBy(
      [
        {
          language_code: 'en',
          language_name: 'English',
        },
        ...languages,
      ],
      (language) => language.language_code,
    ).sort((a, b) => a.language_name.localeCompare(b.language_name)),
  ]
  const tvAndMovieResults = queryEnabled ? (multiData?.results ?? []).filter(({ media_type }) => media_type === 'tv' || media_type === 'movie') : []
  const table = useClone(useReactTable({
    data: tvAndMovieResults,
    columns,
    initialState: initialTableState,
    autoResetPageIndex: false,
    getRowId: (row) => String(row.id),
    getRowCanExpand: () => true,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSortedRowModel: getSortedRowModel(),
  }))
  const rowsFiltered = table.getFilteredRowModel().rows
  const navigate = useNavigate()
  const [fileIds] = useAtom(fileIdsAtom)

  async function getText(fileIds: number[]) {
    pipe(
      await Promise.all(
        fileIds.map((id) => {
          const file = {
            file_id: id,
          }
          return downloadText(file)
            .then(tap(() => {
              setSubtitleDownloadProgress((prev) => {
                prev.push(file)
              })
            }))
        }),
      ),
      tap((x) => {
        setFileInfo(listFormatter.format(x.map((f) => f.file.file_name)))
      }),
      tap((x) => {
        setSourceText((v) => ({
          value: x.map((f) => f.text).join('\n'),
          epoch: v.epoch + 1,
        }))
      }),
    )
    navigate('/')
    startTransition(() => {
      setSubtitleDownloadProgress([])
    })
  }

  async function downloadFiles(fileIds: number[]) {
    await Promise.all(fileIds.map(async (id) => {
      const file = {
        file_id: id,
      }
      await downloadFile(file)
      setSubtitleDownloadProgress((prev) => {
        prev.push(file)
      })
    }))
    setSubtitleDownloadProgress([])
  }

  function clearSelection() {
    Array.from(mediaSubtitleAtomFamily.getParams(), mediaSubtitleAtomFamily).forEach((a) => {
      store.set(a, produce(({ tableState }) => {
        tableState.rowSelection = {}
      }))
    })
  }

  const tableState = table.getState()
  const { items } = usePagination({
    count: table.getPageCount(),
    page: tableState.pagination.pageIndex + 1,
  })
  const { t } = useTranslation()

  useUnmountEffect(() => {
    setCacheState((draft) => {
      draft.initialTableState = tableState
    })
  })
  const inputRef = useRef<HTMLInputElement>(null)
  useHotkeys('meta+f', (e) => {
    if (document.activeElement === inputRef.current) {
      return
    }
    e.preventDefault()
    const el = inputRef.current
    if (el) {
      el.focus()
      el.select()
    }
  })
  const isLoading = isDownloadPending || isFileDownloadPending
  const [language, setLanguage] = useAtom(osLanguageAtom)
  return (
    <div className="flex h-full flex-col">
      <div className="pb-3">
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            className="h-8 gap-0.5 pr-3 pl-2.5 text-xs"
            asChild
          >
            <Link to="/">
              <MiChevronLeft className="size-4.5" />
              Home
            </Link>
          </Button>
          <div className="grow" />
          <Popover>
            <PopoverTrigger className="h-8" asChild>
              <Button
                variant="ghost"
                className="gap-1.5 px-3"
              >
                <IconOuiTokenKey className="min-w-[1em]" />
                <span className="hidden md:block">
                  OpenSubtitles
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 [--sq-r:1.75rem]">
              <OpensubtitlesAuthentication />
            </PopoverContent>
          </Popover>
          <Button
            className="h-8 gap-1.5 px-3 tracking-[.03em] tabular-nums"
            onClick={() => {
              getText(fileIds)
            }}
            disabled={fileIds.length === 0 || isLoading}
          >
            <F7CaptionsBubbleFill className="min-w-[1em]" />
            <span className="hidden md:block">
              View Text
            </span>
          </Button>
          <Button
            className="h-8 gap-1.5 px-3 tracking-[.03em] tabular-nums"
            onClick={() => {
              downloadFiles(fileIds)
            }}
            disabled={fileIds.length === 0 || isLoading}
          >
            <IconF7ArrowDownCircleFill className="min-w-[1em]" />
            <span className="hidden md:block">
              Download
            </span>
          </Button>
        </div>
      </div>
      <div className="flex grow items-center justify-center overflow-hidden rounded-xl border sq:rounded-3xl">
        <div
          className="flex size-full flex-col"
        >
          <div>
            <div className="flex h-12 gap-2 p-2">
              <div>
                <Input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                  }}
                  className="h-full text-base [--sq-r:.75rem] md:text-sm"
                />
              </div>
              <Select
                value={language}
                onValueChange={(e) => {
                  setLanguage(e)
                }}
              >
                <SelectTrigger className="h-full! w-[unset] gap-0 px-2 py-0 text-xs tracking-[.03em] tabular-nums">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent
                  position="item-aligned"
                  className="tracking-[.03em] tabular-nums"
                >
                  {languageOptions.map((language) => (
                    <SelectItem
                      key={language.language_code}
                      className="pr-4 text-xs"
                      value={language.language_code}
                    >
                      {language.language_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex aspect-square h-full grow items-center justify-start pl-1.5">
                {isSearchLoading ? (
                  <IconLucideLoader2
                    className="animate-spin"
                  />
                ) : null}
              </div>
              <Button
                className={clsx(
                  fileIds.length === 0 ? 'hidden' : '',
                  'h-8 gap-1.5 px-3',
                )}
                variant="ghost"
                disabled={fileIds.length === 0 || isLoading}
                onClick={clearSelection}
              >
                <IconF7MultiplyCircle className="min-w-[1em]" />
                <span className="hidden md:block">
                  Clear
                </span>
              </Button>
              <div className="flex items-center gap-1.5 pr-1.5 text-sm">
                {isLoading ? (
                  <IconLucideLoader2
                    className="min-w-[1em] animate-spin"
                  />
                ) : null}
                {isLoading ? (
                  <div className="flex items-center gap-1.5">
                    <span>
                      <NumberFlow
                        value={subtitleDownloadProgress.length}
                      />
                      {` / `}
                      <NumberFlow
                        value={fileIds.length}
                      />
                    </span>
                  </div>
                ) : (
                  <NumberFlow
                    value={fileIds.length}
                    className={clsx(fileIds.length === 0 ? 'hidden' : '')}
                    isolate
                  />
                )}
                <span
                  className={clsx(fileIds.length === 0 ? 'hidden' : '')}
                >
                  {fileIds.length === 1 ? 'item' : 'items'}
                </span>
              </div>
            </div>
          </div>
          <div
            ref={rootRef}
            className="grow overflow-auto overflow-y-scroll overscroll-contain [scrollbar-width:thin]"
          >
            <table className="relative border-separate border-spacing-0">
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHeaderCellRender
                        key={header.id}
                        header={header}
                      />
                    ))}
                  </tr>
                ))}
              </TableHeader>
              <tbody className="*:data-row:h-9">
                {table.getRowModel().rows.map((row, index) => {
                  return (
                    <TableRow
                      key={row.id}
                      row={row}
                      root={rootRef}
                      index={index + 1}
                    >
                      <MediaDetails
                        id={row.original.id}
                        media_type={row.original.media_type}
                      />
                    </TableRow>
                  )
                })}
              </tbody>
            </table>
            <TableGoToLastPage
              table={table}
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-0.5 border-t border-t-zinc-200 py-1 pr-0.5 tracking-[.03em] tabular-nums dark:border-neutral-800">
            <TablePagination
              items={items}
              table={table}
              rootRef={rootRef}
            />
            <div className="flex grow items-center justify-end">
              <div className="flex items-center text-xs">
                <TablePaginationSizeSelect
                  table={table}
                  sizes={PAGE_SIZES}
                  value={tableState.pagination.pageSize}
                />
                <div className="px-1 whitespace-nowrap">{`/${t('page')}`}</div>
              </div>
            </div>
          </div>
          <div className="flex justify-center border-t border-solid border-t-zinc-200 bg-background dark:border-neutral-800">
            <div className="flex h-7 items-center text-xs tracking-[.03em] tabular-nums">
              <span>
                <NumberFlow
                  value={rowsFiltered.length}
                  locales="en-US"
                  animated
                  isolate
                />
                <span>
                  {` items`}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
