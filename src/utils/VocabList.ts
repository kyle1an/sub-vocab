export default class VocabList {
  vocabList: any[] = [];

  constructor(words: any) {
    if (words) {
      this.add(words)
    }
  }

  add = (newWords: Array<any>) => {
    for (const m of newWords) {
      this.#insert(m.w);
    }

    return this;
  };

  #insert = (original: string) => {
    this.vocabList.push({
      w: original,
      len: original.length,
      rank: this.vocabList.length + 1,
    });
  }

  formList = (): any[] => {
    return this.vocabList;
  }
}
