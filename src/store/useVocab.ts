import { defineStore } from 'pinia'
import Cookies from 'js-cookie'
import { queryWordsByUser, stemsMapping } from '../api/vocab-service'
import { Label, LabelRow, Sieve, TrieNode } from '../types'
import { getNode } from '../utils/utils'

export const useVocabStore = defineStore('vocabStore', () => {
  const query = queryWordsByUser(Cookies.get('_user') ?? '')
  let commonVocab: Sieve[] = []
  const stemsDerivation = stemsMapping()
  let irregulars: string[][] = []
  let trieListPair: [TrieNode, Label[]]

  async function fetchVocab(username?: string) {
    if (!irregulars.length) {
      irregulars = (await stemsDerivation).map((m) => [m.stem_word, ...m.derivations.split(',')])
    }

    if (username !== undefined) {
      commonVocab = await queryWordsByUser(username)
    } else if (commonVocab.length === 0) {
      commonVocab = await query
    }

    return commonVocab
  }

  function structSievePair(vocab: Sieve[]): [TrieNode, Label[]] {
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

  function updateWord(row: LabelRow) {
    const original = row.vocab?.w ?? ''
    const isUp = /[A-Z]/.test(original)
    const [preBuiltTrie, mappedList] = trieListPair
    const node: TrieNode = getNode(preBuiltTrie, isUp ? original.toLowerCase() : original)
    if (!node.$) {
      node.$ = { w: original, up: isUp, len: original.length, src: [] }
      mappedList.push(node.$)
      commonVocab.push(<Sieve>row.vocab)
    }
    node.$.vocab = row.vocab
  }

  return { fetchVocab, updateWord, getSieve }
})
