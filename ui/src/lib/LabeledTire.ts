import type { Simplify, ValueOf } from 'type-fest'

export const LEARNING_PHASE = {
  NEW: 0,
  ACQUAINTED: 1,
  FADING: 2,
  RETAINING: 3,
} as const

export type LearningPhase = ValueOf<typeof LEARNING_PHASE>

export interface VocabState {
  word: string
  learningPhase: LearningPhase
  isUser: boolean
  original: boolean
  rank: number | null
  timeModified: string | null
}

type Char = `'` | '’' | '-' | 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z'

type NodeOf<T> = Simplify<{
  [K in Char]?: K extends Char ? NodeOf<T> : never
} & {
  $?: T
}>

export type WordLocator = {
  sentenceId: number
  startOffset: number
  wordLength: number
  wordOrder: number
}

export interface TrieWordLabel extends Record<string, unknown> {
  path: string
  up: boolean
  src: WordLocator[]
  vocab?: VocabState
  // inflectionRecords
  derive?: TrieWordLabel[]
  // isInflected
  variant?: boolean
}

function caseOr(a: string, b: string) {
  const r = []

  for (let i = 0; i < a.length; i++) {
    r.push(a.charCodeAt(i) | b.charCodeAt(i))
  }

  return String.fromCharCode(...r)
}

const capitalIn = (chars: string) => /[A-ZÀ-Þ]/.test(chars)
const isVowel = (chars: string) => ['a', 'e', 'i', 'o', 'u'].includes(chars)

export class LabeledTire {
  root: NodeOf<TrieWordLabel> = {}
  #sequence = 0
  sentences: string[] = []
  wordCount = 0
  #vocabulary = new Set<TrieWordLabel>()

  getNode(word: string) {
    let node = this.root
    for (const c of word.split('')) {
      node = node[c as Char] ??= {}
    }

    return node
  }

