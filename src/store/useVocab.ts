import { defineStore } from 'pinia';
import { queryWords } from '../api/vocab-service';
import { Label, Sieve, TrieNodeMap } from '../types';
import { getNodeByPath } from '../utils/utils';
import { IRREGULAR } from "../utils/stemsMapping";

export const useVocabStore = defineStore('vocabStore', () => {
  const query: Promise<Array<Sieve>> = queryWords();
  let commonVocab: Array<Sieve> = [];
  let trieListPair: [TrieNodeMap, Array<Label>];

  async function fetchVocab() {
    if (commonVocab.length === 0) {
      console.time('fetch vocab');
      commonVocab = await query;
      console.timeEnd('fetch vocab');
      trieListPair = structSieveMapPair(commonVocab);
    }
    return commonVocab;
  }

  function structSieveMapPair(vocab: Array<Sieve>): [TrieNodeMap, Array<Label>] {
    console.time('struct sieve')
    const trie: TrieNodeMap = new Map();
    const list: Array<Label> = [];
    for (const sieve of vocab) {
      const original = sieve.w;
      const isUp = /[A-Z]/.test(original)
      const node = getNodeByPath(trie, isUp ? original.toLowerCase() : original);

      if (!node.has('$')) {
        const $ = { w: original, up: isUp, len: original.length, src: [] };
        node.set('$', $);
        list.push($)
      }

      const $ = node.get('$')!;
      $.vocab = sieve;
      $.F = sieve.is_valid;
    }

    for (const irregularCollect of IRREGULAR) {
      const original = irregularCollect[0];
      const isUp = /[A-Z]/.test(original)
      const irregularWord = getNodeByPath(trie, isUp ? original.toLowerCase() : original);

      if (!irregularWord.has('$')) {
        const $ = { w: original, src: [] };
        irregularWord.set('$', $);
        list.push($)
      }

      let i = irregularCollect.length;
      while (--i) {
        const wordBranch = getNodeByPath(trie, irregularCollect[i]);
        wordBranch.set('$', irregularWord.get('$')!)
      }
    }

    console.timeEnd('struct sieve');
    return [trie, list];
  }

  async function getSieve() {
    await fetchVocab();
    setTimeout(() => {
      setTimeout(() => {
        trieListPair = structSieveMapPair(commonVocab);
      }, 0);
    }, 0);
    return trieListPair;
  }

  function updateWord(row: Label) {
    const original = row.vocab!.w;
    const isUp = /[A-Z]/.test(original)
    const [trie, list] = trieListPair;
    const node = getNodeByPath(trie, isUp ? original.toLowerCase() : original);
    if (!node.has('$')) {
      const $ = { w: original, up: isUp, len: original.length, src: [] }
      node.set('$', $)
      list.push($);
      commonVocab.push(<Sieve>row.vocab);
    }
    const $ = node.get('$')!
    $.vocab = row.vocab;
    $.F = row.vocab!.is_valid;
  }

  return { fetchVocab, updateWord, getSieve };
})
