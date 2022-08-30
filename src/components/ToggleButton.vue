<script lang="tsx" setup>
import { Check, Loading } from '@element-plus/icons-vue'
import { ref } from 'vue'
import { ElButton, ElIcon, ElNotification } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { Sieve } from '@/types'
import { acquaint, revokeWord } from '@/api/vocab-service'
import { useVocabStore } from '@/store/useVocab'
import router from '@/router'

const { t } = useI18n()
const props = defineProps<{ row: Sieve }>()
const vocabStore = useVocabStore()
const loading = ref(false)

async function toggleWordState(row: Sieve, name: string) {
  const word = row.w
  const vocabInfo = {
    word: word.replace(/'/g, `''`),
    user: name,
  }
  const acquainted = row.acquainted
  const res = await (acquainted ? revokeWord : acquaint)(vocabInfo)

  if (res.affectedRows) {
    vocabStore.updateWord(row, !acquainted)
    row.acquainted = !acquainted
  }
}

async function handleClick(row: Sieve) {
  loading.value = true
  vocabStore.loadingQueue.push(true)

  if (vocabStore.user) {
    await toggleWordState(row, vocabStore.user)
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

  vocabStore.loadingQueue.pop()
  loading.value = false
}
</script>

<template>
  <el-button
    color="#facc15"
    size="small"
    :disabled="loading"
    :class="`${props.row.acquainted?'!text-white':'un !border-zinc-300 !bg-transparent !text-transparent hover:!text-black'} ${loading?'[&_.is-loading]:!inline-flex [&_.check]:hidden [.un&]:!text-black':''}`"
    circle
    @click.stop="handleClick(props.row)"
  >
    <el-icon class="is-loading !hidden">
      <Loading />
    </el-icon>
    <el-icon class="check">
      <Check />
    </el-icon>
  </el-button>
</template>
