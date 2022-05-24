import { defineStore } from 'pinia';
import { queryWords } from '../api/vocab-service';
import { Label } from "../types";

export const useVocabStore = defineStore('vocabStore', () => {
  let commonVocab: Array<Label> = [];
  let query: Promise<Array<Label>> = queryWords();
  let sieveTrie = {};

  async function fetchVocab() {
    if (commonVocab.length === 0) {
      commonVocab = await query;
      sieveTrie = structSieveTrie();
    }
    return commonVocab;
  }

  function structSieveTrie() {
    const vocabList = commonVocab;
    const trie = {};
    for (const sieve of vocabList) {
      let node: any = trie;
      const original = sieve.w;
      const isUp = /[A-Z]/.test(original)
      const charsOfSieve = (isUp ? original.toLowerCase() : original).split('');
      for (const c of charsOfSieve) node = node[c] ??= {}
      node.$ ??= { vocab: sieve };
    }
    console.log(JSON.stringify(trie));
    return trie;
  }

  async function getSieveTrie() {
    if (commonVocab.length === 0) {
      await fetchVocab();
    }
    return sieveTrie;
  }

  return { fetchVocab, getSieveTrie };
})
