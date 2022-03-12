import { pruneEmpty, print, stringify, } from '../utils/utils.js';
import { deAffix, clearSuffix, resetSuffix } from '../utils/ignoreSuffix.js';
import _ from 'lodash/fp.js';

class WordTree {
    trunk = Object.create(null);
    #tUPPER = Object.create(null);
    #i;

    constructor(words, counter) {
        this.#i = counter;
        this.add(words)
    }

    add = (newWords) => {
        this.trunk = this.#insert(Array.isArray(newWords) ? newWords : String(newWords).match(/[a-zA-Z]+(?:-?[a-zA-Z]+'?)+/mg) || [], this.trunk)
        return this;
    }

    #insert = (wordList, collection) => {
        return wordList.reduce((collected, word) => {
            let branch = collected;
            for (let i = 0; i < word.length; i++) {
                const c = word.charAt(i);
                branch = branch[c] ??= {}
            }
            branch.$ = branch.$ ? { ...branch.$, '_': branch.$._ + 1 } : { '_': 1, '~': word.length, '@': this.#i['@']++ }
            return collected;
        }, collection);
    }

    // pseudo filter
    filter(sieve) {
        const remove = (word) => word.$._ = null;
        if (Array.isArray(sieve)) {
            this.#alterRay(remove, sieve)
        } else if (typeof sieve === 'object') {
            this.#alteration(remove, sieve.trunk || sieve)
        } else {
            this.#alterRay(remove, String(sieve).match(/[a-zA-Z]+(?:-?[a-zA-Z]+'?)+/mg) || []);
        }
    }


    #alteration(fn, sieve, impurities = this.trunk) {
        clearSuffix(impurities, sieve);
        for (const key in sieve) {
            const k = key.toLowerCase();
            if (impurities[k]) {
                if (k !== '$') {
                    this.#alteration(fn, sieve[key], impurities[k])
                } else {
                    fn(impurities);
                }
            }
        }
    }

    #alterRay(fn, sieve, impurities = this.trunk) {
        sieve.forEach((sie) => {
            let branch = impurities
            let isBreak = false;
            sie = sie.toLowerCase();
            const { length } = sie;
            for (let i = 0; i < length - 1; i++) {
                const c = sie.charAt(i);
                if (branch[c]) {
                    branch = branch[c]
                } else {
                    isBreak = true;
                    break;
                }
            }
            if (!isBreak) resetSuffix(branch, sie.slice(-1))
        });
    }

    trans(addTree) {
        const newTree = addTree.trunk
        // console.log('be:', stringify(newTree, 1))
        // console.log('be:', stringify(this.trunk, 1))
        this.#emigrate(newTree, this.trunk);
        // console.log('Af:', stringify(newTree, 1))
        // console.log('Af:', stringify(this.trunk, 1))
        return this;
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
                    // print(newTree, 1)
                    // print(branch, 1)
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
        return this;
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
