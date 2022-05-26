import { defineStore } from 'pinia';
import { queryWords } from '../api/vocab-service';
import { Label, Sieve, TrieNode } from '../types';
import { getNode } from '../utils/utils';

export const useVocabStore = defineStore('vocabStore', () => {
  let commonVocab: Array<Sieve> = [];
  let query: Promise<Array<Sieve>> = queryWords();
  let trie: Record<string, Record<string, any>>;
  let trieCopy: Record<string, Record<string, any>>;
  let list: Array<Label>;
  let listCopy: Array<Label>;

  async function fetchVocab() {
    if (commonVocab.length === 0) {
      commonVocab = await query;
      structSieve();
    }
    return commonVocab;
  }

  function structSieve() {
    trie = {};
    list = [];
    for (const sieve of commonVocab) {
      const original = sieve.w;
      const isUp = /[A-Z]/.test(original)
      const node = getNode(isUp ? original.toLowerCase() : original, trie);
      if (!node.$) {
        list.push(node.$ = { w: original, up: isUp, freq: 0, len: original.length, src: [], vocab: sieve, F: true });
      }
    }
    console.log(JSON.stringify(trie));
    trieCopy = JSON.parse(JSON.stringify(trie))
    listCopy = JSON.parse(JSON.stringify(list))
  }

  async function getSieveTrie() {
    if (commonVocab.length === 0) {
      commonVocab = await query;
      structSieve();
    }
    return trie;
  }

  async function fetchSieve(): Promise<any> {
    const vocab = await fetchVocab();
    const trie = {};
    const list = [];
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
    return [trie, list];
  }

  return { fetchVocab, getSieveTrie, fetchSieve };
})
