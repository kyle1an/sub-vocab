import { defineStore } from 'pinia'
import Cookies from 'js-cookie'
import { until, useAsyncState } from '@vueuse/core'
import { ref } from 'vue'
import { logicAnd } from '@vueuse/math'
import { queryWordsByUser, stemsMapping } from '@/api/vocab-service'
import { Sieve } from '@/types'
import { timer, timerEnd } from '@/utils/utils'
import Trie from '@/utils/LabeledTire'
import { login as loginUser, logoutToken } from '@/api/user'
import router from '@/router'
import { watched } from '@/composables/utilities'

export const useVocabStore = defineStore('vocabStore', () => {
  let baseVocab = $ref<Sieve[]>([])
  let baseReady = $ref(false)
  let user = $(watched(ref(Cookies.get('_user') ?? ''), async (user) => {
    Cookies.set('_user', user, { expires: 30 })
    baseReady = false
    baseVocab = await queryWordsByUser(user)
    baseReady = true
    queueMicrotask(backTrie)
  }, { immediate: true }))

  async function login(info: { username: string, password: string }) {
    const resAuth = await loginUser(info)

    if (!resAuth.length) return

    Cookies.set('_user', info.username, { expires: 30 })
    Cookies.set('acct', resAuth[1], { expires: 30 })
    user = info.username
    requestAnimationFrame(() => router.push('/'))
    return true
  }

  async function logout() {
    await logoutToken({ username: user })
    Cookies.remove('_user', { path: '' })
    Cookies.remove('acct', { path: '' })
    user = ''
    requestAnimationFrame(() => router.push('/'))
  }

  const { state: irregularMaps, isReady: irrReady } = $(useAsyncState(async () =>
      (await stemsMapping()).map((m) => [m.stem_word, ...m.derivations.split(',')])
    , []))

  async function buildStemTrie() {
    timer('struct sieve')
    await until(logicAnd($$(baseReady), $$(irrReady))).toBe(true)
    const trie = new Trie().path(baseVocab).share(irregularMaps)
    timerEnd('struct sieve')
    return trie
  }

  let baseTrie = $shallowRef(new Trie())
  let trieReady = $ref(false)

  async function backTrie() {
    trieReady = false
    baseTrie = await buildStemTrie()
    trieReady = true
  }

  async function getPreBuiltTrie() {
    await until($$(trieReady)).toBe(true)
    return baseTrie
  }

  function updateWord($: Sieve, got: boolean) {
    if ($.invalid) {
      baseVocab = [...baseVocab, $]
      queueMicrotask(backTrie)
      $.invalid = false
    }

    $.acquainted = got
    $.time_modified = new Date().toISOString()
  }

  const loadingQueue = $ref<boolean[]>([])
  const inUpdating = $computed(() => loadingQueue.length > 0)
  return $$({
    baseVocab,
    backTrie,
    getPreBuiltTrie,
    inUpdating,
    loadingQueue,
    trieReady,
    updateWord,
    user,
    baseReady,
    login,
    logout,
  })
})
