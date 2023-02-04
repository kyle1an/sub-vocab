import { defineStore } from 'pinia'
import Cookies from 'js-cookie'
import { useQuery } from '@tanstack/vue-query'
import { acquaint, batchAcquaint, queryWordsByUser, revokeWord, stemsMapping } from '@/api/vocab-service'
import type { LabelSieveDisplay } from '@/types'
import { login as loginUser, logoutToken } from '@/api/user'
import router from '@/router'
import { useState } from '@/composables/utilities'
import { SrcRow } from '@/types'

export const useVocabStore = defineStore('SubVocabulary', () => {
  const [baseVocab, setBaseVocab] = useState<LabelSieveDisplay[]>([])
  const [user, setUser] = useState(Cookies.get('_user') ?? '')
  useQuery(['userWords', user.value], () => queryWordsByUser(user.value), {
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

  async function toggleWordState(row: LabelSieveDisplay, name: string) {
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

  async function acquaintEveryVocab(tableDataOfVocab: SrcRow<LabelSieveDisplay>[]) {
    const rowsMap: Record<string, SrcRow<LabelSieveDisplay>> = {}
    const words: string[] = []
    tableDataOfVocab.forEach((row) => {
      if (!row.vocab.acquainted && row.vocab.w.length < 32) {
        const word = row.vocab.w
        row.vocab.inUpdating = true
        rowsMap[word] = row
        words.push(word.replace(/'/g, `''`))
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
    user,
    login,
    logout,
  }
})
