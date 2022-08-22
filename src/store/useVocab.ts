import { defineStore } from 'pinia'
import Cookies from 'js-cookie'
import { queryWordsByUser, stemsMapping } from '@/api/vocab-service'
import { Sieve, TrieNode } from '@/types'
import { getNode, hasUppercase, promiseClone, timer, timerEnd } from '@/utils/utils'

export const useVocabStore = defineStore('vocabStore', () => {
  let user: string = Cookies.get('_user') ?? ''

  let baseVocabPromise = queryWordsByUser(user)
  let baseVocab: Sieve[] = []

  const irregularMapsPromise = stemsMapping()
  let irregularMaps: string[][] = []

  const preBuiltTriePromise: Promise<TrieNode> = initTrie()
  let preBuiltTrie: TrieNode
  let copyTriePromise: Promise<TrieNode>
  let copiedTrie: TrieNode

  function resetUserVocab() {
    const currUser = Cookies.get('_user') ?? ''
    baseVocabPromise = queryWordsByUser(currUser)
    user = currUser
    baseVocab = []
  }

  async function getBaseVocab() {
    console.log('fetching')

    if (!baseVocab.length) {
      timer('vocab fetching')
      baseVocab = await baseVocabPromise
      timerEnd('vocab fetching')
    }

    console.log('done')
    return baseVocab
  }

  async function initTrie() {
    const trie = await buildStemTrie(await getBaseVocab())
    copyTriePromise = promiseClone(trie)
    return trie
  }

  async function buildStemTrie(vocab: Sieve[]) {
    console.time('struct sieve')
    const trie = {}
    for (const sieve of vocab) {
      const original = sieve.w
      const hasUp = hasUppercase(original)
      const node = getNode(trie, hasUp ? original.toLowerCase() : original)
      node.$ ??= { w: original, up: hasUp, len: original.length, src: [] }
      node.$.vocab = sieve
    }

    if (!irregularMaps.length) {
      irregularMaps = (await irregularMapsPromise).map((m) => [m.stem_word, ...m.derivations.split(',')])
    }

    for (const irregulars of irregularMaps) {
      const base = irregulars[0]
      const baseNode = getNode(trie, hasUppercase(base) ? base.toLowerCase() : base)
      baseNode.$ ??= { w: base, src: [] }

      let i = irregulars.length
      while (--i) {
        getNode(trie, irregulars[i]).$ = baseNode.$
      }
    }

    console.timeEnd('struct sieve')
    return trie
  }

  async function getPreBuiltTrie() {
    preBuiltTrie = await preBuiltTriePromise
    copiedTrie = await copyTriePromise
    copyTriePromise = promiseClone(preBuiltTrie)
    return copiedTrie
  }

  function updateWord(word: string, got: boolean) {
    const original = word
    const hasUp = hasUppercase(original)
    const node = getNode(preBuiltTrie, hasUp ? original.toLowerCase() : original)

    if (!node.$) {
      node.$ = { w: original, up: hasUp, len: original.length, src: [] }
    }

    if (!node.$.vocab) {
      node.$.vocab = { w: original, is_user: true, acquainted: false }
      baseVocab.push(node.$.vocab)
    }

    node.$.vocab.acquainted = got
    node.$.vocab.time_modified = new Date().toISOString()
    copyTriePromise = promiseClone(preBuiltTrie)
    return node.$.vocab
  }

  return { getBaseVocab, getPreBuiltTrie, resetUserVocab, updateWord }
})
