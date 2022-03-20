import { print, stringify, } from '../utils/utils.js';
import { deAffix, resetSuffix } from '../utils/ignoreSuffix.js';
import _ from 'lodash/fp.js';

class WordTree {
    trunk = Object.create(null);
    #tUPPER = {};
    #i = 1;

    constructor(words) {
        if (words) this.add(words)
    }

    add = (neW) => {
        if (Array.isArray(neW)) {
            neW.reduce((col, word) => this.#insert(word, col), this.trunk);
        } else {
            for (const m of neW.matchAll(/((?:[A-Za-z]['-]?)*(?:[A-Z]+[a-z]*)+(?:-?[A-Za-z]'?)+)|[a-z]+(?:-?[a-z]'?)+/mg)) {
                if (m[1]) {
                    this.#insert(m[1].toLowerCase(), this.trunk, 1)
                    this.#insert(m[1], this.#tUPPER, 0)
                } else {
                    this.#insert(m[0], this.trunk, 1)
                }
            }
        }
        return this;
    };

    #insert = (word, collection, j) => {
        let branch = collection;
        for (let i = 0; i < word.length; i++) {
            const c = word.charAt(i);
            branch = branch[c] ??= {}
        }
        if (branch.$) {
            branch.$._ += 1
        } else {
            branch.$ = { '_': 1, '~': word.length, '@': this.#i += j }
        }
        return collection;
    }

    formList(words, sieve) {
        const vocab = _.cloneDeep(words.trunk);
        sieve && this.mark(sieve, vocab)
        const target = [];
        const common = [];
        const origin = this.flatten(this.trans(_.cloneDeep(this.#tUPPER), vocab)).sort((a, b) => a.info[2] - b.info[2]);
        origin.forEach((v) => {
            if (v.info[3]) {
                common.push(v)
            } else if (v.info[1] > 2) {
                target.push(v)
            }
        })
        return [origin, target, common,];
    }

    // pseudo filter
    mark = (sieve, root = this.trunk) => {
        (Array.isArray(sieve) ? sieve : sieve.toLowerCase().match(/[a-z]+(?:['-]?[a-z]'?)+/gm) || []).forEach(([...word]) => {
            let branch = root
            const l = word.pop();
            if (word.every((c) => branch[c] && (branch = branch[c]))) resetSuffix(branch, l)
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
                    upper.$ = false;
                } else {
                    upper.$ = branch.$;
                    branch.$ = false;
                }
            }
        }
    }

    deAffix = () => deAffix(this.trunk)

    flatten(trie = this.trunk) {
        const origin = [];
        traverseAndFlatten(trie, '');

        function traverseAndFlatten(node, concatKey) {
            for (const k in node) {
                if (k !== '$') {
                    traverseAndFlatten(node[k], concatKey + k);
                } else if (node.$._) {
                    origin.push({ vocab: concatKey, info: [node.$._, node.$['~'], node.$['@'], ...(node.$.F ? [node.$.F] : [])] })
                }
            }
        }

        return origin;
    }
}

export { WordTree, print };
