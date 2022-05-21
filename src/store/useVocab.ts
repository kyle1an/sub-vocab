import { defineStore } from 'pinia';
import { queryWords } from "../api/vocab-service";
import { ref } from "vue";

export const useVocabStore = defineStore('vocabStore', () => {
  let commonVocab = ref<any>([]);

  async function fetchVocab() {
    if (commonVocab.value.length === 0) {
      commonVocab.value = await queryWords();
    }
    return commonVocab.value;
  }

  return { commonVocab, fetchVocab };
})
