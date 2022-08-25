<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { ref, shallowRef, watch } from 'vue'
import VocabTable from './VocabTable.vue'
import Trie from '@/utils/LabeledTire'
import { LabelRow } from '@/types'
import { readFiles, sortByChar } from '@/utils/utils'
import { useVocabStore } from '@/store/useVocab'
import { useTimeStore } from '@/store/usePerf'

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
    fileInfo.value = files[0].name
  }

  inputText.value = fileList.reduce((pre, { result }) => pre + result, '')
}

const count = ref(0)
const sentences = ref<string[]>([])
const vocabStore = useVocabStore()
const { log, logEnd, logPerf } = useTimeStore()

let timeoutID: ReturnType<typeof setTimeout>
watch(inputText, () => {
  clearTimeout(timeoutID)
  timeoutID = setTimeout(async () => {
    ({
      list: tableDataOfVocab.value,
      count: count.value,
      sentences: sentences.value
    } = await formVocabList(inputText.value))
  }, 50)
})

const tableDataOfVocab = shallowRef<LabelRow[]>([])

async function formVocabList(text: string) {
  const baseVocabTrie = await vocabStore.getPreBuiltTrie()
  log(['-- All took', '    '])
  log('· init words')
  const trie = new Trie(baseVocabTrie).add(text)
  logEnd('· init words')
  log(['· categorize vocabulary', ' +  '])
  log('%c  merge vocabulary', 'color: gray; font-style: italic; padding: 1px')
  const vocabs = trie.mergedVocabulary()
  logEnd('%c  merge vocabulary')
  log('%c  formLabel vocabulary', 'color: gray; font-style: italic; padding: 0.5px')
  const list = Trie.formVocabList(vocabs)
  logEnd('%c  formLabel vocabulary')
  logEnd(['· categorize vocabulary', ' +  '])
  logEnd(['-- All took', '    '])
  logVocabInfo(list)
  logPerf()
  return {
    list,
    sentences: trie.sentences,
    count: trie.wordCount,
  }
}

function logVocabInfo(listOfVocab: LabelRow[]) {
  const untouchedVocabList = [...listOfVocab].sort((a, b) => sortByChar(a.w, b.w))
  console.log(`(${untouchedVocabList.length}) words`, { _: untouchedVocabList })
}
</script>

<template>
  <div class="w-full max-w-screen-xl">
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
    </div>
    <div class="flex flex-col gap-6 md:h-[calc(100vh-140px)] md:flex-row">
      <div class="relative box-border flex flex-1 basis-auto flex-col overflow-hidden border shadow-sm md:rounded-[12px]">
        <div class="flex h-10 shrink-0 items-center border-b bg-gray-100 py-2 pr-2 pl-4 font-compact text-xs text-neutral-600">
          <span class="grow truncate">
            {{ fileInfo + '&nbsp;' }}
          </span>
          <span class="mx-1 inline-block h-[18px] w-px border-l align-middle" />
          <span class="shrink-0 text-right font-mono tabular-nums">
            {{ `&nbsp;${count.toLocaleString('en-US')} ${t('words')}` }}
          </span>
        </div>
        <div class="input-area h-full w-full grow text-base text-zinc-700 md:text-sm">
          <textarea
            v-model="inputText"
            class="h-[260px] max-h-[360px] w-full resize-none py-3 px-[30px] align-top outline-none ffs-[normal] md:h-full md:max-h-full md:rounded-[12px]"
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
