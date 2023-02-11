import { computed, defineComponent, ref, watch } from 'vue'
import { TransitionPresets, useSessionStorage, useTransition } from '@vueuse/core'
import { ElInput, ElPagination, ElTable, ElTableColumn } from 'element-plus'
import { pipe } from 'fp-ts/function'
import { formatDistanceToNowStrict } from 'date-fns'
import { t } from '@/i18n'
import { SegmentedControl } from '@/components/SegmentedControl'
import { isMobile, orderBy, paging, selectWord } from '@/utils/utils'
import type { MyVocabRow, Sorting, LabelSieveDisplay, SrcRow } from '@/types'
import { ToggleButton } from '@/components/vocabulary/ToggleButton'
import { useElHover, useState, useStateCallback } from '@/composables/utilities'
import { handleVocabToggle } from '@/utils/vocab'
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
type DataRow = SrcRow<LabelSieveDisplay>
const prevSeg = useSessionStorage(`${props.tableName}-segment`, 'all')
const [seg, setSeg] = useStateCallback<TableSegment>(segments.value.find((s) => s.value === prevSeg.value)?.value ?? 'all', (v) => {
  setDisabledTotal(true)
  prevSeg.value = v
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
  seg.value === 'mine' ? (r) => Boolean(r.vocab.acquainted && r.vocab.is_user)
    : seg.value === 'top' ? (r) => Boolean(r.vocab.acquainted && !r.vocab.is_user)
      : seg.value === 'recent' ? (r) => !r.vocab.acquainted && r.vocab.is_user !== 2
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
      value={seg.value}
      class="pt-3 pb-2"
      onChoose={setSeg}
    />
    <div class="h-px w-full grow">
      <ElTable
        ref={vocabTable}
        data={rowsDisplay.value}
        row-key={(row: DataRow) => '_' + row.vocab.w}
        class="!h-full !w-full md:w-full [&_*]:overscroll-contain [&_.el-table\\_\\_inner-wrapper]:!h-full [&_th_.cell]:font-compact [&_th_.cell]:tracking-normal"
        size="small"
        onSort-change={onSortChange}
      >
        <ElTableColumn
          label={t('rank')}
          className="!text-center [&>.cell]:!font-pro [&>.cell]:stretch-[condensed] [th&>.cell]:!pr-0"
          width={64}
          prop="vocab.rank"
          sortable="custom"
        >{{
          default: ({ row }: { row: DataRow }) =>
          <div class="tabular-nums text-neutral-500">
            {row.vocab.rank}
          </div>
        }}
        </ElTableColumn>
        <ElTableColumn
          label={t('Vocabulary')}
          prop="vocab.w"
          min-width={70}
          sortable="custom"
          className="select-none [&>.cell]:!pr-0"
        >{{
          header: () => (
          <div class={'inline'} onClick={(ev) => ev.stopPropagation()}>
            <ElInput
              v-model={search.value}
              class="!w-[calc(100%-26px)] !text-base md:!text-xs"
              size="small"
              placeholder={t('search')}
            />
          </div>
          ),
          default: ({ row }: { row: DataRow }) =>
            <span
              class="cursor-text select-text text-[16px] tracking-wide text-neutral-800"
              onMouseover={isMobile ? () => void 0 : selectWord}
              onClick={(ev) => ev.stopPropagation()}>
              {row.vocab.w}
            </span>
        }}
        </ElTableColumn>
        <ElTableColumn
          label={t('length')}
          prop="vocab.w.length"
          width={62}
          sortable="custom"
          className="!text-right [th&>.cell]:!p-0 [th&>.cell]:!font-pro [th&>.cell]:stretch-[condensed]"
        >{{
          default: ({ row }: { row: DataRow }) =>
          <div class="tabular-nums">
            {row.vocab.w.length}
          </div>
        }}
        </ElTableColumn>
        <ElTableColumn
          width="32"
          className="overflow-visible !text-center [&_.cell]:!px-0"
        >{{
          default: ({ row }: { row: DataRow }) =>
          <ToggleButton
            row={row.vocab}
            handleVocabToggle={handleVocabToggle}
          />
        }}
        </ElTableColumn>
        <ElTableColumn
          label={t('distance')}
          className="[td&_.cell]:!pr-0 [th&>.cell]:!font-pro [th&>.cell]:stretch-[condensed]"
          width={82}
          prop="vocab.time_modified"
          sortable="custom"
        >{{
      default: ({ row }: { row: DataRow }) =>
        row.vocab.time_modified && (
          <div
            class="flex flex-row gap-0.5 font-compact tabular-nums tracking-normal text-neutral-900 ffs-[normal]"
          >
            {formatDistanceToNowStrict(new Date(row.vocab.time_modified))}
          </div>
        )
        }}
        </ElTableColumn>
      </ElTable>
    </div>
    <div class="min-h-9 w-full">
      <ElPagination
        currentPage={currPage.value}
        onUpdate:current-page={(curr) => currPage.value = curr}
        pageSize={pageSize.value}
        onUpdate:page-size={(size) => pageSize.value = size}
        pageSizes={[100, 200, 500, 1000, rowsSegmented.value.length]}
        pagerCount={5}
        small
        total={~~totalTransit.value}
        class="shrink-0 select-none flex-wrap gap-y-1.5 !p-1.5 tabular-nums [&_*]:!rounded-md [&_.el-pagination\\_\\_sizes.is-last]:!m-0 [&_.el-pagination\\_\\_total]:mx-[10px] [&_.is-active]:bg-neutral-100"
        layout="prev, pager, next, ->, total, sizes"
      />
    </div>
  </div>
)
  }
})
