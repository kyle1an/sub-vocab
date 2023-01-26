import { defineStore } from 'pinia'
import Cookies from 'js-cookie'
import { useQuery } from '@tanstack/vue-query'
import { computed, ref } from 'vue'
import { queryWordsByUser, stemsMapping } from '@/api/vocab-service'
import type { VocabInfoSieveDisplay } from '@/types'
import { jsonClone } from '@/utils/utils'
import { login as loginUser, logoutToken } from '@/api/user'
import router from '@/router'
import { useState } from '@/composables/utilities'

export const useVocabStore = defineStore('SubVocabulary', () => {
  const baseVocab = ref<VocabInfoSieveDisplay[]>([])
  const baseReady = computed(() => !isFetching.value && isSuccess.value)
  const [user, setUser] = useState(Cookies.get('_user') ?? '')
  const { isFetching, isSuccess } = useQuery(['userWords', user.value], async () => (await queryWordsByUser(user.value)).map((sieve) => {
    sieve.inUpdating = false
    return sieve
  }) as VocabInfoSieveDisplay[], {
    initialData: [], refetchOnWindowFocus: false, retry: 10,
    onSuccess(data) {
      baseVocab.value = jsonClone(data)
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
      baseVocab.value = [...baseVocab.value, $]
      $.invalid = false
    }

    $.acquainted = got
    $.time_modified = new Date().toISOString()
  }

  return {
    baseVocab,
    updateWord,
    irregularMaps,
    irregularsReady,
    user,
    baseReady,
    login,
    logout,
  }
})
