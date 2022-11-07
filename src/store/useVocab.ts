import { defineStore } from 'pinia'
import Cookies from 'js-cookie'
import { until } from '@vueuse/core'
import { logicAnd } from '@vueuse/math'
import { useQuery } from '@tanstack/vue-query'
import { queryWordsByUser, stemsMapping } from '@/api/vocab-service'
import type { Sieve } from '@/types'
import { jsonClone, timer, timerEnd } from '@/utils/utils'
import Trie from '@/utils/LabeledTire'
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
    initialData: [], refetchOnWindowFocus: false,
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

  const { isSuccess: irrReady, data: irregularMaps } = $(useQuery(['stems'], stemsMapping, {
    initialData: [], refetchOnWindowFocus: false,
  }))

  async function getPreBuiltTrie() {
    timer('struct sieve')
    await until(logicAnd($$(baseReady), $$(irrReady))).toBe(true)
    const baseTrie = new Trie().withPaths(baseVocab).share(irregularMaps)
    timerEnd('struct sieve')
    return baseTrie
  }

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
    getPreBuiltTrie,
    updateWord,
    user,
    baseReady,
    login,
    logout,
  })
})
