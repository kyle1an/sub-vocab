import { defineStore } from 'pinia'
import Cookies from 'js-cookie'
import { useQuery } from '@tanstack/vue-query'
import { computed, ref } from 'vue'
import { acquaint, batchAcquaint, queryWordsByUser, revokeWord, stemsMapping } from '@/api/vocab-service'
import type { LabelSieveDisplay, SrcRow } from '@/types'
import { login as loginUser, logoutToken } from '@/api/user'
import router from '@/router'
import { createSignal } from '@/composables/utilities'
import { loginNotify } from '@/utils/vocab'

export const useVocabStore = defineStore('SubVocabulary', () => {
  const baseVocab = ref<LabelSieveDisplay[]>([])
  const [user, setUser] = createSignal(Cookies.get('_user') ?? '')
  useQuery(['userWords', computed(user)], () => queryWordsByUser(user()), {
    initialData: [], refetchOnWindowFocus: false, retry: 10,
    onSuccess(data) {
      baseVocab.value = data.map((sieve) => ({
        ...sieve,
        inUpdating: false,
        inStore: true,
      }))
    }
  })

  async function login(info: { username: string, password: string }) {
    const resAuth = await loginUser(info)
    if (!resAuth[0]) return
    setUser(info.username)
    requestAnimationFrame(() => router.push('/'))
    return true
  }

  async function logout() {
    await logoutToken({ username: user() })
    Cookies.remove('_user', { path: '' })
    Cookies.remove('acct', { path: '' })
    setUser('')
    requestAnimationFrame(() => router.push('/'))
  }

  const { data: irregularMaps } = useQuery(['stems'], stemsMapping, {
    initialData: [], refetchOnWindowFocus: false, retry: 10,
  })

  function updateWord($: LabelSieveDisplay, got: boolean) {
    if (!$.inStore) {
      baseVocab.value.push($)
      $.inStore = true
    }

    $.acquainted = got
    $.time_modified = new Date().toISOString()
  }

  function toggleWordState(vocab: LabelSieveDisplay) {
    if (!user()) {
      loginNotify()
      return
    }

    vocab.inUpdating = true
    ;(vocab.acquainted ? revokeWord : acquaint)({
      word: vocab.w.replace(/'/g, `''`),
      user: user(),
    })
      .then((res) => {
        if (res?.affectedRows) {
          updateWord(vocab, !vocab.acquainted)
        }
      })
      .finally(() => {
        vocab.inUpdating = false
      })
  }

  function acquaintEveryVocab(tableDataOfVocab: SrcRow<LabelSieveDisplay>[]) {
    if (!user()) {
      loginNotify()
      return
    }

    const rows: SrcRow<LabelSieveDisplay>[] = []
    const words: string[] = []
    tableDataOfVocab.forEach((row) => {
      if (!row.vocab.acquainted && row.vocab.w.length < 32) {
        row.vocab.inUpdating = true
        rows.push(row)
        words.push(row.vocab.w.replace(/'/g, `''`))
      }
    })

    if (words.length === 0) {
      return
    }

    batchAcquaint({
      user: user(),
      words,
    })
      .then((res) => {
        if (res === 'success') {
          rows.forEach((row) => {
            updateWord(row.vocab, true)
          })
        }
      })
      .finally(() => {
        rows.forEach((row) => {
          row.vocab.inUpdating = false
        })
      })
  }

  return {
    baseVocab,
    acquaintEveryVocab,
    toggleWordState,
    irregularMaps,
    user,
    setUser,
    login,
    logout,
  }
})
