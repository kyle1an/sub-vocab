import fs from 'fs';

const pathCommon = '../../public/1kCommonW.txt'
const commonWords = fs.readFileSync(pathCommon, 'utf8').match(/[A-Za-z]+(?:['-]?[A-Za-z]'?)+/mg)

const pathMy = '../../public/myWords.txt'
const myWords = fs.readFileSync(pathMy, 'utf8').match(/[A-Za-z]+(?:['-]?[A-Za-z]'?)+/mg)

const pathNew = '../../public/newWords.txt'
const pathPack2 = '../../public/sieve.txt'

const reorder = function reorder(path) { //   sieve.match(/[A-Za-z]+(?:['-]?[A-Za-z]'?)+/mg
  const neWords = fs.readFileSync(path, 'utf8').match(/[A-Za-z]+(?:['-]?[A-Za-z]'?)+/mg) || ''
  const commonSet = new Set(commonWords)
  const currentSet = new Set(myWords)
  const neW = [];
  console.log(neWords)

  for (const w of neWords) {
    if (!commonSet.has(w) && !currentSet.has(w)) {
      neW.push(w)
    }
  }

  const res = [...new Set(myWords.concat(neW))]

  fs.writeFile(pathMy, res.sort().join('\n'), (err) => {
    if (err) return console.log(err);
    console.log('The file was saved!');
  });

  fs.writeFile(path, '', (err) => {
    if (err) return console.log(err);
    console.log('The file was saved!');
  });

  console.log('-------')
}

const packVocab = function pack(pack2) {
  const res = [...new Set(commonWords.concat(myWords))]
  fs.writeFile(pack2, res.join(' '), (err) => {
    if (err) return console.log(err);
    console.log('The file was saved!');
  });
}

reorder(pathNew);
packVocab(pathPack2);
