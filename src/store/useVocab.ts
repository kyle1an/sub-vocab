import { defineStore } from 'pinia'
import Cookies from 'js-cookie'
import { until, useAsyncState } from '@vueuse/core'
import { computed, ref, shallowRef, watch } from 'vue'
import { logicAnd } from '@vueuse/math'
import { queryWordsByUser, stemsMapping } from '@/api/vocab-service'
import { Sieve } from '@/types'
import { timer, timerEnd } from '@/utils/utils'
import Trie from '@/utils/LabeledTire'
import { logoutToken } from '@/api/user'

export const useVocabStore = defineStore('vocabStore', () => {
  const user = ref(Cookies.get('_user') ?? '')
  watch(user, () => Cookies.set('_user', user.value, { expires: 30 }))

  function login(username: string, tk: string) {
    Cookies.set('_user', username, { expires: 30 })
    Cookies.set('acct', tk, { expires: 30 })
    user.value = username
  }

  async function logout() {
    await logoutToken({ username: user.value })
    Cookies.remove('_user', { path: '' })
    Cookies.remove('acct', { path: '' })
    user.value = ''
  }

  const baseVocab = ref<Sieve[]>([])
  const baseReady = ref(false)
  watch(user, async () => {
    baseReady.value = false
    const { state, isReady } = useAsyncState(queryWordsByUser(user.value), [])
    await until(isReady).toBe(true)
    baseVocab.value = state.value
    baseReady.value = true
    requestAnimationFrame(backTrie)
  }, { immediate: true })

  const { state: irregularMaps, isReady: irrReady } = useAsyncState(async () =>
      (await stemsMapping()).map((m) => [m.stem_word, ...m.derivations.split(',')])
    , [])

  async function buildStemTrie() {
    timer('struct sieve')
    await until(logicAnd(baseReady, irrReady)).toBe(true)
    const trie = new Trie().path(baseVocab.value).share(irregularMaps.value)
    timerEnd('struct sieve')
    return trie
  }

  const baseTrie = shallowRef(new Trie())
  const trieReady = ref(false)

  async function backTrie() {
    trieReady.value = false
    const { state, isReady } = useAsyncState(buildStemTrie, new Trie())
    await until(isReady).toBe(true)
    baseTrie.value = state.value
    trieReady.value = true
  }

  async function getPreBuiltTrie() {
    await until(trieReady).toBe(true)
    requestAnimationFrame(backTrie)
    return baseTrie.value
  }

  function updateWord($: Sieve, got: boolean) {
    if ($.invalid) {
      baseVocab.value = [...baseVocab.value, $]
      $.invalid = false
    }

    $.acquainted = got
    $.time_modified = new Date().toISOString()
  }

  const loadingQueue = ref<boolean[]>([])
  return {
    baseVocab,
    getPreBuiltTrie,
    inUpdating: computed(() => loadingQueue.value.length > 0),
    loadingQueue,
    trieReady,
    updateWord,
    user,
    baseReady,
    login,
    logout,
  }
})
