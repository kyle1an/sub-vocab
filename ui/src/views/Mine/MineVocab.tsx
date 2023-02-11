import { defineComponent } from 'vue'
import { RouterLink } from 'vue-router'
import { t } from '@/i18n'
import { VocabDataTable } from '@/components/vocabulary/VocabData'

export const MineVocab = defineComponent({
  setup() {
    return () => (
  <div class="h-[calc(100vh-160px)] w-full md:h-full md:pb-0">
    <div class="m-auto flex h-full max-w-full flex-col overflow-visible">
      <div class="mb-3 flex">
        <div class="flex-auto grow" />
        <RouterLink
          to="/import"
          class="flex items-center"
        >
          <a class="box-border inline-flex h-8 max-h-full grow-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-md border bg-zinc-50 px-3 py-2.5 text-center align-middle text-sm leading-3 tracking-wide text-neutral-800 transition-colors hover:border-sky-300 hover:bg-sky-100 hover:text-sky-600">
            {t('importVocab')}
          </a>
        </RouterLink>
      </div>
      <VocabDataTable tableName="my-vocab" />
    </div>
  </div>
    )
  },
})
