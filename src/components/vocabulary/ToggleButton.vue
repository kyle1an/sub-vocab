<script lang="tsx" setup>
import { Check, Loading } from '@element-plus/icons-vue'
import { ElButton, ElIcon, ElNotification } from 'element-plus'
import { t } from '@/i18n'
import type { Sieve } from '@/types'
import { acquaint, revokeWord } from '@/api/vocab-service'
import { useVocabStore } from '@/store/useVocab'
import router from '@/router'

const { row } = defineProps<{ row: Sieve }>()
const { user, updateWord } = $(useVocabStore())

async function toggleWordState(row: Sieve, name: string) {
  row.inUpdating = true
  const res = await (row.acquainted ? revokeWord : acquaint)({
    word: row.w.replace(/'/g, `''`),
    user: name,
  })

  if (res.affectedRows) {
    updateWord(row, !row.acquainted)
  }

  row.inUpdating = false
}

async function handleClick(row: Sieve) {
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
      ),
      offset: 40,
    })
  }
}
</script>

<template>
  <el-button
    color="#facc15"
    size="small"
    :disabled="row.inUpdating"
    :class="`${row.acquainted?'!text-white':'un !border-zinc-300 !bg-transparent !text-transparent hover:!text-black'} ${row.inUpdating?'[&_.is-loading]:!inline-flex [&_.check]:hidden [.un&]:!text-black':''}`"
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
