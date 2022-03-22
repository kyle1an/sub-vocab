import fs from "fs";

const pathMy = '../../public/myWords.txt'
const pathNew = '../../public/newWords.txt'

const wordsNew = fs.readFileSync(pathNew, 'utf8')
console.log(wordsNew)

reorder(pathMy);

function reorder(path) { //   sieve.match(/[A-Za-z]+(?:['-]?[A-Za-z]'?)+/mg
    const words = fs.readFileSync(path, 'utf8')
    const wList = [...new Set(words.match(/[A-Za-z]+(?:['-]?[A-Za-z]'?)+/mg))].sort().join('\n');
    console.log(wList)
    fs.writeFile(path, wList, (err) => {
        if (err) return console.log(err);
        console.log("The file was saved!");
    });
    console.log('-------')
}
