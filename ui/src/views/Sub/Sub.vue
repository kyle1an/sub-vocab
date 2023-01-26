<script lang="ts" setup>
import { ref, watch } from 'vue'
import { t } from '@/i18n'
import VocabSourceTable from '@/components/vocabulary/VocabSource.vue'
import FileInput from '@/components/FileInput.vue'
import type { SrcRow, VocabInfoSubDisplay } from '@/types'
import { useVocabStore } from '@/store/useVocab'
import { useDebounceTimeout, useState } from '@/composables/utilities'
import { generatedVocabTrie } from '@/utils/vocab'

const [fileInfo, setFileInfo] = useState('')

async function onFileChange({ info, text }: { info: string, text: string }) {
  setFileInfo(info)
  setInputText(text)
}

const [count, setCount] = useState(0)
const [sentences, setSentences] = useState<string[]>([])
const store = useVocabStore()
const [inputText, setInputText] = useState('')
watch(inputText, () => reformVocabList())
const [tableDataOfVocab, setTableDataOfVocab] = useState<SrcRow<VocabInfoSubDisplay>[]>([])
const reformVocabList = useDebounceTimeout(() => {
  const { list, count, sentences } = generatedVocabTrie(inputText.value)
  setCount(count)
  setSentences(sentences)
  setTableDataOfVocab(list)
}, 50)
watch(() => store.baseReady, (isReady) => isReady && reformVocabList())
watch(() => store.irregularsReady, (isReady) => isReady && reformVocabList())
const sourceFileInput = ref()
</script>

<template>
  <div class="w-full max-w-screen-xl">
    <div class="relative z-10 mx-3 flex h-14 items-center xl:mx-0">
      <FileInput
        ref="sourceFileInput"
        @file-input="onFileChange"
      >
        {{ t('browseFiles') }}
      </FileInput>
      <div class="grow" />
    </div>
    <div class="flex flex-col gap-6 md:h-[calc(100vh-140px)] md:flex-row">
      <div class="relative box-border flex flex-1 basis-auto flex-col overflow-hidden border md:rounded-[12px] md:shadow-sm">
        <div class="flex h-10 shrink-0 items-center border-b bg-zinc-50 py-2 pr-2 pl-4 font-compact text-xs text-neutral-600">
          <span class="grow truncate">
            {{ fileInfo + '&nbsp;' }}
          </span>
          <span class="mx-1 inline-block h-[18px] w-px border-l align-middle" />
          <span class="shrink-0 text-right tabular-nums">
            {{ `&nbsp;${count.toLocaleString('en-US')} ${t('words')}` }}
          </span>
        </div>
        <div class="h-full w-full grow text-base text-zinc-700 md:text-sm">
          <textarea
            v-model="inputText"
            class="h-[260px] max-h-[360px] w-full resize-none rounded-none py-3 px-[30px] align-top outline-none ffs-[normal] md:h-full md:max-h-full"
            :placeholder="t('inputArea')"
            @change="sourceFileInput.inputChanged"
          />
        </div>
      </div>
      <div class="h-[86vh] overflow-visible pb-6 md:mt-0 md:h-full md:w-[44%] md:pb-0">
        <VocabSourceTable
          :data="tableDataOfVocab"
          :sentences="sentences"
          expand
          tableName="vocab-statistics"
        />
      </div>
    </div>
  </div>
</template>
