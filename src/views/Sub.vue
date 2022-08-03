<script lang="tsx" setup>
import Trie from '../utils/LabeledTire'
import SegmentedControl from '../components/SegmentedControl.vue'
import { Check } from '@element-plus/icons-vue'
import { computed, nextTick, ref, Ref, shallowRef, watch } from 'vue'
import { LabelRow } from '../types'
import { classKeyOfRow, compare, readFiles, removeClass, selectWord, sortByChar } from '../utils/utils'
import { acquaint, revokeWord } from '../api/vocab-service'
import { useVocabStore } from '../store/useVocab'
import { useTimeStore } from '../store/usePerf'
import { useUserStore } from '../store/useState'
import { ElNotification } from 'element-plus'
import router from '../router'
import { TransitionPresets, useTransition } from '@vueuse/core'
import Examples from '../components/Examples'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const userStore = useUserStore()
const segments = computed(() => [t('all'), t('new'), t('acquainted')])
const selectedSeg: Ref<number> = ref(0)
let listsOfVocab: LabelRow[][] = [[], [], []]
const tableDataOfVocab = shallowRef<LabelRow[]>([])
const vocabTable = shallowRef<any>(null)

let sortBy = {}

function onSegmentSwitched(v: number) {
  disabledTotal.value = true
  selectedSeg.value = v
  tableDataOfVocab.value = listsOfVocab[selectedSeg.value]
  sortChange(sortBy)
  nextTick().then(() => disabledTotal.value = false)
}

const fileInfo = ref('')
const inputText = ref('')

async function onFileChange(ev: any) {
  const files = ev.target.files
  const numberOfFiles = files?.length
  if (!numberOfFiles) return
  const fileList = await readFiles(files)
  if (numberOfFiles > 1) {
    fileInfo.value = `${fileList.length} files selected`
  } else {
    fileInfo.value = fileList[0].file.name
  }

  inputText.value = fileList.reduce((pre, { result }) => pre + result, '')
}

const sentences = shallowRef<any[]>([])
const vocabStore = useVocabStore()
const { log, logEnd, logPerf } = useTimeStore()
const lengthsOfLists = ref([0, 0, 0])
const lengthsOfListsOutput = useTransition(lengthsOfLists, {
  transition: TransitionPresets.easeInOutCirc,
})
const vocabCountBySegment = computed(() => {
  const [r, g, b] = lengthsOfListsOutput.value
  return `${~~r} - ${~~g} - ${~~b}`
})

async function structVocab(content: string): Promise<any> {
  const trieListPair = await vocabStore.getSieve()
  log(['-- All took', '    '])
  log('· init words')
  const vocab = new Trie(trieListPair).add(content)
  logEnd('· init words')
  return vocab
}

let timeoutID: number
watch(inputText, () => {
  clearTimeout(timeoutID)
  timeoutID = setTimeout(() => {
    formVocabLists(inputText.value)
  }, 50)
})

async function formVocabLists(text: string) {
  const trie = await structVocab(text)
  sentences.value = trie.sentences
  log(['· categorize vocabulary', ' +  '])
  log('%c  merge vocabulary', 'color: gray; font-style: italic; padding: 1px')
  const vocabs = trie.mergedVocabulary()
  logEnd('%c  merge vocabulary')
  log('%c  formLabel vocabulary', 'color: gray; font-style: italic; padding: 0.5px')
  listsOfVocab = Trie.categorize(vocabs)
  logEnd('%c  formLabel vocabulary')
  logEnd(['· categorize vocabulary', ' +  '])
  logEnd(['-- All took', '    '])
  lengthsOfLists.value = listsOfVocab.map((l: any[]) => l.length)
  refreshTable(listsOfVocab)
  logVocabInfo(listsOfVocab)
  logPerf()
}

function refreshTable(lists: LabelRow[][]) {
  removeClass('expanded')
  setTimeout(() => {
    tableDataOfVocab.value = lists[selectedSeg.value]
    sortChange(sortBy)
  }, 0)
}

function logVocabInfo(listsOfVocab: any[]) {
  const untouchedVocabList = [...listsOfVocab[0]].sort((a, b) => sortByChar(a.w, b.w))
  const lessCommonWordsList = [...listsOfVocab[1]].sort((a, b) => sortByChar(a.w, b.w))
  const commonWordsList = [...listsOfVocab[2]].sort((a, b) => sortByChar(a.w, b.w))
  console.log(`(${untouchedVocabList.length}) words`, { _: untouchedVocabList })
  console.log(`(${lessCommonWordsList.length}) new`, { _: lessCommonWordsList })
  console.log(`(${commonWordsList.length}) acquainted`, { _: commonWordsList })
}

