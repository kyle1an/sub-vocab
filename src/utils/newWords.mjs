import fs from 'fs';

const pathOfMostCommon = '../../public/1kCommonW.txt'
const pathOfMine = '../../public/myWords.txt'
const pathOfNew = '../../public/newWords.txt'
const path2Pack = '../../public/sieve.txt'

const arrayOfMostCommon = fs.readFileSync(pathOfMostCommon, 'utf8').match(/[A-Za-z]+(?:['-]?[A-Za-z]'?)+/mg)
const arrayOfMine = fs.readFileSync(pathOfMine, 'utf8').match(/[A-Za-z]+(?:['-]?[A-Za-z]'?)+/mg)

let array2Save;

const deduplicateAndReorder = function reorder(path) { //   sieve.match(/[A-Za-z]+(?:['-]?[A-Za-z]'?)+/mg
  const arrayOfInput = fs.readFileSync(path, 'utf8').match(/[A-Za-z]+(?:['-]?[A-Za-z]'?)+/mg) || ''
  const setOfMostCommon = new Set(arrayOfMostCommon)
  const setOfMine = new Set(arrayOfMine)
  const arrayOfNew = [];
  console.log(arrayOfInput)

  for (const w of arrayOfInput) {
    if (!setOfMostCommon.has(w) && !setOfMine.has(w)) {
      arrayOfNew.push(w)
    }
  }
  array2Save = [...new Set(arrayOfMine.concat(arrayOfNew))];

  fs.writeFile(pathOfMine, array2Save.sort().join('\n'), (err) => {
    if (err) return console.log(err);
    console.log('The file was saved!');
  });

  fs.writeFile(path, '', (err) => {
    if (err) return console.log(err);
    console.log('The file was saved!');
  });

  console.log('-------')
}

const packVocab2Path = function pack(pack2) {
  const res = [...new Set(arrayOfMostCommon.concat(array2Save))]
  fs.writeFile(pack2, res.join(' '), (err) => {
    if (err) return console.log(err);
    console.log('The file was saved!');
  });
}

deduplicateAndReorder(pathOfNew);
packVocab2Path(path2Pack);
