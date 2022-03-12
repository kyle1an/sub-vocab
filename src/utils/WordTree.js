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
        this.trunk = (Array.isArray(newWords) ? newWords : String(newWords).match(/[a-zA-Z]+(?:-?[a-zA-Z]+'?)+/mg) || []).reduce((cll, word) => this.#insert(word, cll), this.trunk)
        return this;
    }

    #insert = (word, collection) => {
        let branch = collection;
        for (let i = 0; i < word.length; i++) {
            const c = word.charAt(i);
            branch = branch[c] ??= {}
        }
        branch.$ = branch.$ ? { ...branch.$, '_': branch.$._ + 1 } : { '_': 1, '~': word.length, '@': this.#i['@']++ }
        return collection;
    }

    // pseudo filter
    form(sieve) {
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
        this.#emigrate(newTree, this.trunk);
        return this;
    }

    #emigrate(newTree, branch) {
        for (const key in newTree) {
            const k = key.toLowerCase();
            if (branch[k]) {
                if (k !== '$') {
                    this.#emigrate(newTree[key], branch[k])
                } else if (branch.$._ === newTree.$._) {
                    branch.$ = { '_': null, '@': null };
                } else {
                    branch.$['@'] = Math.min(newTree.$['@'], branch.$['@'])
                    newTree.$ = { '_': null, '@': null };
                }
            }
        }
    }

    merge = (part) => {
        this.trunk = _.merge(this.trunk, part.trunk || part)
        return this;
    }

    deAffix = () => deAffix(this.trunk)

    flatten() {
        const flattened = [];
        this.#traverseAndFlatten(this.trunk, flattened, '');
        return flattened;
    }

    #traverseAndFlatten(node, target, concatKey) {
        for (const k in node) {
            if (k !== '$') {
                this.#traverseAndFlatten(node[k], target, concatKey + k);
            } else if (concatKey.length > 2 && node.$._) {
                target.push({ vocab: concatKey, info: [node.$._, node.$['~'], node.$['@']] })
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
