const s = ['ad', 'use'];
const es = ['do', 'go'];
const d = ['die', 'use'];
const ing = ['do', 'go'];

const wordsObj = (words) => {
  const obj = {};
  for (const word of words) {
    obj[word] = true;
  }
  return obj;
}
export default {
  s: wordsObj(s), es: wordsObj(es), d: wordsObj(d), ing: wordsObj(ing)
};
