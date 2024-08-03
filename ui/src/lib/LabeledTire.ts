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
  derive?: TrieWordLabel[]
  variant?: boolean
  wFamily?: string[]
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
  vocabulary: Array<TrieWordLabel | null> = []

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
        node.$.vocab.rank = sieve.rank
        node.$.wFamily = [node.$.vocab.word, sieve.word]
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
        const derive = this.getNode(irregular).$
        if (
          derive
          && derive.src.length
          && !derive.variant
        ) {
          this.#mergeTo(stemNode.$, derive)
        }
      }
    }
  }

  add(input: string) {
    const sentencesMatched = input.match(/["'@A-Za-zÀ-ÿ](?:[^<>{};.?!]*(?:<[^>]*>|\{[^}]*\})*[ \n\r]?(?:[-.](?=[A-Za-zÀ-ÿ])|\.{3} *)*["'@A-Za-zÀ-ÿ])+[^<>(){} \r\n]*/g)
    if (sentencesMatched) {
      const previousLength = this.sentences.length
      const newLength = previousLength + sentencesMatched.length
      Array.prototype.push.apply(this.sentences, sentencesMatched)
      for (let len = previousLength; len < newLength; len++) {
        const sentence = this.sentences[len]!
        const wordsMatched = sentence.matchAll(/(?:[A-Za-zÀ-ÿ]['-]?)*[A-Za-zÀ-ÿ][a-zß-ÿ]*(?:['’-]?[A-Za-zÀ-ÿ]'?)+/g)
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
      const wordLocator = branch.$.src[0]
      if (wordLocator) {
        this.vocabulary[wordLocator.wordOrder] = branch.$
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

      if (branch.$.src.length === 1) {
        const wordLocator = branch.$.src[0]
        if (wordLocator) {
          this.vocabulary[wordLocator.wordOrder] = branch.$
        }
      }

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
    this.#traverseMerge(this.root)
  }

  #traverseMerge(layer: NodeOf<TrieWordLabel>) {
    for (const k in layer) {
      const key = k as keyof typeof layer
      if (key === '$') {
        continue
      }
      const innerLayer = layer[key]!
      // deep first traverse eg: beings(being) vs bee
      this.#traverseMerge(innerLayer)
      this.#mergeVocabOfDifferentSuffixes(innerLayer, key, layer)
    }
  }

  #mergeVocabOfDifferentSuffixes(curr: NodeOf<TrieWordLabel>, previousChar: Char, parentLayer: NodeOf<TrieWordLabel>) {
    const isPreviousCharS = previousChar === 's'
    const curr_$ = curr.$
    const curr_e$ = curr.e?.$
    const curr_s$ = isPreviousCharS ? undefined : curr.s?.$
    const isTheLastCharConsonant = !isVowel(previousChar)
    const curr_in = curr.i?.n
    const curr_ing = curr_in?.g
    const curr_ing$ = curr_ing?.$
    const curr_ying$ = isTheLastCharConsonant ? curr.y?.i?.n?.g?.$ : undefined

    function labelOfSuffixes(node: NodeOf<TrieWordLabel>) {
      const labels = [
        node.e?.s?.$,
        node.e?.s?.[`'`]?.$,
        node.e?.d?.$,
      ]

      if (curr_in) {
        labels.push(
          curr_in[`'`]?.$,
          curr_in[`’`]?.$,
        )
        if (curr_ing) {
          labels.push(
            curr_ing$,
            curr_ing.s?.$,
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

    if (curr_ing$) {
      this.#batchMergeTo(curr_ing$, [
        curr_in?.[`'`]?.$,
        curr_in?.[`’`]?.$,
      ])
    }

    if (curr_$) {
      this.#batchMergeTo(curr_e$ || curr_$, labelOfSuffixes(curr))
      const toBeMerged = [
        curr_s$,
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
        const wordEndsWithVowelAndConsonant = isVowel(curr_$.path.slice(-2, -1))
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
      this.#batchMergeTo(curr_$, toBeMerged)
      if (curr[`'`]) {
        this.#batchMergeTo(curr_$, getApostropheSuffixes(curr[`'`]))
      }
      if (curr[`’`]) {
        this.#batchMergeTo(curr_$, getApostropheSuffixes(curr[`’`]))
      }
    } else if (curr_e$) {
      this.#batchMergeTo(curr_e$, labelOfSuffixes(curr))
    } else if (curr_s$) {
      const original = curr_s$.path.slice(0, -1)
      const $ = {
        path: curr_s$.path.slice(0, -1),
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
        this.#mergeNodes($, curr_s$)
        curr.$ = $
        this.vocabulary.push($)
      }
    } else if (curr_ying$) {
      const original = curr_ying$.path.slice(0, -3)
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
        this.#mergeNodes($, curr_ying$)
        if (!curr.y) {
          curr.y = {}
        }
        curr.y.$ = $
        this.vocabulary.push($)
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

      if (!targetWord.src.length) {
        const wordLocator = latterWord.src[0]
        if (wordLocator) {
          this.vocabulary[wordLocator.wordOrder] = targetWord
        }
      }
    }

    targetWord.derive.push(latterWord)
    latterWord.variant = true
  }
}
