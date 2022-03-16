import { print, } from '../utils/utils.js';
import { deAffix, resetSuffix } from '../utils/ignoreSuffix.js';
import _ from 'lodash/fp.js';

class WordTree {
    trunk = Object.create(null);
    #tUPPER = {};
    #i = 1;

    constructor(words) {
        this.add(words)
    }

    add = (neW) => (Array.isArray(neW) ? neW : neW.match(/[A-Za-z]+(?:['-]?[A-Za-z]'?)+/mg) || []).reduce((col, word) => this.#insert(word, col), this.trunk);

    put = (neW, upper) => {
        if (upper) {
            this.#insert(upper, this.#tUPPER)
            this.#insert(upper.toLowerCase(), this.trunk)
        } else {
            this.#insert(neW, this.trunk)
        }
    }

    #insert = (word, collection) => {
        let branch = collection;
        for (let i = 0; i < word.length; i++) {
            const c = word.charAt(i);
            branch = branch[c] ??= {}
        }
        branch.$ = branch.$ ? { ...branch.$, '_': branch.$._ + 1 } : { '_': 1, '~': word.length, '@': this.#i++ }
        return collection;
    }

    formList(words, sieve, upper = this.#tUPPER) {
        const vocab = _.cloneDeep(words.trunk);
        if (sieve) this.flt(sieve, vocab)
        return this.flatten(this.trans(_.cloneDeep(upper), vocab)).sort((a, b) => a.info[2] - b.info[2]);
    }

    // pseudo filter
    flt = (sieve, vocab) => this.#alterRay((word) => word.$._ = null, Array.isArray(sieve) ? sieve : sieve.match(/[A-Za-z]+(?:['-]?[A-Za-z]'?)+/mg) || [], vocab);

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

    trans(upper, trunk = this.trunk) {
        this.#emigrate(upper, trunk);
        return _.merge(trunk, upper);
    }

    #emigrate(upper, branch) {
        for (const key in upper) {
            const k = key.toLowerCase();
            if (branch[k]) {
                if (k !== '$') {
                    this.#emigrate(upper[key], branch[k])
                } else if (branch.$._ !== upper.$._) {
                    if (upper.$['@'] < branch.$['@']) branch.$['@'] = upper.$['@']
                    upper.$._ = null;
                } else {
                    branch.$ = { '_': null, '@': null };
                }
            }
        }
    }

    deAffix = () => deAffix(this.trunk)

    flatten(trie = this.trunk) {
        const flattened = [];
        this.#traverseAndFlatten(trie, flattened, '');
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
}

export { WordTree, print };
