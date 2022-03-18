import { print, stringify, } from '../utils/utils.js';
import { deAffix, resetSuffix } from '../utils/ignoreSuffix.js';
import _ from 'lodash/fp.js';

class WordTree {
    trunk = Object.create(null);
    #tUPPER = {};
    #i = 1;

    constructor(words) {
        this.add(words)
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
        branch.$ = branch.$ ? { ...branch.$, '_': branch.$._ + 1 } : { '_': 1, '~': word.length, '@': this.#i += j }
        return collection;
    }

    formList(words, sieve) {
        const vocab = _.cloneDeep(words.trunk);
        if (sieve) {
            this.flt(sieve, vocab)
            const [target, common] = this.segregate(this.trans(_.cloneDeep(this.#tUPPER), vocab));
            return [target.sort((a, b) => a.info[2] - b.info[2]), common.sort((a, b) => a.info[2] - b.info[2])];
        } else {
            return this.flatten(this.trans(_.cloneDeep(this.#tUPPER), vocab)).sort((a, b) => a.info[2] - b.info[2]);
        }
    }

    // pseudo filter
    flt = (sieve, vocab) => this.#alterRay(Array.isArray(sieve) ? sieve : sieve.match(/[A-Za-z]+(?:['-]?[A-Za-z]'?)+/mg) || [], vocab);

    #alterRay(sieve, impurities = this.trunk) {
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
        const target = [];
        traverseAndFlatten(trie, '');

        function traverseAndFlatten(node, concatKey) {
            for (const k in node) {
                if (k === '$') {
                    if (concatKey.length > 2 && node.$._) target.push({ vocab: concatKey, info: [node.$._, node.$['~'], node.$['@']] })
                } else traverseAndFlatten(node[k], concatKey + k);
            }
        }

        return target;
    }

    segregate(trie = this.trunk) {
        const target = [];
        const common = [];
        traverseAndFlatten(trie, '');

        function traverseAndFlatten(node, concatKey) {
            for (const k in node) {
                if (k === '$') {
                    if (node.$.F) {
                        common.push({ vocab: concatKey, info: [node.$._, node.$['~'], node.$['@']] })
                    } else if (concatKey.length > 2 && node.$._) {
                        target.push({ vocab: concatKey, info: [node.$._, node.$['~'], node.$['@']] })
                    }
                } else traverseAndFlatten(node[k], concatKey + k);
            }
        }

        return [target, common];
    }
}

export { WordTree, print };
