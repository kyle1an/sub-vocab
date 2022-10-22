import { defineStore } from 'pinia'
import Cookies from 'js-cookie'
import { until } from '@vueuse/core'
import { ref } from 'vue'
import { logicAnd } from '@vueuse/math'
import { useQuery } from '@tanstack/vue-query'
import { queryWordsByUser, stemsMapping } from '@/api/vocab-service'
import type { Sieve } from '@/types'
import { timer, timerEnd } from '@/utils/utils'
import Trie from '@/utils/LabeledTire'
import { login as loginUser, logoutToken } from '@/api/user'
import router from '@/router'
import { watched } from '@/composables/utilities'

export const useVocabStore = defineStore('vocabStore', () => {
  let baseVocab = $ref<Sieve[]>([])
  let baseReady = $ref(false)
  let user = $(watched(ref(Cookies.get('_user') ?? ''), async (user) => {
    baseReady = false
    baseVocab = (await queryWordsByUser(user)).map((sieve) => {
      sieve.inUpdating = false
      return sieve
    }) as Sieve[]
    baseReady = true
    queueMicrotask(backTrie)
  }, { immediate: true }))

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

  let baseTrie = $shallowRef(new Trie())
  let trieReady = $ref(false)

  async function backTrie() {
    trieReady = false
    timer('struct sieve')
    await until(logicAnd($$(baseReady), $$(irrReady))).toBe(true)
    baseTrie = new Trie().path(baseVocab).share(irregularMaps)
    timerEnd('struct sieve')
    trieReady = true
  }

  const getPreBuiltTrie = () => until($$(trieReady)).toBe(true).then(() => baseTrie)

  function updateWord($: Sieve, got: boolean) {
    if ($.invalid) {
      baseVocab.push($)
      queueMicrotask(() => baseTrie.path([$]))
      $.invalid = false
    }

    $.acquainted = got
    $.time_modified = new Date().toISOString()
  }

  return $$({
    baseVocab,
    backTrie,
    getPreBuiltTrie,
    trieReady,
    updateWord,
    user,
    baseReady,
    login,
    logout,
  })
})
