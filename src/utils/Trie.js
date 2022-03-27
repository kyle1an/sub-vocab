import { print, stringify, } from './utils';
// import { deAffix, resetSuffix } from './ignoreSuffix';

class WordTree {
    trunk = {};
    list = [];

    constructor(words) {
        if (words) this.add(words)
    }

    add = (neW) => {
        for (const [...word] of Array.isArray(neW) ? neW : neW.match(/[A-Za-z]+(?:['-]?[A-Za-z]'?)+/mg)) {
            let branch = this.trunk
            for (const c of word)
                branch = branch[c] ??= {};
            branch.$ ??= true
        }
    };

    deAffix = () => deAffix(this.trunk)

    formList = (sieve) => {
        if (sieve) for (const [...word] of (Array.isArray(sieve) ? sieve : sieve.toLowerCase().match(/[a-z]+(?:['-]?[a-z]'?)+/gm) || [])) {
            let branch = this.trunk
            const l = word.pop();
            if (word.every((c) => branch = branch[c])) resetSuffix(branch, l)
        }
        const target = [];
        const common = [];
        this.#traverseAndFlatten(this.trunk, '');
        for (const v of this.list.sort((a, b) => a.info[2] - b.info[2])) ((!v.info[3] && v.info[1] > 2) ? target : common).push(v)
        return [this.list, target, common];
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
