import { print, stringify, } from './utils';
import { deAffix, resetSuffix } from './ignoreSuffix';

class WordTree {
    trunk = {};
    #tUpper = {};
    #i = 1;
    list = [];

    constructor(words) {
        if (words) this.add(words)
    }

    add = (neW) => {
        if (Array.isArray(neW)) {
            neW.reduce((col, word) => this.#insert(word, col), this.trunk);
        } else for (const m of neW.matchAll(/((?:[A-Za-z]['-]?)*(?:[A-Z]+[a-z]*)+(?:-?[A-Za-z]'?)+)|[a-z]+(?:-?[a-z]'?)+/mg)) {
            if (m[1]) {
                this.#insert(m[1].toLowerCase(), this.trunk);
                (this.#tUpper[m[1]] ??= { '_': 0, '~': m[1].length, '@': this.#i })._ += 1
            } else {
                this.#insert(m[0], this.trunk)
            }
        }
        return this;
    };

    #insert([...word], branch) {
        for (const c of word) branch = branch[c] ??= {};
        (branch.$ ??= { '_': 0, '~': word.length, '@': ++this.#i })._ += 1
    }

    deAffix = () => deAffix(this.trunk)

    formList = (sieve) => {
        if (sieve) for (const [...word] of (Array.isArray(sieve) ? sieve : sieve.toLowerCase().match(/[a-z]+(?:['-]?[a-z]'?)+/gm) || [])) {
            let branch = this.trunk
            const l = word.pop();
            if (word.every((c) => branch = branch[c])) resetSuffix(branch, l)
        }
        const target = [];
        const common = [];
        this.#trans();
        for (const v of this.list.sort((a, b) => a.info[2] - b.info[2])) ((!v.info[3] && v.info[1] > 2) ? target : common).push(v)
        return [this.list, target, common];
    }

    #trans(upper = this.#tUpper, trunk = this.trunk) {
        for (const key in upper) {
            let branch = trunk;
            for (const c of [...key.toLowerCase()]) branch = branch[c]
            if (branch.$._ !== upper[key]._) {
                if (upper[key]['@'] < branch.$['@']) branch.$['@'] = upper[key]['@']
                upper[key] = false;
            } else {
                this.list.push({ vocab: key, info: this.#info(branch) })
                branch.$ = false;
            }
        }
        this.#traverseAndFlatten(this.trunk, '');
    }

    #traverseAndFlatten(node, concatKey) {
        for (const k in node) {
            if (k !== '$') {
                this.#traverseAndFlatten(node[k], concatKey + k);
            } else if (node.$._) {
                this.list.push({ vocab: concatKey, info: this.#info(node) })
            }
        }
    }

    #info = (n) => [n.$._, n.$['~'], n.$['@'], ...(n.$.F ? [true] : [])]
}

export { WordTree, print };
