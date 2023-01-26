import { defineStore } from 'pinia'
import Cookies from 'js-cookie'
import { useQuery } from '@tanstack/vue-query'
import { computed } from 'vue'
import { acquaint, batchAcquaint, queryWordsByUser, revokeWord, stemsMapping } from '@/api/vocab-service'
import type { VocabInfoSieveDisplay } from '@/types'
import { jsonClone } from '@/utils/utils'
import { login as loginUser, logoutToken } from '@/api/user'
import router from '@/router'
import { useState } from '@/composables/utilities'
import { SrcRow } from '@/types'

export const useVocabStore = defineStore('SubVocabulary', () => {
  const [baseVocab, setBaseVocab] = useState<VocabInfoSieveDisplay[]>([])
  const baseReady = computed(() => !isFetching.value && isSuccess.value)
  const [user, setUser] = useState(Cookies.get('_user') ?? '')
  const { isFetching, isSuccess } = useQuery(['userWords', user.value], async () => (await queryWordsByUser(user.value)).map((sieve) => {
    sieve.inUpdating = false
    return sieve
  }) as VocabInfoSieveDisplay[], {
    initialData: [], refetchOnWindowFocus: false, retry: 10,
    onSuccess(data) {
      setBaseVocab(jsonClone(data))
    }
  })

  async function login(info: { username: string, password: string }) {
    const resAuth = await loginUser(info)
    if (!resAuth[0]) return
    setUser(info.username)
    requestAnimationFrame(router.back)
    return true
  }

  async function logout() {
    await logoutToken({ username: user.value })
    Cookies.remove('_user', { path: '' })
    Cookies.remove('acct', { path: '' })
    setUser('')
    requestAnimationFrame(() => router.push('/'))
  }

  const irregularsReady = computed(() => !irrFetching.value && irrReady.value)
  const { isFetching: irrFetching, isSuccess: irrReady, data: irregularMaps } = useQuery(['stems'], stemsMapping, {
    initialData: [], refetchOnWindowFocus: false, retry: 10,
  })

  function updateWord($: VocabInfoSieveDisplay, got: boolean) {
    if ($.invalid) {
      setBaseVocab([...baseVocab.value, $])
      $.invalid = false
    }

    $.acquainted = got
    $.time_modified = new Date().toISOString()
  }

  async function toggleWordState(row: VocabInfoSieveDisplay, name: string) {
    row.inUpdating = true
    const res = await (row.acquainted ? revokeWord : acquaint)({
      word: row.w.replace(/'/g, `''`),
      user: name,
    })

    if (res?.affectedRows) {
      updateWord(row, !row.acquainted)
    }

    row.inUpdating = false
  }

  async function acquaintEveryVocab(tableDataOfVocab: SrcRow<VocabInfoSieveDisplay>[]) {
    const rowsMap: Record<string, SrcRow<VocabInfoSieveDisplay>> = {}
    const words: string[] = []
    tableDataOfVocab.forEach((row) => {
      if (!row.vocab.acquainted && row.vocab.w.length < 32) {
        const word = row.vocab.w.replace(/'/g, `''`)
        row.vocab.inUpdating = true
        rowsMap[word] = row
        words.push(word)
      }
    })
    const res = await batchAcquaint({ user: user.value, words }) as string
    if (res === 'success') {
      Object.values(rowsMap).forEach((row) => {
        updateWord(row.vocab, true)
        row.vocab.inUpdating = false
      })
    } else {
      Object.values(rowsMap).forEach((row) => {
        row.vocab.inUpdating = false
      })
    }
  }

  return {
    baseVocab,
    acquaintEveryVocab,
    toggleWordState,
    irregularMaps,
    irregularsReady,
    user,
    baseReady,
    login,
    logout,
  }
})
