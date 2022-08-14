<script lang="tsx" setup>
import { useI18n } from 'vue-i18n'
import { ref, shallowRef, watch } from 'vue'
import Trie from '../utils/LabeledTire'
import VocabTable from '../components/VocabTable.vue'
import { LabelRow } from '../types'
import { readFiles, sortByChar } from '../utils/utils'
import { useVocabStore } from '../store/useVocab'
import { useTimeStore } from '../store/usePerf'

const { t } = useI18n()
let listOfVocab: LabelRow[] = []
const tableDataOfVocab = shallowRef<LabelRow[]>([])

const fileInfo = ref('')
const inputText = ref('')

async function onFileChange(ev: Event) {
  const files = (ev.target as HTMLInputElement).files
  const numberOfFiles = files?.length
  if (!numberOfFiles) return
  const fileList = await readFiles(files)
  if (numberOfFiles > 1) {
    fileInfo.value = `${numberOfFiles} files selected`
  } else {
    fileInfo.value = fileList[0].file.name
  }

  inputText.value = fileList.reduce((pre, { result }) => pre + result, '')
}

const sentences = ref<string[]>([])
const vocabStore = useVocabStore()
const { log, logEnd, logPerf } = useTimeStore()

async function structVocab(content: string): Promise<Trie> {
  const baseVocabTrie = await vocabStore.getPreBuiltTrie()
  log(['-- All took', '    '])
  log('· init words')
  const vocab = new Trie(baseVocabTrie).add(content)
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
  listOfVocab = Trie.formVocabList(vocabs)
  logEnd('%c  formLabel vocabulary')
  logEnd(['· categorize vocabulary', ' +  '])
  logEnd(['-- All took', '    '])
  tableDataOfVocab.value = listOfVocab
  logVocabInfo(listOfVocab)
  logPerf()
}

function logVocabInfo(listOfVocab: LabelRow[]) {
  const untouchedVocabList = [...listOfVocab].sort((a, b) => sortByChar(a.w, b.w))
  console.log(`(${untouchedVocabList.length}) words`, { _: untouchedVocabList })
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
      <div class="h-[86vh] overflow-visible pb-5 md:mt-0 md:h-full md:w-[44%] md:pb-0">
        <vocab-table
          :data="tableDataOfVocab"
          :sentences="sentences"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.input-area :deep(textarea) {
  border-radius: 8px;
  box-shadow: none;
  border: 0;
  padding-left: 30px;
  padding-right: 30px;
  height: 100%;
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
