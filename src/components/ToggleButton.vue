<script lang="tsx" setup>
import { Check, Loading } from '@element-plus/icons-vue'
import { ElButton, ElIcon, ElNotification } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { Sieve } from '@/types'
import { acquaint, revokeWord } from '@/api/vocab-service'
import { useVocabStore } from '@/store/useVocab'
import router from '@/router'

const { t } = useI18n()
const { row } = defineProps<{ row: Sieve }>()
const { user, loadingQueue, updateWord } = $(useVocabStore())
let isLoading = $ref(false)

async function toggleWordState(row: Sieve, name: string) {
  const word = row.w
  const vocabInfo = {
    word: word.replace(/'/g, `''`),
    user: name,
  }
  const acquainted = row.acquainted
  const res = await (acquainted ? revokeWord : acquaint)(vocabInfo)

  if (res.affectedRows) {
    updateWord(row, !acquainted)
    row.acquainted = !acquainted
  }
}

async function handleClick(row: Sieve) {
  isLoading = true
  loadingQueue.push(true)

  if (user) {
    await toggleWordState(row, user)
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

  loadingQueue.pop()
  isLoading = false
}
</script>

<template>
  <el-button
    color="#facc15"
    size="small"
    :disabled="isLoading"
    :class="`${row.acquainted?'!text-white':'un !border-zinc-300 !bg-transparent !text-transparent hover:!text-black'} ${isLoading?'[&_.is-loading]:!inline-flex [&_.check]:hidden [.un&]:!text-black':''}`"
    circle
    @click.stop="handleClick(row)"
  >
    <el-icon class="is-loading !hidden">
      <Loading />
    </el-icon>
    <el-icon class="check">
      <Check />
    </el-icon>
  </el-button>
</template>