const search = ref('')
const tableDataFiltered = computed(() =>
  tableDataOfVocab.value.filter((row: LabelRow) =>
    !search.value || row.w.toLowerCase().includes(search.value.toLowerCase())
  )
)
const tableDataDisplay = computed(() =>
  tableDataFiltered.value.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value)
)
const loadingStateArray = ref<boolean[]>([])

async function toggleWordState(row: any) {
  loadingStateArray.value[row.seq] = true

  if (userStore.user.name) {
    const word = row.w.replace(/'/g, '\'\'')
    row.vocab ??= { w: row.w, is_user: true, acquainted: false }
    const vocabInfo = {
      word,
      user: userStore.user.name,
    }
    const acquainted = row?.vocab?.acquainted
    const res = await (acquainted ? revokeWord : acquaint)(vocabInfo)

    if (res?.affectedRows) {
      row.F = row.vocab.acquainted = !acquainted
      vocabStore.updateWord(row)
    }
  } else {
    ElNotification({
      message: (
        <span style={{ color: 'teal' }}>
          {t('please')}
          {' '}<i onClick={() => router.push('/login')}>{t('login')}</i>{' '}
          {t('to mark words')}
        </span>
      )
    })
  }

  loadingStateArray.value[row.seq] = false
}

function sortChange({ prop, order }: any) {
  sortBy = { prop, order }
  tableDataOfVocab.value = [...listsOfVocab[selectedSeg.value]].sort(compare(prop, order))
}

const currentPage = ref(1)
const pageSizes = [100, 200, 500, 1000, Infinity]
const pageSize = ref(pageSizes[0])
const total = computed(() => tableDataFiltered.value.length)
const disabledTotal = ref(false)
const totalTransit = useTransition(total, {
  disabled: disabledTotal,
  transition: TransitionPresets.easeOutCirc,
})

function handleRowClick(row: any) {
  vocabTable.value.toggleRowExpansion(row)
}

function onExpandChange(row: any) {
  document.getElementsByClassName(classKeyOfRow(row.seq))[0].classList.toggle('expanded')
}
</script>

