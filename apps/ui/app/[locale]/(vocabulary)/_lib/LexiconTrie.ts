import type { NonEmptyArray } from 'effect/Array'
import type { ValueOf } from 'type-fest'

import { formVocab } from '@/app/[locale]/(vocabulary)/_lib/vocab'
import { createFactory } from '@sub-vocab/utils/lib'

export const LEARNING_PHASE = {
  NEW: 0,
  ACQUAINTED: 1,
  FADING: 2,
  RETAINING: 3,
} as const

export type LearningPhase = ValueOf<typeof LEARNING_PHASE>

export interface TrackedWord {
  form: string
  isBaseForm: boolean
  rank: number | null
  // ^ entry v state
  learningPhase: LearningPhase
  isUser: boolean
  timeModified: string | null
}

export const buildTrackedWord = createFactory<TrackedWord>()(() => ({
  isUser: false,
  isBaseForm: false,
  rank: null,
  timeModified: null,
  learningPhase: LEARNING_PHASE.NEW,
}))

type Char = `'` | '’' | '-' | 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z'

type LexiconNode<T = Leaf> = {
  [K in Char]?: K extends Char ? LexiconNode<T> : never
} & {
  $?: T
}

export interface Sentence {
  text: string
  index: number
}

export interface WordLocator {
  sentenceId: number
  startOffset: number
  wordLength: number
}

export interface Leaf {
  pathe: string
  locators: WordLocator[]
  trackedWord?: TrackedWord
  inflectedForms?: Leaf[]
  isInflectedForm?: true
}

const buildLeaf = createFactory<Leaf>()(() => ({
  locators: [],
  inflectedForms: [],
}))

