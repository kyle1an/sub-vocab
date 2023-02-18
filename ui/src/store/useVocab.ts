import { defineStore } from 'pinia'
import Cookies from 'js-cookie'
import { useQuery } from '@tanstack/vue-query'
import { acquaint, batchAcquaint, queryWordsByUser, revokeWord, stemsMapping } from '@/api/vocab-service'
import type { LabelSieveDisplay, SrcRow } from '@/types'
import { login as loginUser, logoutToken } from '@/api/user'
import router from '@/router'
import { useState } from '@/composables/utilities'
import { loginNotify } from '@/utils/vocab'

export const useVocabStore = defineStore('SubVocabulary', () => {
  const [baseVocab, setBaseVocab] = useState<LabelSieveDisplay[]>([])
  const [user, setUser] = useState(Cookies.get('_user') ?? '')
  useQuery(['userWords', user], () => queryWordsByUser(user.value), {
    initialData: [], refetchOnWindowFocus: false, retry: 10,
    onSuccess(data) {
      setBaseVocab(data.map((sieve) => ({
        ...sieve,
        inUpdating: false,
        inStore: true,
      })))
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
    await logoutToken({ username: user.value })
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
    if (!user.value) {
      loginNotify()
      return
    }

    vocab.inUpdating = true
    ;(vocab.acquainted ? revokeWord : acquaint)({
      word: vocab.w.replace(/'/g, `''`),
      user: user.value,
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
    if (!user.value) {
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
      user: user.value,
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
    login,
    logout,
  }
})
