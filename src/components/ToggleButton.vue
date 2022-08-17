<script lang="tsx" setup>
import { Check } from '@element-plus/icons-vue'
import { PropType, ref } from 'vue'
import { ElNotification } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { LabelRow, Sieve } from '../types'
import { acquaint, revokeWord } from '../api/vocab-service'
import { useVocabStore } from '../store/useVocab'
import { useUserStore } from '../store/useState'
import router from '../router'

type VocabRow = LabelRow | { w: string, vocab: Sieve }
const { t } = useI18n()
const userStore = useUserStore()
const props = defineProps({
  'row': { type: Object as PropType<VocabRow>, default: () => ({}) },
})

const vocabStore = useVocabStore()
const loading = ref(false)

async function toggleWordState(row: VocabRow, name: string) {
  const word = row.w
  const vocabInfo = {
    word: word.replace(/'/g, `''`),
    user: name,
  }
  const acquainted = row?.vocab?.acquainted
  const res = await (acquainted ? revokeWord : acquaint)(vocabInfo)

  if (res?.affectedRows) {
    row.vocab = vocabStore.updateWord(word, !acquainted)
  }
}

async function handleClick(row: VocabRow) {
  loading.value = true

  if (userStore.user.name) {
    await toggleWordState(row, userStore.user.name)
  } else {
    ElNotification({
      message: (
        <span style={{ color: 'teal' }}>
          {t('please')}
          {' '}<i onClick={() => router.push('/login')}>{t('login')}</i>{' '}
          {t('to mark words')}
        </span>
      )
    })
  }

  loading.value = false
}
</script>

<template>
  <el-button
    color="#facc15"
    size="small"
    type="primary"
    :icon="Check"
    :plain="!props.row?.vocab?.acquainted"
    :loading="loading"
    :disabled="false"
    :text="!props.row?.vocab?.acquainted"
    class="!border-[1px] !text-white [.is-text&]:!border-zinc-300 [.is-text&]:!text-transparent [.is-text&]:hover:!text-black [.is-text.is-loading&]:!text-black"
    circle
    @click.stop="handleClick(props.row)"
  />
</template>

