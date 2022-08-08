<script lang="tsx" setup>
import { Check } from '@element-plus/icons-vue'
import { PropType, ref } from 'vue'
import { ElNotification } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { LabelRow } from '../types'
import { acquaint, revokeWord } from '../api/vocab-service'
import { useVocabStore } from '../store/useVocab'
import { useUserStore } from '../store/useState'
import router from '../router'

const { t } = useI18n()
const userStore = useUserStore()
const props = defineProps({
  'row': { type: Object as PropType<LabelRow>, default: () => ({}) },
})

const vocabStore = useVocabStore()
const loading = ref(false)

async function toggleWordState(row: LabelRow, name: string) {
  const word = row.w.replace(/'/g, `''`)
  row.vocab ??= { w: row.w, is_user: true, acquainted: false }
  const vocabInfo = {
    word,
    user: name,
  }
  const acquainted = row?.vocab?.acquainted
  const res = await (acquainted ? revokeWord : acquaint)(vocabInfo)

  if (res?.affectedRows) {
    row.vocab.acquainted = !acquainted
    vocabStore.updateWord(row)
  }
}

async function handleClick(row: LabelRow) {
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
    size="small"
    type="primary"
    :icon="Check"
    :plain="!props.row?.vocab?.acquainted"
    :loading="loading"
    :disabled="props.row?.vocab && !props.row?.vocab?.is_user"
    :text="!props.row?.vocab?.acquainted"
    class="max-w-full"
    @click.stop="handleClick(props.row)"
  />
</template>

<style lang="scss" scoped>
</style>
