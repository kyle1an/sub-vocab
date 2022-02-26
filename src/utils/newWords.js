import { WordTree } from "../components/Tree.js";
import { pruneEmpty, stringify } from "../utils/utils.js";
import fs from "fs";

const has = Object.prototype.hasOwnProperty
const init = {
    headers: {
        'Content-Type': 'text/plain',
        'Accept': 'application/json'
    }
}

const commonMap = fs.readFileSync('../../public/myWords.txt', 'utf8')
const addWords = fs.readFileSync('../../public/addWords.txt', 'utf8')
console.log(addWords)

const i = { '#': 1 }
// console.log(addWords)
filterNewWords(addWords)

function filterNewWords(wl) {
    const tt = new WordTree(wl, i)
    tt.filter(commonMap, 1)
    // const tarTree =  buildMap(wl)
    console.log('-------')
    console.log(stringify(tt.layer))
    // console.log(stringify(tarTree))
    console.log('-------')
    // this.filter(this.commonMap, tarTree, '$')
    // tt.filter(this.commonMap, 1)

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
