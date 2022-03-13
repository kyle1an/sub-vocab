import { WordTree } from "../utils/WordTree.js";
import { stringify } from "../utils/utils.js";
import fs from "fs";

const pathMy = '../../public/myWords.txt'
const pathNew = '../../public/newWords.txt'

const wordsNew = fs.readFileSync(pathNew, 'utf8')
console.log(wordsNew)

reorder(pathMy);

function reorder(path) {
    const words = fs.readFileSync(path, 'utf8')
    const t = new WordTree(words, { '@': 1 })
    const wordsA = t.flatten()
    console.log('-------', wordsA)
    const wList = wordsA.map(({ vocab }) => vocab).sort().join('\n');
    console.log(wList)
    fs.writeFile(path, wList, (err) => {
        if (err) return console.log(err);
        console.log("The file was saved!");
    });
    console.log('-------')
}