  #withPaths(vocab: VocabState[]) {
    for (const sieve of vocab) {
      this.#createPath(sieve)
    }
  }

  #createPath(sieve: VocabState) {
    const sieveWord = sieve.word
    const hasCapital = capitalIn(sieveWord)
    const node = this.getNode(hasCapital ? sieveWord.toLowerCase() : sieveWord)

    if (!node.$) {
      node.$ = {
        path: sieveWord,
        up: hasCapital,
        src: [],
        vocab: sieve,
      }
    } else {
      if (node.$.vocab) {
        node.$.vocab.learningPhase = sieve.learningPhase
        node.$.vocab.timeModified = sieve.timeModified
        node.$.vocab.isUser = sieve.isUser
        node.$.vocab.rank = sieve.rank
      } else {
        node.$.vocab = sieve
      }
      if (node.$.up) {
        if (hasCapital) {
          if (node.$.vocab.rank) {
            if (sieve.rank && sieve.rank < node.$.vocab.rank) {
              node.$.vocab = sieve
            }
          } else if (sieve.rank) {
            node.$.vocab = sieve
          }
        } else {
          node.$.path = sieveWord
          node.$.up = false
          node.$.vocab = sieve
        }
      }
    }
  }

  mergeDerivedWordIntoStem(irregularMaps: string[][]) {
    for (const irregulars of irregularMaps) {
      const stem = irregulars[0]
      if (!stem) {
        continue
      }
      const hasCapital = capitalIn(stem)
      const stemNode = this.getNode(hasCapital ? stem.toLowerCase() : stem)

      if (!stemNode.$) {
        stemNode.$ = {
          path: stem,
          up: hasCapital,
          src: [],
          vocab: {
            word: stem,
            learningPhase: LEARNING_PHASE.NEW,
            isUser: false,
            original: true,
            rank: null,
            timeModified: null,
          },
        }
      }
      let i = irregulars.length
      while (--i) {
        const irregular = irregulars[i]
        if (!irregular) {
          continue
        }
        const hasCapital = capitalIn(irregular)
        const deriveNode = this.getNode(hasCapital ? irregular.toLowerCase() : irregular)
        if (!deriveNode.$) {
          deriveNode.$ = {
            path: irregular,
            up: hasCapital,
            src: [],
            vocab: {
              word: stem,
              learningPhase: LEARNING_PHASE.NEW,
              isUser: false,
              original: false,
              rank: null,
              timeModified: null,
            },
          }
        }
        if (
          !deriveNode.$.variant
        ) {
          this.#mergeTo(stemNode.$, deriveNode.$)
        }
      }
    }
  }

  add(input: string) {
    const sentencesMatched = input.match(/["'“‘[@A-Za-zÀ-ÿ](?:[^<>{};.?!]*(?:<[^>]*>|\{[^}]*\})*[ \n\r]?(?:[-.](?=[A-Za-zÀ-ÿ])|\.{3} *)*["'”’\]@A-Za-zÀ-ÿ])+[^<>(){} \r\n]*/g)
    if (sentencesMatched) {
      const previousLength = this.sentences.length
      const newLength = previousLength + sentencesMatched.length
      Array.prototype.push.apply(this.sentences, sentencesMatched)
      for (let len = previousLength; len < newLength; len++) {
        const sentence = this.sentences[len]!
        const wordsMatched = sentence.matchAll(/(?:[A-Za-zÀ-ÿ]['’-]?)*[A-Za-zÀ-ÿ][a-zß-ÿ]*(?:['’-]?[A-Za-zÀ-ÿ]['’]?)+/g)
        for (let n = wordsMatched.next(); !n.done; n = wordsMatched.next()) {
          const m = n.value
          const matchedWord = m[0]
          ++this.wordCount
          if (m.index !== undefined) {
            this.update(matchedWord, m.index, len)
          }
        }
      }
    }
  }

  update(original: string, index: number, sentenceId: number) {
    const hasCapital = capitalIn(original)
    const branch = this.getNode(hasCapital ? original.toLowerCase() : original)

    if (!branch.$) {
      branch.$ = {
        path: original,
        up: hasCapital,
        src: [{
          sentenceId,
          startOffset: index,
          wordLength: original.length,
          wordOrder: ++this.#sequence,
        }],
      }
    } else {
      branch.$.src.push(
        {
          sentenceId,
          startOffset: index,
          wordLength: original.length,
          wordOrder: branch.$.src.length ? this.#sequence : ++this.#sequence,
        },
      )

      if (branch.$.up && !branch.$.vocab) {
        if (hasCapital) {
          branch.$.path = caseOr(branch.$.path, original)
          branch.$.up = capitalIn(branch.$.path)
        } else {
          branch.$.path = original
          branch.$.up = false
        }
      }
    }
  }

  mergedVocabulary(baseVocab: VocabState[]) {
    this.#withPaths(baseVocab)
    this.#mergeRecursive(this.root)
  }

  #mergeRecursive(layer: NodeOf<TrieWordLabel>) {
    let key: keyof typeof layer
    for (key in layer) {
      if (key === '$') {
        continue
      }
      const innerLayer = layer[key]!
      // deep first traverse eg: beings(being) vs bee
      this.#mergeRecursive(innerLayer)
      this.#mergeVocabOfDifferentSuffixes(innerLayer, key, layer)
    }
  }

  #mergeVocabOfDifferentSuffixes(curr: NodeOf<TrieWordLabel>, previousChar: Char, parentLayer: NodeOf<TrieWordLabel>) {
    const isPreviousCharS = previousChar === 's'
    const _$ = curr.$
    const _e$ = curr.e?.$
    const _s$ = isPreviousCharS ? undefined : curr.s?.$
    const isTheLastCharConsonant = !isVowel(previousChar)
    const _in = curr.i?.n
    const _ing = _in?.g
    const _ing$ = _ing?.$
    const _ying$ = isTheLastCharConsonant ? curr.y?.i?.n?.g?.$ : undefined

    function labelOfSuffixes(node: NodeOf<TrieWordLabel>) {
      const labels = [
        node.e?.s?.$,
        node.e?.s?.[`'`]?.$,
        node.e?.d?.$,
      ]

      if (_in) {
        labels.push(
          _in[`'`]?.$,
          _in[`’`]?.$,
        )
        if (_ing) {
          labels.push(
            _ing$,
            _ing.s?.$,
          )
        }
      }

      return labels
    }

    const getApostropheSuffixes = (apostrophe: NodeOf<TrieWordLabel>) => [
      apostrophe.d?.$,
      apostrophe.l?.l?.$,
      apostrophe.r?.e?.$,
      apostrophe.s?.$,
      apostrophe.v?.e?.$,
    ]

    if (_ing$) {
      this.#batchMergeTo(_ing$, [
        _in?.[`'`]?.$,
        _in?.[`’`]?.$,
      ])
    }

    if (_$) {
      this.#batchMergeTo(_e$ || _$, labelOfSuffixes(curr))
      const toBeMerged = [
        _s$,
        curr.e?.r?.$,
        curr.e?.s?.t?.$,
        curr.l?.y?.$,
        curr.l?.e?.s?.s?.$,
        curr.n?.e?.s?.s?.$,
      ]

      if (previousChar === 'e') {
        toBeMerged.push(
          parentLayer.d?.e?.n?.$,
        )
      } else if (isTheLastCharConsonant) {
        const wordEndsWithVowelAndConsonant = isVowel(_$.path.slice(-2, -1))
        if (wordEndsWithVowelAndConsonant) {
          toBeMerged.push(
            curr[previousChar]?.i?.n?.g?.$,
            curr[previousChar]?.i?.n?.[`'`]?.$,
            curr[previousChar]?.i?.n?.[`’`]?.$,
            curr[previousChar]?.e?.d?.$,
            curr[previousChar]?.e?.r?.$,
            curr[previousChar]?.e?.s?.t?.$,
          )
        } else {
          const wordEndsWithConsonantAndConsonantY = previousChar === 'y'
          if (wordEndsWithConsonantAndConsonantY) {
            toBeMerged.push(
              parentLayer.i?.e?.s?.$,
              parentLayer.i?.e?.s?.[`'`]?.$,
              parentLayer.i?.e?.d?.$,
              parentLayer.i?.e?.r?.$,
              parentLayer.i?.e?.s?.t?.$,
              parentLayer.i?.l?.y?.$,
            )
          }
        }
      }

      if (!isPreviousCharS) {
        toBeMerged.push(
          curr.s?.[`'`]?.$,
          curr.s?.[`’`]?.$,
        )
      }
      this.#batchMergeTo(_$, toBeMerged)
      if (curr[`'`]) {
        this.#batchMergeTo(_$, getApostropheSuffixes(curr[`'`]))
      }
      if (curr[`’`]) {
        this.#batchMergeTo(_$, getApostropheSuffixes(curr[`’`]))
      }
    } else if (_e$) {
      this.#batchMergeTo(_e$, labelOfSuffixes(curr))
    } else if (_s$) {
      const original = _s$.path.slice(0, -1)
      const $ = {
        path: _s$.path.slice(0, -1),
        src: [],
        up: capitalIn(original),
        derive: [],
      } satisfies TrieWordLabel
      this.#batchMergeTo($, labelOfSuffixes(curr))

      if (curr[`'`]) {
        this.#batchMergeTo($, getApostropheSuffixes(curr[`'`]))
      }
      if (curr[`’`]) {
        this.#batchMergeTo($, getApostropheSuffixes(curr[`’`]))
      }

      if ($.derive.length) {
        this.#mergeNodes($, _s$)
        curr.$ = $
      }
    } else if (_ying$) {
      const original = _ying$.path.slice(0, -3)
      const $ = {
        path: original,
        src: [],
        up: capitalIn(original),
        derive: [],
      } satisfies TrieWordLabel
      this.#batchMergeTo($, [
        curr.i?.e?.s?.$,
        curr.i?.e?.d?.$,
      ])

      if ($.derive.length) {
        this.#mergeNodes($, _ying$)
        if (!curr.y) {
          curr.y = {}
        }
        curr.y.$ = $
      }
    }
  }

  #batchMergeTo($: TrieWordLabel, next_$$: Array<TrieWordLabel | undefined>) {
    for (const next_$ of next_$$) {
      if (next_$) {
        this.#mergeNodes($, next_$)
      }
    }
  }

  #mergeNodes(targetWord: TrieWordLabel, latterWord: TrieWordLabel) {
    if (
      latterWord.vocab?.original
      || latterWord.variant
    ) {
      return
    }

    this.#mergeTo(targetWord, latterWord)
  }

  #mergeTo(targetWord: TrieWordLabel, latterWord: TrieWordLabel) {
    if (!targetWord.derive) {
      targetWord.derive = []
    }

    targetWord.derive.push(latterWord)
    latterWord.variant = true
  }

  getVocabulary() {
    const vocabulary = this.#vocabulary = new Set()
    this.#collectRecursive(this.root)
    this.#vocabulary = new Set()
    return Array.from(vocabulary)
  }

  #collectRecursive(layer: NodeOf<TrieWordLabel>) {
    let key: keyof typeof layer
    for (key in layer) {
      if (key === '$') {
        this.#vocabulary.add(layer.$!)
      } else {
        this.#collectRecursive(layer[key]!)
      }
    }
  }
}
