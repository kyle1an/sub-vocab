import { print, stringify, } from './utils';
import { deAffix, resetSuffix } from './ignoreSuffix';

class WordTree {
    trunk = {};
    tUpper = {};
    #i = 1;

    constructor(words) {
        if (words) this.add(words)
    }

    add = (neW) => {
        if (Array.isArray(neW)) {
            neW.reduce((col, word) => this.#insert(word, col), this.trunk);
        } else for (const m of neW.matchAll(/((?:[A-Za-z]['-]?)*(?:[A-Z]+[a-z]*)+(?:-?[A-Za-z]'?)+)|[a-z]+(?:-?[a-z]'?)+/mg)) {
            if (m[1]) {
                this.#insert(m[1].toLowerCase(), this.trunk);
                (this.tUpper[m[1]] ??= { '_': 0, '~': m[1].length, '@': this.#i })._ += 1
            } else {
                this.#insert(m[0], this.trunk)
            }
        }
        return this;
    };

    #insert = ([...word], collection) => {
        let branch = collection;
        for (const c of word) branch = branch[c] ??= {};
        (branch.$ ??= { '_': 0, '~': word.length, '@': ++this.#i })._ += 1
        return collection;
    }

    deAffix = () => deAffix(this.trunk)

    formList(words, sieve) {
        sieve && this.mark(sieve, words.trunk)
        const target = [];
        const common = [];
        const origin = this.flatten(this.trans(this.tUpper, words.trunk)).sort((a, b) => a.info[2] - b.info[2]);
        for (const v of origin) ((!v.info[3] && v.info[1] > 2) ? target : common).push(v)
        return [origin, target, common];
    }

    // pseudo filter
    mark = (sieve, root = this.trunk) => {
        for (const [...word] of (Array.isArray(sieve) ? sieve : sieve.toLowerCase().match(/[a-z]+(?:['-]?[a-z]'?)+/gm) || [])) {
            let branch = root
            const l = word.pop();
            if (word.every((c) => branch = branch[c])) resetSuffix(branch, l)
        }
    }

    trans(upper, trunk = this.trunk) {
        for (const key in upper) {
            let branch = trunk
            const [...k] = key.toLowerCase();
            for (const c of k) branch = branch[c]
            if (branch.$._ !== upper[key]._) {
                if (upper[key]['@'] < branch.$['@']) branch.$['@'] = upper[key]['@']
                upper[key] = false;
            } else {
                upper[key] = branch.$;
                branch.$ = false;
            }
        }
        return this.combine(trunk, upper);
    }

    combine(trunk, upper) {
        for (const key in upper) {
            let branch = trunk;
            for (const c of [...key]) branch = branch[c] ??= {}
            branch.$ = upper[key]
        }
        return trunk;
    }

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
