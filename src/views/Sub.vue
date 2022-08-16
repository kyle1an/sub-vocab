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

let listOfVocab: LabelRow[] = []
const tableDataOfVocab = shallowRef<LabelRow[]>([])

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
      <div class="relative box-border flex-1 basis-auto overflow-visible border-y shadow md:rounded-[12px] md:border-transparent md:shadow">
        <div class="input-area h-full w-full font-text-sans text-base text-neutral-600 md:text-sm">
          <textarea
            v-model="inputText"
            class="h-[260px] max-h-[360px] w-full resize-none py-3 px-[30px] align-top outline-none md:h-full md:max-h-full md:rounded-[12px]"
            :placeholder="t('inputArea')"
          />
        </div>
      </div>
      <div class="h-[86vh] overflow-visible pb-5 md:mt-0 md:h-full md:w-[44%] md:pb-0">
        <vocab-table
          :data="tableDataOfVocab"
          :sentences="sentences"
        />
      </div>
    </div>
  </div>
</template>
