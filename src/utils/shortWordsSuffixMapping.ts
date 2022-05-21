const s = ['ad', 'use'];
const es = ['do', 'go'];
const d = ['die', 'use'];
const ing = ['do', 'go'];

const wordsObj = (words: string[]): Record<string, boolean> => {
  const obj: Record<string, boolean> = {};
  for (const word of words) {
    obj[word] = true;
  }
  return obj;
}
export const SHORT_WORDS_SUFFIX_MAPPING = {
  d: wordsObj(d),
  es: wordsObj(es),
  ing: wordsObj(ing),
  s: wordsObj(s),
};
