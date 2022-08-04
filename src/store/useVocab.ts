import { defineStore } from 'pinia'
import { queryWordsByUser, stemsMapping } from '../api/vocab-service'
import { Label, Sieve, Stems, TrieNode } from '../types'
import { getNode } from '../utils/utils'
import Cookies from 'js-cookie'

export const useVocabStore = defineStore('vocabStore', () => {
  const query: Promise<Sieve[]> = queryWordsByUser(Cookies.get('_user') ?? '')
  let commonVocab: Array<Sieve> = []
  const stemsDerivationMapping: Promise<Stems[]> = stemsMapping()
  const irregulars: Array<string[]> = []
  let trieListPair: [TrieNode, Array<Label>]

  async function fetchVocab(username?: string) {
    if (!irregulars.length) await fetchIrregulars()
    if (username !== undefined) {
      commonVocab = await queryWordsByUser(username)
    } else if (commonVocab.length === 0) {
      commonVocab = await query
    }

    return commonVocab
  }

  async function fetchIrregulars() {
    for (const row of await stemsDerivationMapping) {
      irregulars.push([row.stem_word, ...row.derivations.split(',')])
    }

    return stemsDerivationMapping
  }

  function structSievePair(vocab: Sieve[]): [TrieNode, Array<Label>] {
    console.time('struct sieve')
    const trie: TrieNode = {}
    const list: Label[] = []
    for (const sieve of vocab) {
      const original = sieve.w
      const isUp = /[A-Z]/.test(original)
      const node = getNode(trie, isUp ? original.toLowerCase() : original)

      if (!node.$) {
        list.push(node.$ = { w: original, up: isUp, len: original.length, src: [] })
      }

      node.$.vocab = sieve
      node.$.F = sieve.acquainted
    }

    for (const irregularCollect of irregulars) {
      const original = irregularCollect[0]
      const isUp = /[A-Z]/.test(original)
      const irregularWord = getNode(trie, isUp ? original.toLowerCase() : original)

      if (!irregularWord.$) {
        list.push(irregularWord.$ = { w: original, src: [] })
      }

      let i = irregularCollect.length
      while (--i) {
        const wordBranch = getNode(trie, irregularCollect[i])
        wordBranch.$ = irregularWord.$
      }
    }

    console.timeEnd('struct sieve')
    return [trie, list]
  }

  async function getSieve() {
    await fetchVocab()
    trieListPair = structSievePair(commonVocab)
    return trieListPair
  }

  function updateWord(row: Label) {
    const original = row.vocab?.w || ''
    const isUp = /[A-Z]/.test(original)
    const [trie, list] = trieListPair
    const node: TrieNode = getNode(trie, isUp ? original.toLowerCase() : original)
    if (!node.$) {
      node.$ = { w: original, up: isUp, len: original.length, src: [] }
      list.push(node.$)
      commonVocab.push(<Sieve>row.vocab)
    }
    node.$.vocab = row.vocab
    node.$.F = row.vocab?.acquainted
  }

  return { fetchVocab, updateWord, getSieve }
})
