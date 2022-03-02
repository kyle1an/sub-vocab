import { pruneEmpty, print, stringify, } from '../utils/utils.js';
import { deAffix, clearSuffix } from "../components/ignoreSuffix.js";
import _ from 'lodash/fp.js';

const has = Object.prototype.hasOwnProperty

class WordTree {
    trunk = Object.create(null);
    #i;

    constructor(words, counter) {
        this.#i = counter;
        this.add(words)
    }

    add = (newWords, collection = this.trunk) => {
        const newList = typeof newWords === 'string' ? newWords.match(/[a-zA-Z]+(?:-?[a-zA-Z]+'?)+/mg) || [] :
            Array.isArray(newWords) ? newWords : []

        newList.forEach((word) => this.#buildLayer(word, collection))
    }

    #buildLayer(word, branch) {
        const { length } = word;
        for (let i = 0; i < length; i++) {
            const c = word.charAt(i);
            if (!branch[c]) branch[c] = Object.create(null)
            branch = branch[c]
        }
        if (!branch.$) {
            branch.$ = {
                '_': 1,
                '~': word.length,
                '@': this.#i['@']++
            }
            return;
        }
        branch.$._ += 1;
    }

    filter(tar, isPrune = false) {
        let filter;
        if (typeof tar === 'string') {
            filter = Object.create(null)
            this.add(tar, filter)
        } else if (typeof tar === 'object') {
            filter = tar.trunk || tar;
        }
        const reset = (filtee) => filtee.$._ = 0;
        const remove = (filtee) => filtee.$ = { '_': null, '@': null }
        this.#alter(filter, this.trunk, isPrune ? remove : reset)
        if (isPrune) pruneEmpty(this.trunk)
    }

    #alter(filter, filtee, fn) {
        clearSuffix(filtee, filter);
        for (const key in filter) {
            if (filtee[key]) {
                if (key !== '$') {
                    this.#alter(filter[key], filtee[key], fn)
                } else {
                    fn(filtee);
                }
            }
        }
    }

    trans(addTree) {
        const newTree = addTree.trunk
        // console.log('be:', stringify(newTree, 1))
        // console.log('be:', stringify(this.trunk, 1))
        this.#emigrate(newTree, this.trunk);
        // console.log('Af:', stringify(newTree, 1))
        // console.log('Af:', stringify(this.trunk, 1))
    }

    #emigrate(newTree, branch) {
        for (const key in newTree) {
            const k = key.toLowerCase();
            if (branch[k]) {
                // console.log('has')
                if (k !== '$') {
                    this.#emigrate(newTree[key], branch[k])
                } else if (branch.$._ === newTree.$._) {
                    branch.$ = { '_': null, '@': null };
                } else {
                    // console.log('now')
                    // console.log(branch, newTree)
                    branch.$['@'] = Math.min(newTree.$['@'], branch.$['@'])
                    newTree.$ = { '_': null, '@': null };
                }
            }
        }
    }

    pruneEmpty = () => pruneEmpty(this.trunk)

    merge = (part) => {
        this.trunk = _.merge(this.trunk, part.trunk || part)
    }

    deAffix = () => deAffix(this.trunk)

    flatten() {
        const flattenedObject = {};
        // console.log('tree:', stringify(this.trunk, 1))
        this.#traverseAndFlatten(this.trunk, flattenedObject);
        // console.log('flattened:', stringify(flattenedObject, 1))
        return flattenedObject;
    }

    #traverseAndFlatten(currentNode, target, flattenedKey) {
        for (const key in currentNode) {
            if (currentNode[key]) {
                const is$ = key === '$'; // stop at $
                const newKey = (flattenedKey || '') + (is$ ? '' : key);
                const value = currentNode[key];
                // mergeSuffix(value);
                if (typeof value === 'object' && !is$) {
                    this.#traverseAndFlatten(value, target, newKey);
                } else {
                    target[newKey] = value; // $:[] -> $: Frequency
                }
            }
        }
    }

    cloneTree() {
        const co = new WordTree('')
        co.trunk = _.cloneDeep(this.trunk)
        return co;
    }
}

export { WordTree, print };
