import { defineComponent, ref, watch } from 'vue'
import { t } from '@/i18n'
import { VocabSourceTable } from '@/components/ui/VocabSource'
import { FileInput } from '@/components/ui/FileInput'
import type { SrcWith } from '@/types'
import { type LabelDisplayTable } from '@/components/vocab'
import { useVocabStore } from '@/store/useVocab'
import { createSignal, useDebounceTimeout } from '@/lib/composables'
import { generatedVocabTrie } from '@/components/vocab'
import { TextareaInput } from '@/components/ui/TextareaInput'

export default defineComponent(() => {
  const [fileInfo, setFileInfo] = createSignal('')

  function onFileChange({ name, value }: { name: string; value: string }) {
    setFileInfo(name)
    store.inputText = value
  }

  const [count, setCount] = createSignal(0)
  const [sentences, setSentences] = createSignal<string[]>([])
  const store = useVocabStore()
  const [tableDataOfVocab, setTableDataOfVocab] = createSignal<SrcWith<LabelDisplayTable>[]>([])
  watch(() => [store.inputText, store.baseVocab, store.irregularMaps], useDebounceTimeout(() => {
    const { list, count, sentences } = generatedVocabTrie(store.inputText, store.baseVocab, store.irregularMaps)
    setCount(count)
    setSentences(sentences)
    setTableDataOfVocab(list)
  }, 50))
  const sourceFileInput = ref<typeof FileInput & { inputChanged: () => void } | null>(null)

  function onTextChange({ name, value }: { name?: string; value: string }) {
    store.inputText = value
    if (name) setFileInfo(name)
    sourceFileInput.value?.inputChanged()
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
          <div class="flex h-10 shrink-0 items-center border-b bg-zinc-50 py-2 pl-4 pr-2 font-compact text-xs text-neutral-600">
            <span class="grow truncate">{`${fileInfo()} `}</span>
            <span class="mx-1 inline-block h-[18px] w-px border-l align-middle" />
            <span class="shrink-0 text-right tabular-nums">{` ${count().toLocaleString('en-US')} ${t('words')}`}</span>
          </div>
          <div class="h-full w-full grow text-base text-zinc-700 md:text-sm">
            <TextareaInput
              value={store.inputText}
              placeholder={t('inputArea')}
              onTextChange={onTextChange}
            />
          </div>
        </div>
        <div class="h-[86vh] overflow-visible pb-6 md:mt-0 md:h-full md:w-[44%] md:pb-0">
          <VocabSourceTable
            data={tableDataOfVocab()}
            sentences={sentences()}
            expand
            tableName={'vocab-statistics'}
          />
        </div>
      </div>
    </div>
  )
})
