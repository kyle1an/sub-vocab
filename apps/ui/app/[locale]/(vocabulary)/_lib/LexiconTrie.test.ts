import { describe, expect, it } from 'vitest'

import type { Leaf, TrackedWord } from '@/app/[locale]/(vocabulary)/_lib/LexiconTrie'

import { buildTrackedWord, LEARNING_PHASE, LexiconTrie } from '@/app/[locale]/(vocabulary)/_lib/LexiconTrie'
import { createFactory } from '@sub-vocab/utils/lib'

const mockTrackedWord = createFactory<TrackedWord>()(() => ({
  isUser: false,
  rank: null,
  timeModified: null,
  learningPhase: LEARNING_PHASE.NEW,
}))

const mockLeaf = createFactory<Leaf>()(() => ({
  locators: [],
}))

describe('lexiconTrie', () => {
  it('should create and return nodes correctly with getNode', () => {
    const trie = new LexiconTrie()
    const node = trie.getOrCreateNode('test')
    expect(node).toBeDefined()
    expect(trie.root.t?.e?.s?.t).toBe(node)
  })

  it('should process input sentences and update trie structure with add', () => {
    const trie = new LexiconTrie()
    trie.add('This is a test sentence.')
    expect(trie.sentences.length).toBe(1)
    expect(trie.root.t?.h?.i?.s).toBeDefined()
  })

  it('should update trie structure with word information with update', () => {
    const trie = new LexiconTrie()
    trie.update('test', 0, 0)
    expect(trie.root.t?.e?.s?.t?.$).toBeDefined()
    expect(trie.root.t?.e?.s?.t?.$?.pathe).toBe('test')
  })

  it('should merge derived words into their stems with mergeDerivedWordIntoStem', () => {
    const trie = new LexiconTrie()
    trie.update('run', 0, 0)
    trie.update('running', 0, 0)
    trie.mergeDerivedWordIntoStem([['run', 'running']])
    expect(trie.root.r?.u?.n?.$?.inflectedForms?.[0]?.pathe).toBe('running')
  })

  it('should merge vocabulary states into the trie with mergedVocabulary', () => {
    const trie = new LexiconTrie()
    const trackedWords: TrackedWord[] = [
      buildTrackedWord({
        form: 'Test',
        isBaseForm: true,
      }),
      buildTrackedWord({
        form: 'testing',
      }),
      buildTrackedWord({
        form: 'tests',
      }),
      buildTrackedWord({
        form: 'tested',
      }),
    ]
    trie.mergedVocabulary(trackedWords)
    expect(trie.root.t?.e?.s?.t?.$?.trackedWord).toStrictEqual(expect.objectContaining(mockTrackedWord({
      form: 'Test',
    })))
    expect(trie.root.t?.e?.s?.t?.$?.inflectedForms).toStrictEqual(
      expect.arrayContaining([
        expect.objectContaining(mockLeaf({
          pathe: 'testing',
        })),
        expect.objectContaining(mockLeaf({
          pathe: 'tests',
        })),
        expect.objectContaining(mockLeaf({
          pathe: 'tested',
        })),
      ]),
    )
  })
})
