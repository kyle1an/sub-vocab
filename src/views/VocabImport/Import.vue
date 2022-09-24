<script lang="tsx" setup>
import { ref } from 'vue'
import { whenever } from '@vueuse/core'
import { ElNotification } from 'element-plus'
import { t } from '@/i18n'
import VocabTable from '@/components/vocabulary/VocabSource.vue'
import type { SourceRow } from '@/types'
import { readFiles, resetFileInput, sortByChar } from '@/utils/utils'
import { useVocabStore } from '@/store/useVocab'
import { useTimeStore } from '@/store/usePerf'
import { useDebounceTimeout } from '@/composables/useDebounce'
import { watched } from '@/composables/utilities'
import { batchAcquaint } from '@/api/vocab-service'
import router from '@/router'
import { formVocabList } from '@/utils/vocab'

let fileInfo = $ref('')
const { user, updateWord } = $(useVocabStore())

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
  requestAnimationFrame(() => requestAnimationFrame(backTrie))
}, 50)
whenever($$(baseReady), reformVocabList)
let tableDataOfVocab = $shallowRef<SourceRow[]>([])
const handleTextChange = () => resetFileInput('.file-input')

function logVocabInfo(listOfVocab: SourceRow[]) {
  const untouchedVocabList = [...listOfVocab].sort((a, b) => sortByChar(a.vocab.w, b.vocab.w))
  console.log(`(${untouchedVocabList.length}) words`, { _: untouchedVocabList })
}

async function acquaintAll() {
  if (user) {
    const rowsMap: Record<string, SourceRow> = {}
    const words: string[] = []
    tableDataOfVocab.forEach((row) => {
      if (!row.vocab.acquainted && row.vocab.w.length < 32) {
        const word = row.vocab.w.replace(/'/g, `''`)
        row.vocab.inUpdating = true
        rowsMap[word] = row
        words.push(word)
      }
    })
    const res = await batchAcquaint({ user, words }) as string
    if (res === 'success') {
      Object.values(rowsMap).forEach((row) => {
        updateWord(row.vocab, true)
        row.vocab.inUpdating = false
      })
    } else {
      Object.values(rowsMap).forEach((row) => {
        row.vocab.inUpdating = false
      })
    }
  } else {
    ElNotification({
      message: (
        <span style={{ color: 'teal' }}>
          {t('please')}
          {' '}<i onClick={() => router.push('/login')}>{t('login')}</i>{' '}
          {t('to mark words')}
        </span>
      ),
      offset: 40,
    })
  }
}
</script>

<template>
  <div class="w-full max-w-screen-xl">
    <div class="relative mx-3 flex h-14 items-center xl:mx-0">
      <label
        class="btn"
        for="browseVocabFile"
      >
        {{ t('browseVocabFile') }}
      </label>
      <input
        id="browseVocabFile"
        class="file-input"
        type="file"
        hidden
        multiple
        @change="onFileChange"
      >
    </div>
    <div class="flex flex-col gap-6 md:h-[calc(100vh-140px)] md:flex-row">
      <div class="relative box-border flex flex-1 basis-auto flex-col overflow-hidden border md:rounded-[12px] md:shadow-sm">
        <div class="flex h-10 shrink-0 items-center border-b bg-zinc-50 py-2 pr-2 pl-4 font-compact text-xs text-neutral-600">
          <span class="grow truncate">
            {{ fileInfo + '&nbsp;' }}
          </span>
        </div>
        <div class="h-full w-full grow border-b text-base text-zinc-700 md:text-sm">
          <textarea
            v-model="inputText"
            class="h-[260px] w-full resize-none rounded-none py-3 px-[30px] align-top outline-none ffs-[normal] md:h-full md:max-h-full"
            :placeholder="t('inputArea')"
            @change="handleTextChange"
          />
        </div>
        <div class="flex h-9 shrink-0 items-center bg-zinc-50 p-1.5 font-compact text-xs text-neutral-600">
          <span class="grow truncate" />
          <span class="shrink-0 text-right font-mono tabular-nums">
            {{ `&nbsp;${count.toLocaleString('en-US')} ${t('words')}` }}
          </span>
          <span class="mx-1 inline-block h-[18px] w-px border-l align-middle" />
          <button
            class="box-border inline-flex h-7 max-h-full grow-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-md bg-zinc-200 px-3 py-2.5 text-center align-middle text-sm leading-3 transition-colors hover:bg-yellow-300"
            @click="acquaintAll"
          >
            {{ t('acquaintedAll') }}
          </button>
        </div>
      </div>
      <div class="h-[86vh] overflow-visible pb-5 md:mt-0 md:h-full md:w-[44%] md:pb-0">
        <vocab-table
          :data="tableDataOfVocab"
          :expand="false"
          tableName="vocab-import"
        />
      </div>
    </div>
  </div>
</template>