const caseOr = (a: string, b: string) => {
  const r: number[] = []
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

const getInflectedForms = (node: LexiconNode) => [
  node.e?.s?.$,
  node.e?.s?.[`'`]?.$,
  node.e?.s?.[`’`]?.$,
  node.e?.d?.$,
  node.i?.n?.[`'`]?.$,
  node.i?.n?.[`’`]?.$,
  node.i?.n?.g?.$,
  node.i?.n?.g?.s?.$,
]
const getApostropheInflectedForms = (apostropheNode?: LexiconNode) => [
  apostropheNode?.d?.$,
  apostropheNode?.l?.l?.$,
  apostropheNode?.r?.e?.$,
  apostropheNode?.s?.$,
  apostropheNode?.v?.e?.$,
]

class Trie {
  public readonly root: LexiconNode = {}
  public readonly sentences: Sentence[] = []
  private readonly nodeMap = new Map<string, LexiconNode>()
  public getNode(path: string) {
    path = path.toLowerCase()
    let node = this.nodeMap.get(path)
    if (node) {
      return node
    }
    node = this.root
    for (const c of path.split('')) {
      node = node[c as Char] ??= {}
    }
    this.nodeMap.set(path, node)
    return node
  }
  private createBasePath(sieve: TrackedWord) {
    const sieveForm = sieve.form
    const node = this.getNode(sieveForm)
    if (!node.$) {
      node.$ = {
        pathe: sieveForm,
        locators: [],
        trackedWord: sieve,
      }
    } else {
      if (node.$.trackedWord) {
        node.$.trackedWord.learningPhase = sieve.learningPhase
        node.$.trackedWord.timeModified = sieve.timeModified
        node.$.trackedWord.isUser = sieve.isUser
        node.$.trackedWord.rank = sieve.rank
      } else {
        node.$.trackedWord = sieve
      }
      if (hasUppercaseLetter(node.$.pathe)) {
        if (!hasUppercaseLetter(sieveForm)) {
          node.$.pathe = sieveForm
          node.$.trackedWord = sieve
        } else {
          if (node.$.trackedWord.rank) {
            if (sieve.rank && sieve.rank < node.$.trackedWord.rank) {
              node.$.trackedWord = sieve
            }
          } else if (sieve.rank) {
            node.$.trackedWord = sieve
          }
        }
      }
    }
  }
  public mergeDerivedWordIntoStem(irregulars: NonEmptyArray<string>[]) {
    for (const [lemma, ...inflections] of irregulars) {
      const lemmaNode = this.getNode(lemma)
      lemmaNode.$ ??= {
        pathe: lemma,
        locators: [],
        trackedWord: buildTrackedWord({
          form: lemma,
          isBaseForm: true,
        }),
      }
      for (const inflection of inflections) {
        const inflectedNode = this.getNode(inflection)
        inflectedNode.$ ??= {
          pathe: inflection,
          locators: [],
          trackedWord: buildTrackedWord({
            form: lemma,
          }),
        }
        Trie.trySetAsInflections(
          lemmaNode.$,
          inflectedNode.$,
        )
      }
    }
  }
  public add(input: string) {
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
  public update(original: string, index: number, sentenceId: number) {
    const node = this.getNode(original)
    const locator = {
      sentenceId,
      startOffset: index,
      wordLength: original.length,
    }
    if (!node.$) {
      node.$ = {
        pathe: original,
        locators: [locator],
      }
    } else {
      node.$.locators.push(locator)
      if (hasUppercaseLetter(node.$.pathe) && !node.$.trackedWord) {
        node.$.pathe = caseOr(node.$.pathe, original)
      }
    }
  }
  public mergedVocabulary(baseVocab: TrackedWord[]) {
    for (const sieve of baseVocab) {
      this.createBasePath(sieve)
    }
    Trie.mergeRecursive(this.root)
  }
  private static mergeRecursive(node: LexiconNode) {
    for (const [key, value] of Object.entries(node)) {
      if (key !== '$') {
        // deep first traverse eg: beings(being) vs bee
        Trie.mergeRecursive(value)
        Trie.mergeVocabOfDifferentSuffixes(value, key, node)
      }
    }
  }
  private static mergeVocabOfDifferentSuffixes(node: LexiconNode, char: Char, nodeParent: LexiconNode) {
    const node_s_$ = char !== 's' ? node.s?.$ : undefined
    const isConsonantChar = !isVowel(char)
    const node_y_i_n_g_$ = isConsonantChar ? node.y?.i?.n?.g?.$ : undefined
    if (node.i?.n?.g?.$) {
      Trie.trySetAsInflections(
        node.i?.n?.g?.$,
        node.i?.n?.[`'`]?.$,
        node.i?.n?.[`’`]?.$,
      )
    }
    if (node.$) {
      Trie.trySetAsInflections(
        node.e?.$ || node.$,
        ...getInflectedForms(node),
      )
      const maybeInflectedForms = [
        node_s_$,
        node.e?.s?.t?.$ ? node.e?.r?.$ : undefined,
        node.e?.s?.t?.$,
        node.l?.y?.$,
        node.l?.e?.s?.s?.$,
        node.n?.e?.s?.s?.$,
      ]
      if (char === 'e') {
        maybeInflectedForms.push(
          nodeParent.d?.e?.n?.$,
        )
        if (node.r?.$ && node.s?.t?.$) {
          maybeInflectedForms.push(
            node.r?.$,
            node.s?.t?.$,
          )
        }
      } else if (isConsonantChar) {
        const isEndsWithVowelAndConsonant = isVowel(node.$.pathe.slice(-2, -1))
        if (isEndsWithVowelAndConsonant) {
          maybeInflectedForms.push(
            node[char]?.i?.n?.g?.$,
            node[char]?.i?.n?.[`'`]?.$,
            node[char]?.i?.n?.[`’`]?.$,
            node[char]?.e?.d?.$,
            node[char]?.e?.s?.t?.$ ? node[char]?.e?.r?.$ : undefined,
            node[char]?.e?.s?.t?.$,
          )
        } else {
          const isEndsWithConsonantAndY = char === 'y'
          if (isEndsWithConsonantAndY) {
            maybeInflectedForms.push(
              nodeParent.i?.e?.s?.$,
              nodeParent.i?.e?.s?.[`'`]?.$,
              nodeParent.i?.e?.s?.[`’`]?.$,
              nodeParent.i?.e?.d?.$,
              nodeParent.i?.e?.r?.$,
              nodeParent.i?.e?.s?.t?.$,
              nodeParent.i?.l?.y?.$,
            )
          }
        }
      }
      if (char !== 's') {
        maybeInflectedForms.push(
          node.s?.[`'`]?.$,
          node.s?.[`’`]?.$,
        )
      }
      Trie.trySetAsInflections(
        node.$,
        ...maybeInflectedForms,
        ...getApostropheInflectedForms(node[`'`]),
        ...getApostropheInflectedForms(node[`’`]),
      )
    } else if (node.e?.$) {
      Trie.trySetAsInflections(
        node.e?.$,
        ...getInflectedForms(node),
      )
    } else if (node_s_$) {
      const $ = buildLeaf({
        pathe: node_s_$.pathe.slice(0, -1),
      })
      Trie.trySetAsInflections(
        $,
        ...getInflectedForms(node),
        ...getApostropheInflectedForms(node[`'`]),
        ...getApostropheInflectedForms(node[`’`]),
      )
      if ($.inflectedForms.length >= 1) {
        Trie.trySetAsInflections(
          $,
          node_s_$,
        )
        node.$ = $
      }
    } else if (node_y_i_n_g_$) {
      const $ = buildLeaf({
        pathe: node_y_i_n_g_$.pathe.slice(0, -3),
      })
      Trie.trySetAsInflections(
        $,
        node.i?.e?.s?.$,
        node.i?.e?.d?.$,
      )
      if ($.inflectedForms.length >= 1) {
        Trie.trySetAsInflections(
          $,
          node_y_i_n_g_$,
        )
        node.y ??= {}
        node.y.$ = $
      }
    }
  }
  private static trySetAsInflections(baseForm: Leaf, ...maybeInflectedForms: Array<Leaf | undefined>) {
    for (const inflectedForm of maybeInflectedForms) {
      if (inflectedForm) {
        if (!inflectedForm.trackedWord?.isBaseForm && !inflectedForm.isInflectedForm) {
          baseForm.inflectedForms ??= []
          baseForm.inflectedForms.push(inflectedForm)
          inflectedForm.isInflectedForm = true
        }
      }
    }
  }
  private static getVocabulary(root: LexiconNode) {
    const vocabulary = new Set<Leaf>()
    const collectVocabulary = (node: LexiconNode) => {
      Object.entries(node).forEach(([key, value]) => {
        if (key !== '$') {
          collectVocabulary(value)
        } else if (!value.isInflectedForm) {
          vocabulary.add(value)
        }
      })
    }
    collectVocabulary(root)
    return Array.from(vocabulary)
  }
  public input(words: string[]) {
    words.forEach((word) => {
      this.update(word, -1, -1)
    })
  }
  public generate(irregulars: NonEmptyArray<string>[], baseVocab: TrackedWord[]) {
    this.mergeDerivedWordIntoStem(irregulars)
    this.mergedVocabulary(baseVocab)
    return Trie
      .getVocabulary(this.root)
      .map(formVocab)
  }
}

export { Trie as LexiconTrie }
