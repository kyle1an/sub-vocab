import { defineStore } from 'pinia'
import Cookies from 'js-cookie'
import { reactive } from 'vue'
import { queryWordsByUser, stemsMapping } from '@/api/vocab-service'
import { Sieve } from '@/types'
import { hasUppercase, timer, timerEnd } from '@/utils/utils'
import Trie from '@/utils/LabeledTire'

export const useVocabStore = defineStore('vocabStore', () => {
  let user: string = Cookies.get('_user') ?? ''

  let baseVocabPromise = queryWordsByUser(user)
  let baseVocab: Sieve[] = []

  const irregularMapsPromise = stemsMapping()
  let irregularMaps: string[][] = []

  let preBuiltTrie: Trie

  function resetUserVocab() {
    const currUser = Cookies.get('_user') ?? ''
    baseVocabPromise = queryWordsByUser(currUser)
    user = currUser
    baseVocab = []
  }

  async function getBaseVocab() {
    console.log('fetching')

    if (baseVocab.length === 0) {
      timer('vocab fetching')
      baseVocab = (await baseVocabPromise).map((v) => reactive(v))
      timerEnd('vocab fetching')
    }

    console.log('done')
    return baseVocab
  }

  async function buildStemTrie(vocab: Sieve[]) {
    console.time('struct sieve')

    if (!irregularMaps.length) {
      irregularMaps = (await irregularMapsPromise).map((m) => [m.stem_word, ...m.derivations.split(',')])
    }

    const trie = new Trie().path(vocab).share(irregularMaps)
    console.timeEnd('struct sieve')
    return trie
  }

  async function getPreBuiltTrie() {
    return preBuiltTrie = await buildStemTrie(await getBaseVocab())
  }

  function updateWord(word: string, got: boolean) {
    if (!preBuiltTrie) return

    const original = word
    const hasUp = hasUppercase(original)
    const node = preBuiltTrie.getNode(hasUp ? original.toLowerCase() : original)

    node.$ ??= {
      w: original,
      up: hasUp,
      src: [],
    }

    if (!node.$.vocab) {
      node.$.vocab = {
        w: original,
        is_user: true,
        acquainted: false
      }

      baseVocab.push(node.$.vocab)
    }

    node.$.vocab.acquainted = got
    node.$.vocab.time_modified = new Date().toISOString()
  }

  return { getBaseVocab, getPreBuiltTrie, resetUserVocab, updateWord }
})
