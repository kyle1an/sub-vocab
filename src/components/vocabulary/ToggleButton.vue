<script lang="tsx" setup>
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
  <button
    :disabled="row.inUpdating"
    :class="`el-button !p-[5px] !text-xs !w-6 !h-6 !rounded-[50%] ${row.acquainted?'!bg-[#facc15] focus:!bg-[rgb(252,219,91)] hover:!bg-[rgb(252,219,91)] !border-[#facc15] !text-white':'un !border-zinc-300 !bg-transparent !text-transparent hover:!text-black'} ${row.inUpdating?'[.un&]:!text-black':''}`"
    @click="handleVocabToggle(row)"
  >
    <i :class="`el-icon animate-[rotating_2s_linear_infinite] ${row.inUpdating?'':'!hidden'}`">
      <svg
        viewBox="0 0 1024 1024"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="currentColor"
          d="M512 64a32 32 0 0 1 32 32v192a32 32 0 0 1-64 0V96a32 32 0 0 1 32-32zm0 640a32 32 0 0 1 32 32v192a32 32 0 1 1-64 0V736a32 32 0 0 1 32-32zm448-192a32 32 0 0 1-32 32H736a32 32 0 1 1 0-64h192a32 32 0 0 1 32 32zm-640 0a32 32 0 0 1-32 32H96a32 32 0 0 1 0-64h192a32 32 0 0 1 32 32zM195.2 195.2a32 32 0 0 1 45.248 0L376.32 331.008a32 32 0 0 1-45.248 45.248L195.2 240.448a32 32 0 0 1 0-45.248zm452.544 452.544a32 32 0 0 1 45.248 0L828.8 783.552a32 32 0 0 1-45.248 45.248L647.744 692.992a32 32 0 0 1 0-45.248zM828.8 195.264a32 32 0 0 1 0 45.184L692.992 376.32a32 32 0 0 1-45.248-45.248l135.808-135.808a32 32 0 0 1 45.248 0zm-452.544 452.48a32 32 0 0 1 0 45.248L240.448 828.8a32 32 0 0 1-45.248-45.248l135.808-135.808a32 32 0 0 1 45.248 0z"
        />
      </svg>
    </i>
    <i :class="`el-icon ${row.inUpdating?'!hidden':''}`">
      <svg
        viewBox="0 0 1024 1024"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="currentColor"
          d="M406.656 706.944 195.84 496.256a32 32 0 1 0-45.248 45.248l256 256 512-512a32 32 0 0 0-45.248-45.248L406.592 706.944z"
        />
      </svg>
    </i>
  </button>
</template>
