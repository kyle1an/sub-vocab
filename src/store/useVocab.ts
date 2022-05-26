import { defineStore } from 'pinia';
import { queryWords } from '../api/vocab-service';
import { Label, Sieve, TrieNode } from '../types';
import { getNode } from '../utils/utils';

export const useVocabStore = defineStore('vocabStore', () => {
  let query: Promise<Array<Sieve>> = queryWords();
  let commonVocab: Array<Sieve> = [];
  let trieListPair: [TrieNode, Array<Label>];

  async function fetchVocab() {
    if (commonVocab.length === 0) {
      console.time('fetch vocab');
      commonVocab = await query;
      console.timeEnd('fetch vocab');
      trieListPair = structSievePair(commonVocab);
    }
    return commonVocab;
  }

  function structSievePair(vocab: Array<Sieve>): [TrieNode, Array<Label>] {
    console.time('struct sieve')
    const trie: TrieNode = {};
    const list: Array<Label> = [];
    for (const sieve of vocab) {
      const original = sieve.w;
      const isUp = /[A-Z]/.test(original)
      const node: TrieNode = getNode(isUp ? original.toLowerCase() : original, trie);

      if (!node.$) {
        list.push(node.$ = { w: original, up: isUp, freq: 0, len: original.length, src: [] });
      }

      node.$.vocab = sieve;
      node.$.F = sieve.is_valid;
    }
    console.timeEnd('struct sieve');
    return [trie, list];
  }

  async function fetchSieve(): Promise<any> {
    debugger
    await fetchVocab();
    setTimeout((): void => {
      trieListPair = structSievePair(commonVocab);
    }, 0);
    return trieListPair;
  }

  function updateWord(row: Label) {
    const original = row.vocab!.w;
    const isUp = /[A-Z]/.test(original)
    const [trie, list] = trieListPair;
    const node: TrieNode = getNode(isUp ? original.toLowerCase() : original, trie);
    if (!node.$) {
      node.$ = { w: original, up: isUp, freq: 0, len: original.length, src: [] }
      list.push(<Label>node.$);
      commonVocab.push(<Sieve>row.vocab);
    }
    node.$.vocab = row.vocab;
    node.$.F = row.vocab!.is_valid;
  }

  return { fetchVocab, updateWord, fetchSieve };
})
