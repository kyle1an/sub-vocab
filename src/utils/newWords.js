import { WordTree } from "../utils/WordTree.js";
import { pruneEmpty, stringify } from "../utils/utils.js";
import fs from "fs";

// fs.writeFile("/tmp/test", "Hey there!", function (err) {
//     if (err) {
//         return console.log(err);
//     }
//     console.log("The file was saved!");
// });

// Or
// fs.writeFileSync('/tmp/test-sync', 'Hey there!');

const has = Object.prototype.hasOwnProperty

const pathMy = '../../public/myWords.txt'
const pathNew = '../../public/newWords.txt'

const wordsMy = fs.readFileSync(pathMy, 'utf8')
const wordsNew = fs.readFileSync(pathNew, 'utf8')
console.log(wordsNew)

const i = { '@': 1 }
// filterNewWords(wordsNew)
reorder(pathMy)

function filterNewWords(wl) {
    const tt = new WordTree(wl, i)
    tt.filter(wordsMy, 1)
    // const tarTree =  buildMap(wl)
    console.log('-------')
    console.log(stringify(tt.layer))
    // console.log(stringify(tarTree))
    console.log('-------')
    // this.filter(this.myWords, tarTree, '$')
    // tt.filter(this.myWords, 1)

    console.log('---filtered----')
    // pruneEmpty(tarTree)
    // pruneEmpty(tt)

    console.log(tt.flatten())
    console.log('---pruned----')

    console.log(stringify(tt.layer))
    // console.log(stringify(tarTree))
    console.log('-------')
    console.log('-------')
    console.log('-------')
    // console.log(this.flattenObj(tarTree))
}

function reorder(path) {
    const words = fs.readFileSync(path, 'utf8')
    const t = new WordTree(words, i)
    const wordsObj = t.flatten()
    // console.log('-------', wordsObj)
    const wList = Object.keys(wordsObj).sort().join('\n')
    console.log(wList)
    fs.writeFile(path, wList, (err) => {
        if (err) return console.log(err);
        console.log("The file was saved!");
    });
    console.log('-------')
}
