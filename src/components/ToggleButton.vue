<script lang="tsx" setup>
import { Check, Loading } from '@element-plus/icons-vue'
import { ref } from 'vue'
import { ElButton, ElIcon, ElNotification } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { LabelRow, Sieve } from '@/types'
import { acquaint, revokeWord } from '@/api/vocab-service'
import { useVocabStore } from '@/store/useVocab'
import { useUserStore } from '@/store/useState'
import router from '@/router'

type VocabRow = LabelRow | { w: string, vocab: Sieve }
const { t } = useI18n()
const userStore = useUserStore()
const props = defineProps<{ row: VocabRow }>()
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
    :disabled="loading"
    :class="`${props.row?.vocab?.acquainted?'':'un '}${loading?'load ':''}!text-white [.load&_.is-loading]:!inline-flex [.load&_.check]:hidden [.un&]:!border-zinc-300 [.un&]:!bg-transparent [.un&]:!text-transparent [.un&]:hover:!text-black [.un.load&]:!text-black`"
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
