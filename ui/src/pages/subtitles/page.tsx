import type { InitialTableState } from '@tanstack/react-table'

import usePagination from '@mui/material/usePagination'
import NumberFlow from '@number-flow/react'
import { useUnmountEffect } from '@react-hookz/web'
import { useQuery } from '@tanstack/react-query'
import { createColumnHelper, getCoreRowModel, getExpandedRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'
import clsx from 'clsx'
import { format } from 'date-fns'
import { useDebouncedValue } from 'foxact/use-debounced-value'
import { atom, useAtom, useSetAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { uniqBy } from 'lodash-es'
import { startTransition, useEffect, useRef, useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import IconClarityStarSolid from '~icons/clarity/star-solid'
import IconF7ArrowDownCircleFill from '~icons/f7/arrow-down-circle-fill'
import IconF7MultiplyCircle from '~icons/f7/multiply-circle'
import IconLucideChevronRight from '~icons/lucide/chevron-right'
import IconLucideLoader2 from '~icons/lucide/loader2'
import IconOuiTokenKey from '~icons/oui/token-key'

import type { paths as PathsThemoviedb } from '@/types/schema-themoviedb'

import { $osApi, useOpenSubtitlesDownload } from '@/api/opensubtitles'
import { $api } from '@/api/tmdb'
import { MediaDetails } from '@/components/media-details'
import { OpensubtitlesAuthentication } from '@/components/subtitle/opensubtitles-authentication'
import { TablePagination } from '@/components/table-pagination'
import { TablePaginationSizeSelect } from '@/components/table-pagination-size-select'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Div } from '@/components/ui/html-elements'
import { Input, InputWrapper } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { HeaderTitle, TableDataCell, TableHeader, TableHeaderCell, TableHeaderCellRender, TableRow } from '@/components/ui/table-element'
import { MS_PER_WEEK } from '@/constants/time'
import { SortIcon } from '@/lib/icon-utils'
import { getFilterFn } from '@/lib/table-utils'
import { findClosest } from '@/lib/utilities'
import { fileIdsAtom, osLanguageAtom, sourceTextAtom, subtitleDownloadProgressAtom, subtitleSelectionStateAtom } from '@/store/useVocab'

const mediaSearchAtom = atomWithStorage('mediaSearchAtom', '')

const popularityNumberFormat = new Intl.NumberFormat('en', { maximumFractionDigits: 1, minimumFractionDigits: 1 })
const voteNumberFormat = new Intl.NumberFormat('en', { maximumFractionDigits: 1, minimumFractionDigits: 1 })
const voteCountFormat = new Intl.NumberFormat('en', { notation: 'compact', compactDisplay: 'short' })

type TableData = NonNullable<PathsThemoviedb['/3/search/multi']['get']['responses'][200]['content']['application/json']['results']>[number]

const PAGE_SIZES = [5, 10, 20] as const

const initialTableStateAtom = atom<InitialTableState>({
  pagination: {
    pageSize: findClosest(100, PAGE_SIZES),
    pageIndex: 0,
  },
})

function useColumns<T extends TableData>() {
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
              className="min-w-10 select-none justify-center gap-2 signal/active:bg-background-active"
              onClick={header.column.getToggleSortingHandler()}
            >
              <div
                className="flex [font-stretch:condensed]"
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
            <Div className="pl-0.5 pr-px text-zinc-400">
              {row.getCanExpand() ? (
                <div
                  className="flex h-full grow cursor-pointer select-none items-center justify-center"
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
                      'size-[14px] text-zinc-400 transition-transform dark:text-zinc-500',
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
              className="group select-none gap-2 pr-1"
              onClick={header.column.getToggleSortingHandler()}
            >
              <Separator
                orientation="vertical"
                className="h-5 signal/active:h-full"
              />
              <HeaderTitle
                title={title}
                isSorted={isSorted}
                className="data-[title]:*:text-left"
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
            <Div className="justify-center pl-0.5 pr-px tabular-nums [font-stretch:condensed]">
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
              className="group select-none gap-2 pr-1"
              onClick={header.column.getToggleSortingHandler()}
            >
              <Separator
                orientation="vertical"
                className="h-5 signal/active:h-full"
              />
              <HeaderTitle
                title={title}
                isSorted={isSorted}
                className="data-[title]:*:text-right"
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
              className="justify-center pl-0.5 pr-px capitalize tabular-nums [font-stretch:condensed] data-[value='tv']:uppercase"
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
      filterFn: getFilterFn(),
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
              onClick={header.column.getToggleSortingHandler()}
            >
              <Separator
                orientation="vertical"
                className="h-5 signal/active:h-full"
              />
              <HeaderTitle
                title={title}
                isSorted={isSorted}
                className="data-[title]:*:text-left"
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
              className="cursor-text select-text pl-2.5 pr-px tracking-wider [font-feature-settings:'cv03','cv05','cv06']"
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
              className="group select-none gap-2 pr-1 [font-stretch:condensed]"
              onClick={header.column.getToggleSortingHandler()}
            >
              <Separator
                orientation="vertical"
                className="h-5 signal/active:h-full"
              />
              <HeaderTitle
                title={title}
                isSorted={isSorted}
                className="data-[title]:*:text-left"
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
                <Div className="flex flex-nowrap gap-1 px-1 tabular-nums">
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
                <></>
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
              className="group select-none gap-2 pr-1"
              onClick={header.column.getToggleSortingHandler()}
            >
              <Separator
                orientation="vertical"
                className="h-5 signal/active:h-full"
              />
              <HeaderTitle
                title={title}
                isSorted={isSorted}
                className="data-[title]:*:text-right"
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
            <Div className="justify-end pl-0.5 pr-5 tabular-nums [font-stretch:condensed]">
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
  // eslint-disable-next-line react-compiler/react-compiler
  'use no memo'
  const { isPending: isDownloadPending, mutateAsync: download } = useOpenSubtitlesDownload()
  const [query, setQuery] = useAtom(mediaSearchAtom)
  const [initialTableState, setInitialTableState] = useAtom(initialTableStateAtom)
  const debouncedQuery = useDebouncedValue(query, 500)
  const columns = useColumns()
  const setSourceText = useSetAtom(sourceTextAtom)
  const [subtitleDownloadProgress, setSubtitleDownloadProgress] = useAtom(subtitleDownloadProgressAtom)
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
      gcTime: MS_PER_WEEK,
      staleTime: MS_PER_WEEK,
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
  const table = useReactTable({
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
    debugTable: true,
  })
  const rowsFiltered = table.getFilteredRowModel().rows
  const navigate = useNavigate()
  const setSubtitleSelectionState = useSetAtom(subtitleSelectionStateAtom)
  const [fileIds] = useAtom(fileIdsAtom)
  const [downloadProgressAnim, setDownloadProgressAnim] = useState(false)

  async function getFiles(fileIds: number[]) {
    setDownloadProgressAnim(true)
    const fileTexts = await Promise.all(fileIds.map(async (id) => {
      const { text } = await download({
        file_id: id,
      })
      return text
    }))
    setSourceText((v) => ({
      text: fileTexts.join('\n'),
      version: v.version++,
    }))
  }

  useEffect(() => {
    if (subtitleDownloadProgress.length >= 1 && !downloadProgressAnim) {
      navigate('/')
      startTransition(() => {
        setSubtitleDownloadProgress([])
      })
    }
  }, [downloadProgressAnim, navigate, setSubtitleDownloadProgress, subtitleDownloadProgress.length])

  function clearSelection() {
    setSubtitleSelectionState({})
  }

  const tableState = table.getState()
  const { items } = usePagination({
    count: table.getPageCount(),
    page: tableState.pagination.pageIndex + 1,
  })
  const { t } = useTranslation()

  useUnmountEffect(() => {
    setInitialTableState(tableState)
  })
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  useHotkeys('meta+f', (e) => {
    if (document.activeElement === inputRef.current)
      return
    e.preventDefault()
    inputRef.current?.focus()
  })
  const isLoading = downloadProgressAnim || subtitleDownloadProgress.length >= 1
  const [language, setLanguage] = useAtom(osLanguageAtom)
  return (
    <div className="flex h-full flex-col">
      <div className="pb-3">
        <div className="flex items-center gap-2">
          <div className="grow" />
          <Popover>
            <PopoverTrigger className="h-8" asChild>
              <Button
                variant="ghost"
                className="gap-1.5 px-3"
              >
                <IconOuiTokenKey className="min-w-[1em]" />
                <span className="hidden md:block">
                  OpenSubtitles Login
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72">
              <OpensubtitlesAuthentication />
            </PopoverContent>
          </Popover>
          <Button
            className="h-8 gap-1.5 px-3"
            variant="outline"
            disabled={fileIds.length === 0 || isDownloadPending || isLoading}
            onClick={clearSelection}
          >
            <IconF7MultiplyCircle className="min-w-[1em]" />
            <span className="hidden md:block">
              Clear
            </span>
          </Button>
          <Button
            className="h-8 gap-1.5 px-3 tabular-nums"
            onClick={() => {
              getFiles(fileIds)
            }}
            disabled={fileIds.length === 0 || isDownloadPending}
          >
            {isLoading ? (
              <IconLucideLoader2
                className="min-w-[1em] animate-spin"
              />
            ) : (
              <IconF7ArrowDownCircleFill className="min-w-[1em]" />
            )}
            <span className="hidden md:block">
              Download
            </span>
            {isLoading ? (
              <div className="flex items-center gap-1.5">
                <span>
                  <NumberFlow
                    value={subtitleDownloadProgress.length}
                    onAnimationsFinish={() => {
                      if (subtitleDownloadProgress.length === fileIds.length)
                        setDownloadProgressAnim(false)
                    }}
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
          </Button>
        </div>
      </div>
      <div className="flex grow items-center justify-center overflow-hidden rounded-xl border sq:rounded-3xl sq:[corner-shape:squircle]">
        <div
          className="flex size-full flex-col bg-[--theme-bg]"
        >
          <div>
            <div className="flex h-12 gap-2 p-2">
              <InputWrapper className="[--sq-r:.8125rem]">
                <Input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                  }}
                  className="h-full text-base md:text-sm"
                />
              </InputWrapper>
              <Select
                value={language}
                onValueChange={(e) => {
                  setLanguage(e)
                }}
              >
                <SelectTrigger className="h-full w-[unset] px-2 py-0 text-xs tabular-nums">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent
                  position="item-aligned"
                  className="tabular-nums"
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
            </div>
          </div>
          <div
            ref={rootRef}
            className="grow overflow-auto overflow-y-scroll overscroll-contain"
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
              <tbody className="data-[row]:*:h-9">
                {table.getRowModel().rows.map((row, index) => {
                  return (
                    <TableRow
                      key={row.id}
                      row={row}
                      rootRef={rootRef}
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
          </div>
          <div className="flex flex-wrap items-center justify-between gap-0.5 border-t border-t-zinc-200 py-1 pr-0.5 tabular-nums dark:border-slate-800">
            <TablePagination
              items={items}
              table={table}
            />
            <div className="flex grow items-center justify-end">
              <div className="flex items-center text-xs">
                <TablePaginationSizeSelect
                  table={table}
                  sizes={PAGE_SIZES}
                  value={tableState.pagination.pageSize}
                />
                <div className="whitespace-nowrap px-1">{`/${t('page')}`}</div>
              </div>
            </div>
          </div>
          <div className="flex justify-center border-t border-solid border-t-zinc-200 bg-background dark:border-slate-800">
            <div className="flex h-7 items-center text-xs tabular-nums">
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
