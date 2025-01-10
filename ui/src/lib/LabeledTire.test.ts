import type { VocabState } from './LabeledTire'

import { LabeledTire, LEARNING_PHASE } from './LabeledTire'

describe('labeledTire', () => {
  it('should create and return nodes correctly with getNode', () => {
    const tire = new LabeledTire()
    const node = tire.getNode('test')
    expect(node).toBeDefined()
    expect(tire.root.t?.e?.s?.t).toBe(node)
  })

  it('should process input sentences and update trie structure with add', () => {
    const tire = new LabeledTire()
    tire.add('This is a test sentence.')
    expect(tire.sentences.length).toBe(1)
    expect(tire.root.t?.h?.i?.s).toBeDefined()
  })

  it('should update trie structure with word information with update', () => {
    const tire = new LabeledTire()
    tire.update('test', 0, 0)
    expect(tire.root.t?.e?.s?.t?.$).toBeDefined()
    expect(tire.root.t?.e?.s?.t?.$?.path).toBe('test')
  })

  it('should merge derived words into their stems with mergeDerivedWordIntoStem', () => {
    const tire = new LabeledTire()
    tire.update('run', 0, 0)
    tire.update('running', 0, 0)
    tire.mergeDerivedWordIntoStem([['run', 'running']])
    expect(tire.root.r?.u?.n?.$?.derive?.[0]?.path).toBe('running')
  })

  it('should merge vocabulary states into the trie with mergedVocabulary', () => {
    const tire = new LabeledTire()
    const vocab: VocabState[] = [
      {
        word: 'Test',
        learningPhase: LEARNING_PHASE.NEW,
        isUser: false,
        original: true,
        rank: null,
        timeModified: null,
      },
      {
        word: 'testing',
        learningPhase: LEARNING_PHASE.NEW,
        isUser: false,
        original: false,
        rank: null,
        timeModified: null,
      },
      {
        word: 'tests',
        learningPhase: LEARNING_PHASE.NEW,
        isUser: false,
        original: false,
        rank: null,
        timeModified: null,
      },
      {
        word: 'tested',
        learningPhase: LEARNING_PHASE.NEW,
        isUser: false,
        original: false,
        rank: null,
        timeModified: null,
      },
    ]
    tire.mergedVocabulary(vocab)
    expect(tire.root.t?.e?.s?.t?.$?.vocab?.word).toBe('Test')
    expect(tire.root.t?.e?.s?.t?.$?.derive).toStrictEqual(expect.arrayContaining([
      expect.objectContaining({ path: 'testing' }),
      expect.objectContaining({ path: 'tests' }),
      expect.objectContaining({ path: 'tested' }),
    ]))
  })
})
