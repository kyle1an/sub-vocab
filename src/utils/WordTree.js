import { pruneEmpty, print, stringify, } from '../utils/utils.js';
import { deAffix, clearSuffix } from "../components/ignoreSuffix.js";
import _ from 'lodash/fp.js';

const has = Object.prototype.hasOwnProperty

class WordTree {
    layer = {};
    #i;

    constructor(words, ct) {
        this.#i = ct;
        this.add(words)
    }

    add = (newWords, collection = this.layer) => {
        const newList = typeof newWords === 'string' ? newWords.match(/[a-zA-Z]+(?:-?[a-zA-Z]+'?)+/mg) || [] :
            Array.isArray(newWords) ? newWords : []

        newList.forEach((word) => this.#buildLayer(word, collection))
    }

    #buildLayer(word, layer) {
        const chars = [...word].reverse();
        while (chars.length > 0) {
            const c = chars.pop()
            if (!has.call(layer, c)) layer[c] = {}
            layer = layer[c]
        }
        if (!has.call(layer, '$')) {
            layer.$ = {
                '_': 1,
                '~': word.length,
                '@': this.#i['@']++
            }
            return;
        }
        layer.$._ += 1;
    }

    filter(tar, isPrune = false) {
        let filter;
        if (typeof tar === 'string') {
            filter = {}
            this.add(tar, filter)
        } else if (typeof tar === 'object') {
            filter = tar.layer || tar;
        }

        const reset = (filtee) => filtee.$._ = 0;
        const remove = (filtee) => filtee.$ = { '_': null, '@': null }
        this.#alter(filter, this.layer, isPrune ? remove : reset)
        if (isPrune) pruneEmpty(this.layer)
    }

    #alter(filter, filtee, fn) {
        clearSuffix(filtee, filter);
        for (const key in filter) {
            if (has.call(filtee, key)) {
                if (key !== '$') {
                    this.#alter(filter[key], filtee[key], fn)
                } else {
                    fn(filtee);
                }
            }
        }
    }

    trans(addTree) {
        const newTree = addTree.layer
        console.log('be:', stringify(newTree, 1))
        console.log('be:', stringify(this.layer, 1))
        this.#emigrate(newTree, this.layer);
        console.log('Af:', stringify(newTree, 1))
        console.log('Af:', stringify(this.layer, 1))
    }

    #emigrate(newTree, layer) {
        for (const key in newTree) {
            const k = key.toLowerCase();
            if (has.call(layer, k)) {
                console.log('has')
                if (k !== '$') {
                    this.#emigrate(newTree[key], layer[k])
                } else if (layer.$._ === newTree.$._) {
                    layer.$ = { '_': null, '@': null };
                } else {
                    console.log('now')
                    console.log(layer, newTree)
                    layer.$['@'] = Math.min(newTree.$['@'], layer.$['@'])
                    newTree.$ = { '_': null, '@': null };
                }
            }
        }
    }

    pruneEmpty() {
        pruneEmpty(this.layer)
    }

    merge(part) {
        this.layer = _.merge(this.layer, part.layer || part)
    }

    deAffix() {
        deAffix(this.layer)
    }

    flatten() {
        const flattenedObject = {};
        // console.log('tree:', stringify(this.layer, 1))
        this.#traverseAndFlatten(this.layer, flattenedObject);
        // console.log('flattened:', stringify(flattenedObject, 1))
        return flattenedObject;
    }

    #traverseAndFlatten(currentNode, target, flattenedKey) {
        for (const key in currentNode) {
            if (has.call(currentNode, key)) {
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
}

export { WordTree, print };
