import { defineStore } from 'pinia'
import Cookies from 'js-cookie'
import { useQuery } from '@tanstack/vue-query'
import { queryWordsByUser, stemsMapping } from '@/api/vocab-service'
import type { Sieve } from '@/types'
import { jsonClone } from '@/utils/utils'
import { login as loginUser, logoutToken } from '@/api/user'
import router from '@/router'

export const useVocabStore = defineStore('vocabStore', () => {
  let baseVocab = $ref<Sieve[]>([])
  const baseReady = $computed(() => !isFetching && isSuccess)
  let user = $ref(Cookies.get('_user') ?? '')
  const { isFetching, isSuccess } = $(useQuery(['userWords', $$(user)], async () => (await queryWordsByUser(user)).map((sieve) => {
    sieve.inUpdating = false
    return sieve
  }) as Sieve[], {
    initialData: [], refetchOnWindowFocus: false, retry: 10,
    onSuccess(data) {
      baseVocab = jsonClone(data)
    }
  }))

  async function login(info: { username: string, password: string }) {
    const resAuth = await loginUser(info)
    if (!resAuth.length) return
    user = info.username
    requestAnimationFrame(router.back)
    return true
  }

  async function logout() {
    await logoutToken({ username: user })
    Cookies.remove('_user', { path: '' })
    Cookies.remove('acct', { path: '' })
    user = ''
    requestAnimationFrame(() => router.push('/'))
  }

  const irregularsReady = $computed(() => !irrFetching && irrReady)
  const { isFetching: irrFetching, isSuccess: irrReady, data: irregularMaps } = $(useQuery(['stems'], stemsMapping, {
    initialData: [], refetchOnWindowFocus: false, retry: 10,
  }))

  function updateWord($: Sieve, got: boolean) {
    if ($.invalid) {
      baseVocab.push($)
      $.invalid = false
    }

    $.acquainted = got
    $.time_modified = new Date().toISOString()
  }

  return $$({
    baseVocab,
    updateWord,
    irregularMaps,
    irregularsReady,
    user,
    baseReady,
    login,
    logout,
  })
})
