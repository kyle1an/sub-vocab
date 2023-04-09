import { computed, defineComponent, ref, shallowRef, watch } from 'vue'
import { TransitionPresets, useSessionStorage, useTransition } from '@vueuse/core'
import { ElPagination, ElTable, ElTableColumn, type Sort, type TableInstance } from 'element-plus'
import { pipe } from 'fp-ts/function'
import { t } from '@/i18n'
import type { LabelSubDisplay, SrcRow } from '@/types'
import { isMobile, orderBy, paging, selectWord } from '@/utils/utils'
import { Examples } from '@/components/vocabulary/Examples'
import { SegmentedControl } from '@/components/SegmentedControl'
import { Length, Rank, VocabSearch } from '@/components/vocabulary/VocabComponents'
import { createSignal, useElHover } from '@/composables/utilities'
import { VocabToggle } from '@/components/vocabulary/ToggleButton'

export const VocabSourceTable = Object.assign(defineComponent((props: {
  data: SrcRow<LabelSubDisplay>[]
  sentences: string[]
  expand?: boolean
  tableName: string
}) => {
  const segments = () => [
    { value: 'all', label: t('all') },
    { value: 'new', label: t('new') },
    { value: 'acquainted', label: t('acquainted') },
  ] as const
  type RowData = typeof props.data[number]
  const cachedSeg = useSessionStorage(`${props.tableName}-segment`, 'all')
  const initialSegment = segments().find((s) => s.value === cachedSeg.value)?.value ?? 'all'
  const segment = shallowRef<ReturnType<typeof segments>[number]['value']>(initialSegment)
  watch(segment, (v) => {
    disabledTotal.value = true
    cachedSeg.value = v
  })
  const [dirty, setDirty] = createSignal(false)
  const vocabTable = ref<TableInstance>()
  const isHoveringOnTable = useElHover('.el-table__body-wrapper')
  watch(isHoveringOnTable, (isHovering) => {
    if (dirty() && !isHovering) {
      setRowsDisplay(rows.value)
      setDirty(false)
    }
  })
  const search = shallowRef('')
  const defaultSort: Sort = { order: 'ascending', prop: 'src.0.wordSequence' }
  const [sortBy, setSortBy] = createSignal(defaultSort)
  const onSortChange = ({ order, prop }: Sort) => {
    setSortBy(order && prop ? { order, prop } : defaultSort)
  }
  const currPage = shallowRef(1)
  const pageSize = shallowRef(100)
  watch(currPage, () => {
    vocabTable.value?.setScrollTop(0)
  })
  const [rowsDisplay, setRowsDisplay] = createSignal<RowData[]>([])
  const disabledTotal = shallowRef(true)
  const [inputDirty, setInputDirty] = createSignal(false)
  watch(() => props.data, () => {
    disabledTotal.value = false
    setInputDirty(true)
  })
  const rowsSegmented = computed(() =>
    segment.value === 'new' ? props.data.filter((r) => !r.vocab.acquainted && r.vocab.w.length > 2)
      : segment.value === 'acquainted' ? props.data.filter((r) => Boolean(r.vocab.acquainted || r.vocab.w.length <= 2))
        : props.data,
  )
  const searched = computed(() => {
    const searching = search.value.trim().toLowerCase()
    if (!searching) {
      return rowsSegmented.value
    }

    return rowsSegmented.value.filter((r) => r.vocab.wFamily.some((w) => w.toLowerCase().includes(searching)))
  })
  const rows = computed(() => pipe(searched.value,
    orderBy(sortBy().prop, sortBy().order),
    paging(currPage.value, pageSize.value),
  ))
  watch(rows, (v) => {
    if (inputDirty()) {
      setRowsDisplay(v)
      setInputDirty(false)
    } else if (!isHoveringOnTable()) {
      setRowsDisplay(v)
    } else {
      setDirty(true)
    }
  }, { immediate: true })
  const totalTransit = useTransition(() => searched.value.length, {
    disabled: disabledTotal,
    transition: TransitionPresets.easeOutCirc,
  })

  function expandRow(row: RowData, col: unknown, event: Event) {
    for (const el of event.composedPath()) {
      if ((el as HTMLElement).tagName.toLowerCase() === 'button') {
        return
      }

      if (el === event.currentTarget) {
        vocabTable.value?.toggleRowExpansion(row)
        break
      }
    }
  }

  return () => (
    <div class="mx-5 flex h-full flex-col items-center overflow-hidden rounded-xl border border-inherit bg-white shadow-sm will-change-transform md:mx-0">
      <SegmentedControl
        name={props.tableName}
        segments={segments()}
        value={segment.value}
        onChoose={(v) => segment.value = v}
      />
      <div class="h-px w-full grow">
        <ElTable
          ref={vocabTable}
          data={rowsDisplay()}
          rowKey={(row: RowData) => '_' + row.vocab.w}
          class={String.raw`!h-full [&_*]:overscroll-contain [&_.el-icon]:pointer-events-none [&_.el-table\_\_expand-icon]:tap-transparent [&_.el-table\_\_inner-wrapper]:!h-full [&_.el-table\_\_row:has(+tr:not([class]))>td]:!border-white [&_.el-table\_\_row:has(+tr:not([class])):hover>td]:!bg-white ${props.expand ? String.raw`[&_.el-table\_\_row+.el-table\_\_row]:shadow-[0px_-4px_10px_-6px_rgba(0,0,0,0.1)]` : ``} [&_th_.cell]:font-compact`}
          size="small"
          rowClassName={() => `${props.expand ? 'cursor-pointer' : ''}`}
          onRow-click={props.expand ? expandRow : () => void 0}
          onSort-change={onSortChange}
          v-slots={() => (
            <>
              {props.expand && (
                <ElTableColumn
                  type="expand"
                  width={30}
                  className={String.raw`[&>.cell]:!p-0 [&_.el-table\_\_expand-icon]:float-right [&_i]:text-slate-500`}
                  v-slots={({ row }: { row: RowData }) =>
                    <Examples
                      sentences={props.sentences}
                      src={row.src}
                      class="tracking-wide"
                    />
                  }
                />
              )}
              <ElTableColumn
                label={t('frequency')}
                className={String.raw`!text-right [&>.cell]:!font-pro [&>.cell]:stretch-[condensed] [th&>.cell]:!p-0`}
                width={`${props.expand ? 58 : 68}`}
                prop="src.length"
                sortable="custom"
                v-slots={({ row }: { row: RowData }) =>
                  <div class="tabular-nums text-slate-400">
                    {row.src.length}
                  </div>
                }
              />
              <ElTableColumn
                label="Vocabulary"
                prop="vocab.w"
                min-width={16}
                sortable="custom"
                className="select-none [td&>.cell]:!pr-0"
                v-slots={{
                  header: () => VocabSearch(search),
                  default: ({ row }: { row: RowData }) => (
                    row.vocab.wFamily.map((w, i) => (
                      <div
                        key={w}
                        class="inline-block cursor-text select-text font-compact text-[16px] tracking-wide text-black"
                        onClick={(ev) => ev.stopPropagation()}
                      >
                        <span
                          class={`${i !== 0 ? 'text-neutral-500' : ''}`}
                          onMouseover={isMobile ? () => void 0 : selectWord}
                        >
                          {w}
                        </span>
                        {i !== row.vocab.wFamily.length - 1 && <span class="pr-1 text-neutral-300">, </span>}
                      </div>
                    )))
                }}
              />
              <ElTableColumn
                label={t('length')}
                prop="vocab.w.length"
                width={62}
                sortable="custom"
                className="!text-right [th&>.cell]:!p-0 [th&>.cell]:!font-pro [th&>.cell]:stretch-[condensed]"
                v-slots={Length}
              />
              <ElTableColumn
                width={40}
                className="overflow-visible !text-center"
                v-slots={VocabToggle}
              />
              <ElTableColumn
                label={t('rank')}
                className="!text-center [&>.cell]:!font-pro [&>.cell]:stretch-[condensed] [th&>.cell]:!p-0"
                width={52}
                prop="vocab.rank"
                sortable="custom"
                v-slots={Rank}
              />
            </>
          )}
        />
      </div>
      <div class="min-h-9 w-full">
        <ElPagination
          v-model:currentPage={currPage.value}
          v-model:pageSize={pageSize.value}
          pageSizes={[25, 50, 100, 200, 500, 1000, rowsSegmented.value.length]}
          pagerCount={5}
          small
          total={~~totalTransit.value}
          class={String.raw`shrink-0 select-none flex-wrap gap-y-1.5 !p-1.5 tabular-nums [&_*]:!rounded-md [&_.el-pagination\_\_sizes.is-last]:!m-0 [&_.el-pagination\_\_total]:mx-[10px] [&_.is-active]:bg-neutral-100`}
          layout="prev, pager, next, ->, total, sizes"
        />
      </div>
    </div>
  )
}), { props: ['data', 'sentences', 'expand', 'tableName'] })
