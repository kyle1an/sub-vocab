<script lang="tsx" setup>
import { ref, watch } from 'vue'
import { t } from '@/i18n'
import VocabTable from '@/components/vocabulary/VocabSource.vue'
import FileInput from '@/components/FileInput.vue'
import type { SrcRow, VocabInfoSubDisplay } from '@/types'
import { useVocabStore } from '@/store/useVocab'
import { useDebounceTimeout, useState, watched } from '@/composables/utilities'
import { acquaintAll, generatedVocabTrie } from '@/utils/vocab'

const [fileInfo, setFileInfo] = useState('')

async function onFileChange({ info, text }: { info: string, text: string }) {
  setFileInfo(info)
  setInputText(text)
}

const [count, setCount] = useState(0)
const store = useVocabStore()
const [inputText, setInputText] = useState('')
watch(inputText, () => reformVocabList())
const reformVocabList = useDebounceTimeout(function refreshVocab() {
  const { list, count } = generatedVocabTrie(inputText.value)
  setCount(count)
  setTableDataOfVocab(list)
}, 50)

watch(() => store.baseReady, (isReady) => isReady && reformVocabList())
watch(() => store.irregularsReady, (isReady) => isReady && reformVocabList())
const [tableDataOfVocab, setTableDataOfVocab] = useState<SrcRow<VocabInfoSubDisplay>[]>([])
const importFileInput = ref()
</script>

<template>
  <div class="w-full max-w-screen-xl">
    <FileInput
      ref="importFileInput"
      class="relative mx-3 flex h-14 items-center xl:mx-0"
      @file-input="onFileChange"
    >
      {{ t('browseVocabFile') }}
    </FileInput>
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
            @change="importFileInput.inputChanged"
          />
        </div>
        <div class="flex h-9 shrink-0 items-center bg-zinc-50 p-1.5 font-compact text-xs text-neutral-600">
          <span class="grow truncate" />
          <span class="shrink-0 text-right tabular-nums">
            {{ `&nbsp;${count.toLocaleString('en-US')} ${t('words')}` }}
          </span>
          <span class="mx-1 inline-block h-[18px] w-px border-l align-middle" />
          <button
            class="box-border inline-flex h-7 max-h-full grow-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-md bg-zinc-200 px-3 py-2.5 text-center align-middle text-sm leading-3 transition-colors hover:bg-yellow-300"
            @click="()=>acquaintAll(tableDataOfVocab)"
          >
            {{ t('acquaintedAll') }}
          </button>
        </div>
      </div>
      <div class="h-[86vh] overflow-visible pb-6 md:mt-0 md:h-full md:w-[44%] md:pb-0">
        <VocabTable
          :data="tableDataOfVocab"
          tableName="vocab-import"
        />
      </div>
    </div>
  </div>
</template>
