export default class VocabList {
  vocabList: any[] = [];

  constructor(words: any) {
    if (words) {
      this.add(words)
    }
  }

  add = (newWords: string) => {
    for (const m of newWords.match(/((?:[A-Za-zÀ-ÿ]['-]?)*(?:[A-ZÀ-Þ]+[a-zß-ÿ]*)+(?:['-]?[A-Za-zÀ-ÿ]'?)+)|[a-zß-ÿ]+(?:-?[a-zß-ÿ]'?)+/mg)!) {
      this.#insert(m);
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
