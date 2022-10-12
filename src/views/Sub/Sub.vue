<script lang="ts" setup>
import { ref } from 'vue'
import { whenever } from '@vueuse/core'
import VocabTable from '../../components/vocabulary/VocabSource.vue'
import { t } from '@/i18n'
import type { SourceRow } from '@/types'
import { readFiles, resetFileInput, sortByChar } from '@/utils/utils'
import { useVocabStore } from '@/store/useVocab'
import { useTimeStore } from '@/store/usePerf'
import { useDebounceTimeout } from '@/composables/useDebounce'
import { watched } from '@/composables/utilities'
import { formVocabList } from '@/utils/vocab'

let fileInfo = $ref('')

async function onFileChange(ev: Event) {
  const files = (ev.target as HTMLInputElement).files
  const numberOfFiles = files?.length
  if (!numberOfFiles) return
  const fileList = await readFiles(files)
  if (numberOfFiles > 1) {
    fileInfo = `${numberOfFiles} files selected`
  } else {
    fileInfo = files[0].name
  }

  inputText = fileList.reduce((pre, { result }) => pre + result, '')
}

let count = $ref(0)
let sentences = $ref<string[]>([])
const { baseReady, getPreBuiltTrie, backTrie } = $(useVocabStore())
const { logTime, logEnd, logPerf } = useTimeStore()
let inputText = $(watched(ref(''), () => !inWaiting && reformVocabList()))
let inWaiting = false
const reformVocabList = useDebounceTimeout(async function refreshVocab() {
  inWaiting = true
  const trie = await getPreBuiltTrie()
  inWaiting = false
  logTime(['-- All took', '    '])
  logTime('· init words')
  trie.add(inputText)
  logEnd('· init words')
  logTime(['· categorize vocabulary', ' +  '])
  logTime('%c  merge vocabulary', 'color: gray; font-style: italic; padding: 1px')
  trie.mergedVocabulary()
  logEnd('%c  merge vocabulary')
  logTime('%c  formLabel vocabulary', 'color: gray; font-style: italic; padding: 0.5px')
  const list = formVocabList(trie.vocabulary)
  logEnd('%c  formLabel vocabulary')
  logEnd(['· categorize vocabulary', ' +  '])
  logEnd(['-- All took', '    '])
  logVocabInfo(list)
  logPerf()
  tableDataOfVocab = list
  count = trie.wordCount
  sentences = trie.sentences
  requestAnimationFrame(() => requestAnimationFrame(backTrie))
}, 50)
whenever($$(baseReady), reformVocabList)
let tableDataOfVocab = $shallowRef<SourceRow[]>([])
const handleTextChange = () => resetFileInput('.file-input')

function logVocabInfo(listOfVocab: SourceRow[]) {
  const untouchedVocabList = [...listOfVocab].sort((a, b) => sortByChar(a.vocab.w, b.vocab.w))
  console.log(`(${untouchedVocabList.length}) words`, { _: untouchedVocabList })
}
</script>

<template>
  <div class="w-full max-w-screen-xl">
    <div class="relative z-10 mx-3 flex h-14 items-center xl:mx-0">
      <div>
        <label
          class="btn"
          for="browseFiles"
        >
          {{ t('browseFiles') }}
        </label>
        <input
          id="browseFiles"
          class="file-input"
          type="file"
          hidden
          multiple
          @change="onFileChange"
        >
      </div>
      <div class="grow" />
    </div>
    <div class="flex flex-col gap-6 md:h-[calc(100vh-140px)] md:flex-row">
      <div class="relative box-border flex flex-1 basis-auto flex-col overflow-hidden border md:rounded-[12px] md:shadow-sm">
        <div class="flex h-10 shrink-0 items-center border-b bg-zinc-50 py-2 pr-2 pl-4 font-compact text-xs text-neutral-600">
          <span class="grow truncate">
            {{ fileInfo + '&nbsp;' }}
          </span>
          <span class="mx-1 inline-block h-[18px] w-px border-l align-middle" />
          <span class="shrink-0 text-right font-mono tabular-nums">
            {{ `&nbsp;${count.toLocaleString('en-US')} ${t('words')}` }}
          </span>
        </div>
        <div class="h-full w-full grow text-base text-zinc-700 md:text-sm">
          <textarea
            v-model="inputText"
            class="h-[260px] max-h-[360px] w-full resize-none rounded-none py-3 px-[30px] align-top outline-none ffs-[normal] md:h-full md:max-h-full"
            :placeholder="t('inputArea')"
            @change="handleTextChange"
          />
        </div>
      </div>
      <div class="h-[86vh] overflow-visible pb-5 md:mt-0 md:h-full md:w-[44%] md:pb-0">
        <VocabTable
          :data="tableDataOfVocab"
          :sentences="sentences"
          expand
          tableName="vocab-statistics"
        />
      </div>
    </div>
  </div>
</template>
