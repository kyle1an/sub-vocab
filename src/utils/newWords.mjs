import fs from "fs";

const pathCommon = '../../public/common-words.txt'
const pathMy = '../../public/myWords.txt'
const pathNew = '../../public/newWords.txt'

const common = fs.readFileSync(pathCommon, 'utf8').match(/[A-Za-z]+(?:['-]?[A-Za-z]'?)+/mg)
const myWords = fs.readFileSync(pathMy, 'utf8').match(/[A-Za-z]+(?:['-]?[A-Za-z]'?)+/mg)
const wordsNew = fs.readFileSync(pathNew, 'utf8').match(/[A-Za-z]+(?:['-]?[A-Za-z]'?)+/mg) || ''

console.log(wordsNew)

reorder(pathNew);

function reorder(path) { //   sieve.match(/[A-Za-z]+(?:['-]?[A-Za-z]'?)+/mg
    const commonSet = new Set(common)
    const currentSet = new Set(myWords)
    const neW = [];
    for (const w of wordsNew) {
        if (!commonSet.has(w) && !currentSet.has(w))
            neW.push(w)
    }
    const res = [...new Set(myWords.concat(neW))]
    fs.writeFile(pathMy, res.sort().join('\n'), (err) => {
        if (err) return console.log(err);
        console.log("The file was saved!");
    });
    fs.writeFile(path, '', (err) => {
        if (err) return console.log(err);
        console.log("The file was saved!");
    });
    console.log('-------')
}
