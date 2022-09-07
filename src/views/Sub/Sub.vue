<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { ref } from 'vue'
import { watchOnce, whenever } from '@vueuse/core'
import VocabTable from './VocabTable.vue'
import { LabelRow } from '@/types'
import { readFiles, sortByChar } from '@/utils/utils'
import { useVocabStore } from '@/store/useVocab'
import { useTimeStore } from '@/store/usePerf'
import { useDebounceTimeout } from '@/composables/useDebounce'
import { watched } from '@/composables/watch'

const { t } = useI18n()
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
const { trieReady, baseReady, getPreBuiltTrie, backTrie } = $(useVocabStore())
const { log, logEnd, logPerf } = useTimeStore()
let inputText = $(watched(ref(''), reformVocabList))

function reformVocabList() {
  if (!trieReady) {
    watchOnce($$(trieReady), formVocabList)
    return
  }

  formVocabList()
}

whenever($$(baseReady), reformVocabList)
let tableDataOfVocab = $shallowRef<LabelRow[]>([])
const formVocabList = useDebounceTimeout(async function refreshVocab() {
  const trie = await getPreBuiltTrie()
  log(['-- All took', '    '])
  log('· init words')
  trie.add(inputText)
  logEnd('· init words')
  log(['· categorize vocabulary', ' +  '])
  log('%c  merge vocabulary', 'color: gray; font-style: italic; padding: 1px')
  trie.mergedVocabulary()
  logEnd('%c  merge vocabulary')
  log('%c  formLabel vocabulary', 'color: gray; font-style: italic; padding: 0.5px')
  const list = trie.formVocabList()
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

function handleTextChange() {
  const input = document.getElementById('input') as HTMLInputElement
  if (input) input.value = ''
}

function logVocabInfo(listOfVocab: LabelRow[]) {
  const untouchedVocabList = [...listOfVocab].sort((a, b) => sortByChar(a.vocab.w, b.vocab.w))
  console.log(`(${untouchedVocabList.length}) words`, { _: untouchedVocabList })
}
</script>

<template>
  <div class="w-full max-w-screen-xl">
    <div class="relative mx-3 flex h-14 items-center xl:mx-0">
      <label class="el-button grow-0 !rounded-md px-3 py-2.5 text-sm leading-3">
        {{ t('browseFiles') }}
        <input
          id="input"
          type="file"
          hidden
          multiple
          @change="onFileChange"
        >
      </label>
    </div>
    <div class="flex flex-col gap-6 md:h-[calc(100vh-140px)] md:flex-row">
      <div class="relative box-border flex flex-1 basis-auto flex-col overflow-hidden border md:rounded-[12px] md:shadow-sm">
        <div class="flex h-10 shrink-0 items-center border-b bg-gray-100 py-2 pr-2 pl-4 font-compact text-xs text-neutral-600">
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
        <vocab-table
          :data="tableDataOfVocab"
          :sentences="sentences"
        />
      </div>
    </div>
  </div>
</template>
