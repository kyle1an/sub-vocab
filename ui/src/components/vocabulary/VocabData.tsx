import { computed, defineComponent, ref, shallowRef, watch } from 'vue'
import { TransitionPresets, useSessionStorage, useTransition } from '@vueuse/core'
import { ElInput, ElPagination, ElTable, type Sort, type TableInstance } from 'element-plus'
import { pipe } from 'fp-ts/function'
import { formatDistanceToNowStrict } from 'date-fns'
import { t } from '@/i18n'
import { SegmentedControl } from '@/components/SegmentedControl'
import { isMobile, orderBy, paging, selectWord } from '@/utils/utils'
import type { MyVocabRow, SrcRow } from '@/types'
import { VocabToggle } from '@/components/vocabulary/ToggleButton'
import { createSignal, useElHover } from '@/composables/utilities'
import { useVocabStore } from '@/store/useVocab'

export const VocabDataTable = Object.assign(defineComponent((props: { tableName: string }) => {
  const store = useVocabStore()
  const segments = () => [
    { value: 'all', label: t('all') },
    { value: 'mine', label: t('mine') },
    { value: 'top', label: t('top') },
    { value: 'recent', label: t('recent') },
  ] as const
  type RowData = SrcRow<typeof store.baseVocab[number]>
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
    if (!dirty()) return
    if (!isHovering || rowsDisplay().length === 0) {
      setRowsDisplay(rows.value)
      setDirty(false)
    }
  })
  const search = shallowRef('')
  const defaultSort: Sort = { order: 'descending', prop: 'vocab.time_modified' }
  const [sortBy, setSortBy] = createSignal(defaultSort)
  const onSortChange = ({ order, prop }: Sort) => {
    setSortBy(order && prop ? { order, prop } : defaultSort)
  }
  const currPage = shallowRef(1)
  const pageSize = shallowRef(100)
  watch(currPage, () => {
    vocabTable.value?.setScrollTop(0)
  })
  const [rowsDisplay, setRowsDisplay] = createSignal<MyVocabRow[]>([])
  const disabledTotal = shallowRef(true)
  const srcRows = shallowRef<MyVocabRow[]>([])
  watch([() => store.baseVocab, () => store.baseVocab.length], () => {
    srcRows.value = store.baseVocab.map((r) => ({ vocab: r }))
    disabledTotal.value = false
  }, { immediate: true })
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
    }

    return rowsSegmented.value.filter((r) => r.vocab.w.toLowerCase().includes(searching))
  })
  const rows = computed(() => pipe(searched.value,
    orderBy(sortBy().prop, sortBy().order),
    paging(currPage.value, pageSize.value),
  ))
  watch(rows, (v) => {
    if (
      !isHoveringOnTable()
      || rowsDisplay().length === 0
    ) {
      setRowsDisplay(v)
    } else {
      setDirty(true)
    }
  }, { immediate: true })
  const totalTransit = useTransition(() => searched.value.length, {
    disabled: disabledTotal,
    transition: TransitionPresets.easeOutCirc,
  })
  return () => (
    <div class="flex grow flex-col overflow-hidden rounded-xl border bg-white shadow will-change-transform md:mx-0">
      <SegmentedControl
        name={props.tableName}
        segments={segments()}
        value={segment.value}
        class="pb-2 pt-3"
        onChoose={(v) => segment.value = v}
      />
      <div class="h-px w-full grow">
        <ElTable
          ref={vocabTable}
          data={rowsDisplay()}
          row-key={(row: RowData) => '_' + row.vocab.w}
          class={String.raw`!h-full !w-full md:w-full [&_*]:overscroll-contain [&_.el-table\_\_inner-wrapper]:!h-full [&_th_.cell]:font-compact [&_th_.cell]:tracking-normal`}
          size="small"
          onSort-change={onSortChange}
          v-slots={() => (
            <>
              <ElTable.TableColumn
                label={t('rank')}
                className="!text-center [&>.cell]:!font-pro [&>.cell]:stretch-[condensed] [th&>.cell]:!pr-0"
                width={64}
                prop="vocab.rank"
                sortable="custom"
                v-slots={({ row }: { row: MyVocabRow }) => (
                  <div class="tabular-nums text-neutral-500">
                    {row.vocab.rank}
                  </div>
                )}
              />
              <ElTable.TableColumn
                label={t('Vocabulary')}
                prop="vocab.w"
                min-width={70}
                sortable="custom"
                className="select-none [&>.cell]:!pr-0"
                v-slots={{
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
              <ElTable.TableColumn
                label={t('length')}
                prop="vocab.w.length"
                width={62}
                sortable="custom"
                className="!text-right [th&>.cell]:!p-0 [th&>.cell]:!font-pro [th&>.cell]:stretch-[condensed]"
                v-slots={({ row }: { row: MyVocabRow }) => (
                  <div class="tabular-nums">
                    {row.vocab.w.length}
                  </div>
                )}
              />
              <ElTable.TableColumn
                width="32"
                className="overflow-visible !text-center [&_.cell]:!px-0"
                v-slots={VocabToggle}
              />
              <ElTable.TableColumn
                label={t('distance')}
                className="[td&_.cell]:!pr-0 [th&>.cell]:!font-pro [th&>.cell]:stretch-[condensed]"
                width={82}
                prop="vocab.time_modified"
                sortable="custom"
                v-slots={({ row }: { row: RowData }) => row.vocab.time_modified && (
                  <div
                    class="flex flex-row gap-0.5 font-compact tabular-nums tracking-normal text-neutral-900 ffs-[normal]">
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
          pageSizes={[50, 100, 200, 500, 1000, rowsSegmented.value.length]}
          pagerCount={5}
          small
          total={~~totalTransit.value}
          class={String.raw`shrink-0 select-none flex-wrap gap-y-1.5 !p-1.5 tabular-nums [&_*]:!rounded-md [&_.el-pagination\_\_sizes.is-last]:!m-0 [&_.el-pagination\_\_total]:mx-[10px] [&_.is-active]:bg-neutral-100`}
          layout="prev, pager, next, ->, total, sizes"
        />
      </div>
    </div>
  )
}), { props: ['tableName'] })
