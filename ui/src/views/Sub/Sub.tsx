import { defineComponent, ref, watch } from 'vue'
import { t } from '@/i18n'
import { VocabSourceTable } from '@/components/vocabulary/VocabSource'
import { FileInput } from '@/components/FileInput'
import type { LabelSubDisplay, SrcRow } from '@/types'
import { useVocabStore } from '@/store/useVocab'
import { useDebounceTimeout, useState } from '@/composables/utilities'
import { generatedVocabTrie } from '@/utils/vocab'
import { TextareaInput } from '@/components/TextareaInput'

export const Sub = defineComponent({
  setup() {
const [fileInfo, setFileInfo] = useState('')

async function onFileChange({ name, value }: { name: string, value: string }) {
  setFileInfo(name)
  setInputText(value)
}

const [count, setCount] = useState(0)
const [sentences, setSentences] = useState<string[]>([])
const store = useVocabStore()
const [inputText, setInputText] = useState('')
const [tableDataOfVocab, setTableDataOfVocab] = useState<SrcRow<LabelSubDisplay>[]>([])
watch(() => [inputText.value, store.baseVocab, store.irregularMaps], useDebounceTimeout(() => {
  const { list, count, sentences } = generatedVocabTrie(inputText.value)
  setCount(count)
  setSentences(sentences)
  setTableDataOfVocab(list)
}, 50))
const sourceFileInput = ref()

async function onTextChange({ name, value }: { name?: string, value: string }) {
  setInputText(value)
  if (name) setFileInfo(name)
  sourceFileInput.value.inputChanged()
}

return () => (
  <div class="w-full max-w-screen-xl">
    <div class="relative z-10 mx-3 flex h-14 items-center xl:mx-0">
      <FileInput
        ref={sourceFileInput}
        onFileInput={onFileChange}
      >
        {t('browseFiles')}
      </FileInput>
      <div class="grow" />
    </div>
    <div class="flex flex-col gap-6 md:h-[calc(100vh-140px)] md:flex-row">
      <div class="relative box-border flex flex-1 basis-auto flex-col overflow-hidden border md:rounded-[12px] md:shadow-sm">
        <div class="flex h-10 shrink-0 items-center border-b bg-zinc-50 py-2 pr-2 pl-4 font-compact text-xs text-neutral-600">
          <span class="grow truncate">{`${fileInfo.value} `}</span>
          <span class="mx-1 inline-block h-[18px] w-px border-l align-middle" />
          <span class="shrink-0 text-right tabular-nums">{` ${count.value.toLocaleString('en-US')} ${t('words')}`}</span>
        </div>
        <div class="h-full w-full grow text-base text-zinc-700 md:text-sm">
          <TextareaInput
            value={inputText.value}
            placeholder={t('inputArea')}
            onTextChange={onTextChange}
          />
        </div>
      </div>
      <div class="h-[86vh] overflow-visible pb-6 md:mt-0 md:h-full md:w-[44%] md:pb-0">
        <VocabSourceTable
          data={tableDataOfVocab.value}
          sentences={sentences.value}
          expand
          tableName={'vocab-statistics'}
        />
      </div>
    </div>
  </div>
)
  }
})
