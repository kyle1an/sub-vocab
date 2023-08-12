import { defineStore } from 'pinia'
import Cookies from 'js-cookie'
import { useQuery } from '@tanstack/vue-query'
import { ref, toRef, watch } from 'vue'
import type { LoginResponse } from '../../../backend/routes/auth'
import type { AcquaintWordsResponse, LabelFromUser, StemsMapping, ToggleWordResponse } from '../../../backend/routes/vocab'
import type { LabelSieveDisplay } from '@/types'
import { type Credential, type Username, logoutToken } from '@/api/user'
import router from '@/router'
import { createSignal } from '@/lib/composables'
import { loginNotify } from '@/components/vocab'
import { postRequest } from '@/lib/request'

export interface UserVocabs extends Username {
  username: string
  words: string[];
}

function useWords(user: () => string) {
  const { data } = useQuery(['userWords', toRef(user)], () => postRequest<LabelFromUser[]>(`/api/api/queryWords`, { username: user() } satisfies Username, { timeout: 4000 }), {
    initialData: [], refetchOnWindowFocus: false, retry: 10,
  })
  const baseVocab = ref<LabelSieveDisplay[]>([])
  watch(data, (data) => {
    baseVocab.value = data.map((sieve) => ({
      ...sieve,
      inUpdating: false,
      inStore: true,
    }))
  })

  function updateWord($: LabelSieveDisplay, got: boolean) {
    if (!$.inStore) {
      baseVocab.value.push($)
      $.inStore = true
    }

    $.acquainted = got
    $.time_modified = new Date().toISOString()
  }

  function revokeVocab(vocab: LabelSieveDisplay) {
    if (!user()) {
      loginNotify()
      return
    }

    if (vocab.w.length > 32) return

    vocab.inUpdating = true
    postRequest<ToggleWordResponse>(`/api/api/revokeWord`, {
      words: [vocab.w],
      username: user(),
    } satisfies UserVocabs)
      .then((res) => {
        if (res === 'success') {
          updateWord(vocab, !vocab.acquainted)
        }
      })
      .catch(console.error)
      .finally(() => {
        vocab.inUpdating = false
      })
  }

  function acquaintEveryVocab<T extends { vocab: LabelSieveDisplay }[]>(tableDataOfVocab: T) {
    if (!user()) {
      loginNotify()
      return
    }

    const rows = tableDataOfVocab.filter(row => !row.vocab.acquainted && row.vocab.w.length <= 32)

    if (rows.length === 0) {
      return
    }

    rows.forEach((row) => {
      row.vocab.inUpdating = true
    })

    postRequest<AcquaintWordsResponse>(`/api/api/acquaintWords`, {
      username: user(),
      words: rows.map(row => row.vocab.w),
    } satisfies UserVocabs)
      .then((res) => {
        if (res === 'success') {
          rows.forEach((row) => {
            updateWord(row.vocab, true)
          })
        }
      })
      .catch(console.error)
      .finally(() => {
        rows.forEach((row) => {
          row.vocab.inUpdating = false
        })
      })
  }

  return { baseVocab, revokeVocab, acquaintEveryVocab }
}

function useIrregular() {
  const { data } = useQuery(['irregularMaps'], () => postRequest<StemsMapping>(`/api/api/stemsMapping`, {}, { timeout: 2000 }), {
    initialData: [], refetchOnWindowFocus: false, retry: 10,
  })
  const irregularMaps = ref<StemsMapping>([])
  watch(data, (data) => {
    irregularMaps.value = data
  })
  return { irregularMaps }
}

function useUser() {
  const [user, setUser] = createSignal(Cookies.get('_user') ?? '')

  async function login(info: Credential) {
    const resAuth = await postRequest<LoginResponse>(`/api/login`, info)
    if (!resAuth[0]) return
    setUser(info.username)
    requestAnimationFrame(() => {
      router.push('/').catch(console.error)
    })
    return true
  }

  function logout() {
    logoutToken({ username: user() })
      .then(() => {
        Cookies.remove('_user', { path: '' })
        Cookies.remove('acct', { path: '' })
        setUser('')
        requestAnimationFrame(() => {
          router.push('/').catch(console.error)
        })
      })
      .catch(console.error)
  }

  return { user, setUser, login, logout }
}

export const useVocabStore = defineStore('SubVocabulary', () => {
  const user = useUser()

  return {
    inputText: ref(''),
    ...user,
    ...useWords(user.user),
    ...useIrregular(),
  }
}, {
  persist: true,
})
