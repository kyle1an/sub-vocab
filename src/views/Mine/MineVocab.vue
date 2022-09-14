<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { useVocabStore } from '@/store/useVocab'
import MyVocabulary from '@/views/Mine/MyVocabulary.vue'

const { t } = useI18n()
const { baseVocab } = $(useVocabStore())
</script>

<template>
  <div class="h-[calc(100vh-160px)] w-full md:h-full md:pb-0">
    <div class="m-auto flex h-full max-w-full flex-col overflow-visible">
      <div class="mb-3 flex">
        <div class="flex-auto grow" />
        <router-link
          to="/import"
          class="flex items-center"
        >
          <a class="box-border inline-flex h-8 max-h-full grow-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-md border bg-zinc-50 px-3 py-2.5 text-center align-middle text-sm leading-3 tracking-wide text-neutral-800 transition-colors hover:border-sky-300 hover:bg-sky-100 hover:text-sky-600">
            {{ t('importVocab') }}
          </a>
        </router-link>
      </div>
      <MyVocabulary
        :myVocab="baseVocab"
      />
    </div>
  </div>
</template>
