<script lang="tsx" setup>
import { Check, Loading } from '@element-plus/icons-vue'
import { ElButton, ElIcon } from 'element-plus'
import type { Sieve } from '@/types'

const {
  row,
  handleVocabToggle
} = defineProps<{
  row: Sieve,
  handleVocabToggle: (row: Sieve) => void
}>()
</script>

<template>
  <ElButton
    color="#facc15"
    size="small"
    :disabled="row.inUpdating"
    :class="`${row.acquainted?'!text-white':'un !border-zinc-300 !bg-transparent !text-transparent hover:!text-black'} ${row.inUpdating?'[&_.is-loading]:!inline-flex [&_.check]:hidden [.un&]:!text-black':''}`"
    circle
    @click.stop="handleVocabToggle(row)"
  >
    <ElIcon class="is-loading !hidden">
      <Loading />
    </ElIcon>
    <ElIcon class="check">
      <Check />
    </ElIcon>
  </ElButton>
</template>
