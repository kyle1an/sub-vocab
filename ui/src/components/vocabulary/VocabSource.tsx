import { PropType, computed, defineComponent, ref, watch } from 'vue'
import { TransitionPresets, useSessionStorage, useTransition } from '@vueuse/core'
import { ElPagination, ElTable, ElTableColumn } from 'element-plus'
import { pipe } from 'fp-ts/function'
import { t } from '@/i18n'
import type { LabelSubDisplay, Sorting, SrcRow } from '@/types'
import { isMobile, orderBy, paging, selectWord } from '@/utils/utils'
import { Examples } from '@/components/vocabulary/Examples'
import { SegmentedControl } from '@/components/SegmentedControl'
import { Length, Rank, VocabSearch } from '@/components/vocabulary/VocabComponents'
import { useElHover, useState, useStateCallback } from '@/composables/utilities'
import { VocabToggle } from '@/components/vocabulary/ToggleButton'

export const VocabSourceTable = defineComponent({
  props: {
    data: { default: () => [], type: Array as PropType<SrcRow<LabelSubDisplay>[]> },
    sentences: { default: () => [''], type: Array as PropType<string[]> },
    expand: { default: false, type: Boolean },
    tableName: { required: true, type: String }
  },
  setup(props) {
    const segments = computed(() => [
      { value: 'all', label: t('all') },
      { value: 'new', label: t('new') },
      { value: 'acquainted', label: t('acquainted') },
    ] as const)
    type TableSegment = typeof segments.value[number]['value']
    const prevSegment = useSessionStorage(`${props.tableName}-segment`, 'all')
    const initialSegment = segments.value.find((s) => s.value === prevSegment.value)?.value ?? 'all'
    const [segment, setSegment] = useStateCallback<TableSegment>(initialSegment, (v) => {
      setDisabledTotal(true)
      prevSegment.value = v
    })
    const [dirty, setDirty] = useState(false)
    const vocabTable = ref()
    const isHoveringOnTable = useElHover('.el-table__body-wrapper')
    watch(isHoveringOnTable, (isHovering) => {
      if (dirty.value && !isHovering) {
        setRowsDisplay(rows.value)
        setDirty(false)
      }
    })
    const [search] = useState('')
    const defaultSort: Sorting = { order: 'ascending', prop: 'src.0.wordSequence' }
    const [sortBy, setSortBy] = useState(defaultSort)
    const onSortChange = ({ order, prop }: Sorting) => {
      setSortBy(order && prop ? { order, prop } : defaultSort)
    }
    const [currPage] = useState(1)
    const [pageSize] = useState(100)
    watch(currPage, () => {
      vocabTable.value.setScrollTop(0)
    })
    const [rowsDisplay, setRowsDisplay] = useState<typeof props.data[number][]>([])
    const [disabledTotal, setDisabledTotal] = useState(true)
    const [inputDirty, setInputDirty] = useState(false)
    watch(() => props.data, () => {
      setDisabledTotal(false)
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
      } else {
        return rowsSegmented.value.filter((r) => r.vocab.wFamily.some((w) => w.toLowerCase().includes(searching)))
      }
    })
    const rows = computed(() => pipe(searched.value,
      orderBy(sortBy.value.prop, sortBy.value.order),
      paging(currPage.value, pageSize.value),
    ))
    watch(rows, (v) => {
      if (inputDirty.value) {
        setRowsDisplay(v)
        setInputDirty(false)
      } else if (!isHoveringOnTable.value) {
        setRowsDisplay(v)
      } else {
        setDirty(true)
      }
    }, { immediate: true })
    const totalTransit = useTransition(computed(() => searched.value.length), {
      disabled: disabledTotal,
      transition: TransitionPresets.easeOutCirc,
    })

    function expandRow(row: SrcRow<LabelSubDisplay>, col: unknown, event: Event) {
      for (const el of event.composedPath()) {
        if ((el as HTMLElement).tagName.toLowerCase() === 'button') {
          return
        }

        if (el === event.currentTarget) {
          break
        }
      }
      vocabTable.value?.toggleRowExpansion(row)
    }

    return () => (
      <div class="mx-5 flex h-full flex-col items-center overflow-hidden rounded-xl border border-inherit bg-white shadow-sm will-change-transform md:mx-0">
        <SegmentedControl
          name={props.tableName}
          segments={segments.value}
          value={segment.value}
          onChoose={setSegment}
        />
        <div class="h-px w-full grow">
          <ElTable
            ref={vocabTable}
            data={rowsDisplay.value}
            rowKey={(row: typeof props.data[number]) => '_' + row.vocab.w}
            class={String.raw`!h-full from-[var(--el-border-color-lighter)] to-white [&_*]:overscroll-contain [&_.el-icon]:pointer-events-none [&_.el-table\_\_expand-icon]:tap-transparent [&_.el-table\_\_inner-wrapper]:!h-full [&_.el-table\_\_row:has(+tr:not([class]))>td]:!border-white [&_.el-table\_\_row:has(+tr:not([class]))>td]:bg-gradient-to-b [&_th_.cell]:font-compact`}
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
                    v-slots={({ row }: { row: typeof props.data[number] }) =>
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
                  v-slots={({ row }: { row: typeof props.data[number] }) =>
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
                    default: ({ row }: { row: typeof props.data[number] }) => (
                      row.vocab.wFamily.map((w, i) => (
                        <div
                          key={w}
                          class="inline-block cursor-text select-text font-compact text-[16px] tracking-wide text-black"
                          onClick={(ev) => ev.stopPropagation()}
                        >
                          <span class={`${i !== 0 ? 'text-neutral-500' : ''}`} onMouseover={isMobile ? () => void 0 : selectWord}>{w}</span>
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
            pageSizes={[25, 100, 200, 500, 1000, rowsSegmented.value.length]}
            pagerCount={5}
            small
            total={~~totalTransit.value}
            class={String.raw`shrink-0 select-none flex-wrap gap-y-1.5 !p-1.5 tabular-nums [&_*]:!rounded-md [&_.el-pagination\_\_sizes.is-last]:!m-0 [&_.el-pagination\_\_total]:mx-[10px] [&_.is-active]:bg-neutral-100`}
            layout="prev, pager, next, ->, total, sizes"
          />
        </div>
      </div>
    )
  }
})