<template>
  <div class="mx-auto max-w-screen-xl">
    <div class="relative mx-3 flex h-14 items-center xl:mx-0">
      <label class="el-button grow-0 !rounded-md px-3 py-2.5 text-sm leading-3">
        {{ t('browseFiles') }}
        <input
          type="file"
          hidden
          multiple
          @change="onFileChange"
        >
      </label>
      <div class="flex grow gap-1 overflow-y-auto">
        <span class="grow truncate pl-3 font-compact text-xs tracking-tight text-indigo-900">
          {{ fileInfo || t('noFileChosen') }}
        </span>
        <span class="shrink-0 text-right text-xs tabular-nums text-indigo-900">{{ vocabCountBySegment }}</span>
      </div>
    </div>
    <div class="flex flex-col gap-6 md:h-[calc(100vh-140px)] md:flex-row">
      <el-container class="relative h-full">
        <el-main class="relative !p-0">
          <el-input
            v-model.lazy="inputText"
            class="input-area h-full font-text-sans !text-base md:!text-sm"
            type="textarea"
            :placeholder="t('inputArea')"
          />
        </el-main>
      </el-container>
      <div class="h-[86vh] !overflow-visible pb-5 md:mt-0 md:h-full md:!w-[44%] md:pb-0">
        <el-card class="table-card mx-5 flex h-full flex-col items-center !rounded-xl !border-0 will-change-transform md:mx-0">
          <segmented-control
            :segments="segments"
            :default="selectedSeg"
            class="grow-0"
            @input="onSegmentSwitched"
          />
          <div class="h-full w-full">
            <!-- 100% height of its container minus height of siblings -->
            <div class="h-[calc(100%-1px)]">
              <el-table
                ref="vocabTable"
                class="w-table !h-full !w-full md:w-full"
                height="200"
                size="small"
                fit
                :row-class-name="({row})=> classKeyOfRow(row.seq)"
                :data="tableDataDisplay"
                @row-click="handleRowClick"
                @expand-change="onExpandChange"
                @sort-change="sortChange"
              >
                <el-table-column type="expand">
                  <template #default="{row}">
                    <Examples
                      :sentences="sentences"
                      :src="row.src"
                    />
                  </template>
                </el-table-column>
                <el-table-column
                  label="Vocabulary"
                  prop="w"
                  align="left"
                  min-width="16"
                  sortable="custom"
                  class-name="cursor-pointer"
                >
                  <template #header>
                    <el-input
                      v-model="search"
                      class="!w-[calc(100%-26px)] !text-base md:!text-xs"
                      size="small"
                      :placeholder="t('search')"
                      @click.stop
                    />
                  </template>
                  <template #default="{row}">
                    <span
                      class="cursor-text font-compact text-[16px] tracking-wide"
                      @mouseover="selectWord"
                      @touchstart.passive="selectWord"
                      @click.stop
                    >{{ row.w }}</span>
                  </template>
                </el-table-column>
                <el-table-column
                  :label="t('frequency')"
                  prop="freq"
                  align="right"
                  min-width="9"
                  sortable="custom"
                  class-name="cursor-pointer tabular-nums"
                >
                  <template #default="{row}">
                    <div class="select-none text-right font-compact">
                      {{ row.freq }}
                    </div>
                  </template>
                </el-table-column>
                <el-table-column
                  :label="t('length')"
                  prop="len"
                  align="right"
                  min-width="10"
                  sortable="custom"
                  class-name="cursor-pointer tabular-nums"
                >
                  <template #default="{row}">
                    <div class="select-none font-compact">
                      {{ row.len }}
                    </div>
                  </template>
                </el-table-column>
                <el-table-column
                  align="right"
                  min-width="5"
                >
                  <template #default="{row}">
                    <div class="text-center">
                      <el-button
                        size="small"
                        type="primary"
                        :icon="Check"
                        :plain="!row?.vocab?.acquainted"
                        :loading="loadingStateArray[row.seq]"
                        :disabled="row?.vocab && !row?.vocab?.is_user"
                        :text="!row?.vocab?.acquainted"
                        @click.stop="toggleWordState(row)"
                      />
                    </div>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
          <el-pagination
            v-model:currentPage="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="pageSizes"
            :small="true"
            :background="true"
            :pager-count="5"
            layout="prev, pager, next, ->, total, sizes"
            :total="~~totalTransit"
            class="pager-section shrink-0 flex-wrap gap-y-1.5 !px-2 !pt-1 !pb-1.5 tabular-nums"
          />
        </el-card>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-pagination__rightwrapper) {
  .el-pagination__sizes.is-last {
    margin: 0 !important;
  }

  .el-pagination__total {
    margin-left: 10px !important;
    margin-right: 10px !important;
  }
}

:deep(.is-text) {
  border: 1px solid transparent !important;

  &:hover {
    background-color: var(--el-color-primary-light-9) !important;
    border-color: var(--el-color-primary-light-5) !important;
  }
}

:deep(thead .is-right:not(:last-child) .cell) {
  padding: 0;
}

.w-table {
  :deep(tr :last-child) {
    overflow: visible !important;
  }

  :deep(.el-icon) {
    pointer-events: none;
  }

  :deep(:is(*, .el-table__body-wrapper)) {
    overscroll-behavior: contain !important;
  }

  :deep(.el-table__inner-wrapper) {
    height: 100%;
  }

  :deep(.el-table__expand-icon) {
    -webkit-tap-highlight-color: transparent;
  }
}

.table-card :deep(.el-card__body) {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  padding: 0;
}

.input-area :deep(textarea) {
  border-radius: 8px;
  box-shadow: none;
  border: 0;
  padding-left: 30px;
  padding-right: 30px;
  height: 100%;
}

:deep(.expanded) td {
  border-color: white !important;
}

:deep(.expanded:hover) > td.el-table__cell {
  background-image: linear-gradient(to bottom, var(--el-border-color-lighter), white);
}

@media only screen and (min-width: 768px) {
  .input-area > :deep(textarea) {
    overflow: visible;
  }
}

@media only screen and (max-width: 768px) {
  .input-area :deep(textarea) {
    height: 260px;
  }

  :deep(.el-textarea__inner) {
    max-height: 360px;
  }
}

@media only screen and (max-width: 640px) {
  .input-area :deep(textarea) {
    border-radius: 12px;
  }
}
</style>
