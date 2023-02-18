import { computed, defineComponent, ref, watch } from 'vue'
import { TransitionPresets, useSessionStorage, useTransition } from '@vueuse/core'
import { ElPagination, ElTable, ElTableColumn } from 'element-plus'
import { pipe } from 'fp-ts/function'
import { formatDistanceToNowStrict } from 'date-fns'
import { t } from '@/i18n'
import { SegmentedControl } from '@/components/SegmentedControl'
import { isMobile, orderBy, paging, selectWord } from '@/utils/utils'
import type { MyVocabRow, Sorting, SrcRow } from '@/types'
import { VocabToggle } from '@/components/vocabulary/ToggleButton'
import { useElHover, useState } from '@/composables/utilities'
import { Length, Rank, VocabSearch } from '@/components/vocabulary/VocabComponents'
import { useVocabStore } from '@/store/useVocab'

export const VocabDataTable = defineComponent({
  props: {
    tableName: { required: true, type: String }
  },
  setup(props) {
    const store = useVocabStore()
    const segments = computed(() => [
      { value: 'all', label: t('all') },
      { value: 'mine', label: t('mine') },
      { value: 'top', label: t('top') },
      { value: 'recent', label: t('recent') },
    ] as const)
    type TableSegment = typeof segments.value[number]['value']
    type RowData = SrcRow<typeof store.baseVocab[number]>
    const prevSegment = useSessionStorage(`${props.tableName}-segment`, 'all')
    const initialSegment = segments.value.find((s) => s.value === prevSegment.value)?.value ?? 'all'
    const [segment, setSegment] = useState<TableSegment>(initialSegment)
    watch(segment, (v) => {
      setDisabledTotal(true)
      prevSegment.value = v
    })
    const [dirty, setDirty] = useState(false)
    const vocabTable = ref()
    const isHoveringOnTable = useElHover('.el-table__body-wrapper')
    watch(isHoveringOnTable, (isHovering) => {
      if (!dirty.value) return
      if (!isHovering || rowsDisplay.value.length === 0) {
        setRowsDisplay(rows.value)
        setDirty(false)
      }
    })
    const [search] = useState('')
    const defaultSort: Sorting = { order: 'descending', prop: 'vocab.time_modified' }
    const [sortBy, setSortBy] = useState(defaultSort)
    const onSortChange = ({ order, prop }: Sorting) => {
      setSortBy(order && prop ? { order, prop } : defaultSort)
    }
    const [currPage] = useState(1)
    const [pageSize] = useState(100)
    watch(currPage, () => {
      vocabTable.value.setScrollTop(0)
    })
    const [rowsDisplay, setRowsDisplay] = useState<MyVocabRow[]>([])
    const [disabledTotal, setDisabledTotal] = useState(true)
    const srcRows = computed(() => {
      setDisabledTotal(false)
      return store.baseVocab.map((r) => ({ vocab: r }))
    })
    const rowsSegmented = computed(() => srcRows.value.filter(
      segment.value === 'mine' ? (r) => Boolean(r.vocab.acquainted && r.vocab.is_user)
        : segment.value === 'top' ? (r) => Boolean(r.vocab.acquainted && !r.vocab.is_user)
          : segment.value === 'recent' ? (r) => !r.vocab.acquainted && r.vocab.is_user !== 2
            : (r) => !!r.vocab.acquainted
    ))
    const searched = computed(() => {
      const searching = search.value.trim().toLowerCase()
      if (!searching) {
        return rowsSegmented.value
      } else {
        return rowsSegmented.value.filter((r) => r.vocab.w.toLowerCase().includes(searching))
      }
    })
    const rows = computed(() => pipe(searched.value,
      orderBy(sortBy.value.prop, sortBy.value.order),
      paging(currPage.value, pageSize.value),
    ))
    watch(rows, (v) => {
      if (!isHoveringOnTable.value || rowsDisplay.value.length === 0) {
        setRowsDisplay(v)
      } else {
        setDirty(true)
      }
    }, { immediate: true })
    const totalTransit = useTransition(computed(() => searched.value.length), {
      disabled: disabledTotal,
      transition: TransitionPresets.easeOutCirc,
    })
    return () => (
      <div class="flex grow flex-col overflow-hidden rounded-xl border bg-white shadow will-change-transform md:mx-0">
        <SegmentedControl
          name={props.tableName}
          segments={segments.value}
          value={segment.value}
          class="pt-3 pb-2"
          onChoose={setSegment}
        />
        <div class="h-px w-full grow">
          <ElTable
            ref={vocabTable}
            data={rowsDisplay.value}
            row-key={(row: RowData) => '_' + row.vocab.w}
            class={String.raw`!h-full !w-full md:w-full [&_*]:overscroll-contain [&_.el-table\_\_inner-wrapper]:!h-full [&_th_.cell]:font-compact [&_th_.cell]:tracking-normal`}
            size="small"
            onSort-change={onSortChange}
            v-slots={() => (
              <>
                <ElTableColumn
                  label={t('rank')}
                  className="!text-center [&>.cell]:!font-pro [&>.cell]:stretch-[condensed] [th&>.cell]:!pr-0"
                  width={64}
                  prop="vocab.rank"
                  sortable="custom"
                  v-slots={Rank}
                />
                <ElTableColumn
                  label={t('Vocabulary')}
                  prop="vocab.w"
                  min-width={70}
                  sortable="custom"
                  className="select-none [&>.cell]:!pr-0"
                  v-slots={{
                    header: () => VocabSearch(search),
                    default: ({ row }: { row: RowData }) =>
                      <span
                        class="cursor-text select-text text-[16px] tracking-wide text-neutral-800"
                        onMouseover={isMobile ? () => void 0 : selectWord}
                        onClick={(ev) => ev.stopPropagation()}
                      >
                        {row.vocab.w}
                      </span>
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
                  width="32"
                  className="overflow-visible !text-center [&_.cell]:!px-0"
                  v-slots={VocabToggle}
                />
                <ElTableColumn
                  label={t('distance')}
                  className="[td&_.cell]:!pr-0 [th&>.cell]:!font-pro [th&>.cell]:stretch-[condensed]"
                  width={82}
                  prop="vocab.time_modified"
                  sortable="custom"
                  v-slots={({ row }: { row: RowData }) => row.vocab.time_modified && (
                    <div
                      class="flex flex-row gap-0.5 font-compact tabular-nums tracking-normal text-neutral-900 ffs-[normal]"
                    >
                      {formatDistanceToNowStrict(new Date(row.vocab.time_modified))}
                    </div>
                  )}
                />
              </>
            )}
          />
        </div>
        <div class="min-h-9 w-full">
          <ElPagination
            v-model:currentPage={currPage.value}
            v-model:pageSize={pageSize.value}
            pageSizes={[100, 200, 500, 1000, rowsSegmented.value.length]}
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
