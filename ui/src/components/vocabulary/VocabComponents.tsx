import { ElInput } from 'element-plus'
import type { Ref } from 'vue'
import type { MyVocabRow } from '@/types'
import { t } from '@/i18n'

export const Rank = ({ row }: { row: MyVocabRow }) => (
  <div class="tabular-nums text-neutral-500">
    {row.vocab.rank}
  </div>
)

export const Length = ({ row }: { row: MyVocabRow }) => (
  <div class="tabular-nums">
    {row.vocab.w.length}
  </div>
)

export const VocabSearch = (search: Ref<string>) => (
  <div class={'inline'} onClick={(ev) => ev.stopPropagation()}>
    <ElInput
      v-model={search.value}
      class="!w-[calc(100%-26px)] !text-base md:!text-xs"
      size="small"
      placeholder={t('search')}
    />
  </div>
)
