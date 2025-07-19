import type { Simplify, ValueOf } from 'type-fest'

export const LEARNING_PHASE = {
  NEW: 0,
  ACQUAINTED: 1,
  FADING: 2,
  RETAINING: 3,
} as const

export type LearningPhase = ValueOf<typeof LEARNING_PHASE>

interface WordEntry {
  word: string
  original: boolean
  rank: number | null
}

export interface WordState extends WordEntry {
  learningPhase: LearningPhase
  isUser: boolean
  timeModified: string | null
}

type Char = `'` | '’' | '-' | 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z'

type NodeOf<T> = Simplify<{
  [K in Char]?: K extends Char ? NodeOf<T> : never
} & {
  $?: T
}>

export type Sentence = {
  text: string
  index: number
}

export type WordLocator = {
  sentenceId: number
  startOffset: number
  wordLength: number
  wordOrder: number
}

export interface TrieWordLabel {
  path: string
  src: WordLocator[]
  vocab?: WordState
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

const UPPERCASE_LETTER_REGEX = /[A-ZÀ-Þ]/
const hasUppercaseLetter = UPPERCASE_LETTER_REGEX.test.bind(UPPERCASE_LETTER_REGEX)
const VOWELS = ['a', 'e', 'i', 'o', 'u']
const isVowel = VOWELS.includes.bind(VOWELS)

const SENTENCE_REGEX = /["'“‘[@A-Za-zÀ-ÿ](?:[^<>{};.?!]*(?:<[^>]*>|\{[^}]*\})*[ \n]?(?:[-.](?=[A-Za-zÀ-ÿ])|\.{3} *)*["'”’\]@A-Za-zÀ-ÿ])+[^<>(){} \n]*/g
const WORD_REGEX = /(?:[A-Za-zÀ-ÿ]['’-]?)*[A-Za-zÀ-ÿ][a-zß-ÿ]*(?:['’-]?[A-Za-zÀ-ÿ]['’]?)+/g

export class LabeledTire {
  root: NodeOf<TrieWordLabel> = {}
  private sequence = 0
  sentences: Sentence[] = []
  private vocabulary = new Set<TrieWordLabel>()

  getNode(word: string) {
    let node = this.root
    for (const c of word.split('')) {
      node = node[c as Char] ??= {}
    }
    return node
  }

  private createBasePath(sieve: WordState) {
    const sieveWord = sieve.word
    const node = this.getNode(sieveWord.toLowerCase())

    if (!node.$) {
      node.$ = {
        path: sieveWord,
        src: [],
        vocab: sieve,
      }
    }
    else {
      if (node.$.vocab) {
        node.$.vocab.learningPhase = sieve.learningPhase
        node.$.vocab.timeModified = sieve.timeModified
        node.$.vocab.isUser = sieve.isUser
        node.$.vocab.rank = sieve.rank
      }
      else {
        node.$.vocab = sieve
      }
      if (hasUppercaseLetter(node.$.path)) {
        if (hasUppercaseLetter(sieveWord)) {
          if (node.$.vocab.rank) {
            if (sieve.rank && sieve.rank < node.$.vocab.rank) {
              node.$.vocab = sieve
            }
          }
          else if (sieve.rank) {
            node.$.vocab = sieve
          }
        }
        else {
          node.$.path = sieveWord
          node.$.vocab = sieve
        }
      }
    }
  }

  mergeDerivedWordIntoStem(irregularMaps: string[][]) {
    for (const irregulars of irregularMaps) {
      const [lemma, ...inflections] = irregulars
      if (lemma) {
        const stemNode = this.getNode(lemma.toLowerCase())

        stemNode.$ ??= {
          path: lemma,
          src: [],
          vocab: {
            word: lemma,
            learningPhase: LEARNING_PHASE.NEW,
            isUser: false,
            original: true,
            rank: null,
            timeModified: null,
          },
        }
        for (const irregular of inflections) {
          const deriveNode = this.getNode(irregular.toLowerCase())
          deriveNode.$ ??= {
            path: irregular,
            src: [],
            vocab: {
              word: lemma,
              learningPhase: LEARNING_PHASE.NEW,
              isUser: false,
              original: false,
              rank: null,
              timeModified: null,
            },
          }
          if (
            !deriveNode.$.variant
          ) {
            this.mergeTo(stemNode.$, deriveNode.$)
          }
        }
      }
    }
  }

  add(input: string) {
    this.sentences = []
    for (let sentenceMatch = SENTENCE_REGEX.exec(input); sentenceMatch !== null; sentenceMatch = SENTENCE_REGEX.exec(input)) {
      const sentenceText = sentenceMatch[0]
      const sentenceIndex = this.sentences.length
      this.sentences.push({
        text: sentenceText,
        index: sentenceMatch.index,
      })
      for (let wordMatch = WORD_REGEX.exec(sentenceText); wordMatch !== null; wordMatch = WORD_REGEX.exec(sentenceText)) {
        this.update(wordMatch[0], wordMatch.index, sentenceIndex)
      }
      WORD_REGEX.lastIndex = 0
    }
    SENTENCE_REGEX.lastIndex = 0
  }

  update(original: string, index: number, sentenceId: number) {
    const branch = this.getNode(original.toLowerCase())

    if (!branch.$) {
      branch.$ = {
        path: original,
        src: [{
          sentenceId,
          startOffset: index,
          wordLength: original.length,
          wordOrder: ++this.sequence,
        }],
      }
    }
    else {
      branch.$.src.push(
        {
          sentenceId,
          startOffset: index,
          wordLength: original.length,
          wordOrder: branch.$.src.length ? this.sequence : ++this.sequence,
        },
      )

      if (hasUppercaseLetter(branch.$.path) && !branch.$.vocab) {
        if (hasUppercaseLetter(original)) {
          branch.$.path = caseOr(branch.$.path, original)
        }
        else {
          branch.$.path = original
        }
      }
    }
  }

  mergedVocabulary(baseVocab: WordState[]) {
    for (const sieve of baseVocab) {
      this.createBasePath(sieve)
    }
    this.mergeRecursive(this.root)
  }

  private mergeRecursive(layer: NodeOf<TrieWordLabel>) {
    let key: keyof typeof layer
    for (key in layer) {
      if (key === '$') {
        continue
      }
      const innerLayer = layer[key]!
      // deep first traverse eg: beings(being) vs bee
      this.mergeRecursive(innerLayer)
      this.mergeVocabOfDifferentSuffixes(innerLayer, key, layer)
    }
  }

  private mergeVocabOfDifferentSuffixes(curr: NodeOf<TrieWordLabel>, previousChar: Char, parentLayer: NodeOf<TrieWordLabel>) {
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
      this.batchMergeTo(_ing$, [
        _in?.[`'`]?.$,
        _in?.[`’`]?.$,
      ])
    }

    if (_$) {
      this.batchMergeTo(_e$ || _$, labelOfSuffixes(curr))
      const _est$ = curr.e?.s?.t?.$
      const toBeMerged = [
        _s$,
        _est$ ? curr.e?.r?.$ : undefined,
        _est$,
        curr.l?.y?.$,
        curr.l?.e?.s?.s?.$,
        curr.n?.e?.s?.s?.$,
      ]

      if (previousChar === 'e') {
        toBeMerged.push(
          parentLayer.d?.e?.n?.$,
        )
        const _r$ = curr.r?.$
        const _st$ = curr.s?.t?.$
        if (_r$ && _st$) {
          toBeMerged.push(
            _r$,
            _st$,
          )
        }
      }
      else if (isTheLastCharConsonant) {
        const wordEndsWithVowelAndConsonant = isVowel(_$.path.slice(-2, -1))
        if (wordEndsWithVowelAndConsonant) {
          const __est$ = curr[previousChar]?.e?.s?.t?.$
          toBeMerged.push(
            curr[previousChar]?.i?.n?.g?.$,
            curr[previousChar]?.i?.n?.[`'`]?.$,
            curr[previousChar]?.i?.n?.[`’`]?.$,
            curr[previousChar]?.e?.d?.$,
            __est$ ? curr[previousChar]?.e?.r?.$ : undefined,
            __est$,
          )
        }
        else {
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
      this.batchMergeTo(_$, toBeMerged)
      if (curr[`'`]) {
        this.batchMergeTo(_$, getApostropheSuffixes(curr[`'`]))
      }

      if (curr[`’`]) {
        this.batchMergeTo(_$, getApostropheSuffixes(curr[`’`]))
      }
    }
    else if (_e$) {
      this.batchMergeTo(_e$, labelOfSuffixes(curr))
    }
    else if (_s$) {
      const $ = {
        path: _s$.path.slice(0, -1),
        src: [],
        derive: [],
      } satisfies TrieWordLabel
      this.batchMergeTo($, labelOfSuffixes(curr))

      if (curr[`'`]) {
        this.batchMergeTo($, getApostropheSuffixes(curr[`'`]))
      }
      if (curr[`’`]) {
        this.batchMergeTo($, getApostropheSuffixes(curr[`’`]))
      }
      if ($.derive.length) {
        this.mergeNodes($, _s$)
        curr.$ = $
      }
    }
    else if (_ying$) {
      const $ = {
        path: _ying$.path.slice(0, -3),
        src: [],
        derive: [],
      } satisfies TrieWordLabel
      this.batchMergeTo($, [
        curr.i?.e?.s?.$,
        curr.i?.e?.d?.$,
      ])

      if ($.derive.length) {
        this.mergeNodes($, _ying$)
        curr.y ??= {}
        curr.y.$ = $
      }
    }
  }

  private batchMergeTo($: TrieWordLabel, next_$$: Array<TrieWordLabel | undefined>) {
    for (const next_$ of next_$$) {
      if (next_$) {
        this.mergeNodes($, next_$)
      }
    }
  }

  private mergeNodes(targetWord: TrieWordLabel, latterWord: TrieWordLabel) {
    if (
      latterWord.vocab?.original
      || latterWord.variant
    ) {
      return
    }
    this.mergeTo(targetWord, latterWord)
  }

  private mergeTo(targetWord: TrieWordLabel, latterWord: TrieWordLabel) {
    targetWord.derive ??= []
    targetWord.derive.push(latterWord)
    latterWord.variant = true
  }

  getVocabulary() {
    const vocabulary = this.vocabulary = new Set()
    this.collectRecursive(this.root)
    this.vocabulary = new Set()
    return Array.from(vocabulary)
  }

  private collectRecursive(layer: NodeOf<TrieWordLabel>) {
    let key: keyof typeof layer
    for (key in layer) {
      if (key === '$') {
        if (!layer.$!.variant) {
          this.vocabulary.add(layer.$!)
        }
      }
      else {
        this.collectRecursive(layer[key]!)
      }
    }
  }
}
