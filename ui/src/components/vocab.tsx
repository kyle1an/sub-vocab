import { ToastAction } from '@radix-ui/react-toast'
import { Link } from 'react-router-dom'
import { Button } from './ui/button'
import type { Toast } from './ui/use-toast'
import { sortByChar } from '@/lib/utils.ts'
import LabeledTire, {
  LEARNING_PHASE, type LearningPhase, type TrieWordLabel, type VocabState, type WordLocator,
} from '@/lib/LabeledTire.ts'

export interface LabelDisplayTable extends VocabState {
  inertialPhase: LearningPhase
  wFamily: string[]
}

export interface LabelDisplaySource extends VocabState {
  inertialPhase: LearningPhase
  wFamily: string[]
  locations: WordLocator[]
}

function formVocab($: TrieWordLabel) {
  let src = [...$.src]
  const wFamily = $.wFamily ?? [$.path]

  if ($.derive?.length) {
    ;(function collectNestedSource(derives: TrieWordLabel[]) {
      for (const d$ of derives) {
        if (d$.src.length) {
          wFamily.push(d$.path)
          if (src.length) {
            src = d$.src[0].wordOrder < src[0].wordOrder ? d$.src.concat(src) : src.concat(d$.src)
          } else {
            src = d$.src
          }
        }

        if (d$.derive?.length) {
          collectNestedSource(d$.derive)
        }
      }
    }($.derive))
  }

  const vocab: VocabState = {
    word: $.path,
    learningPhase: LEARNING_PHASE.NEW,
    isUser: false,
    original: false,
    timeModified: null,
    rank: null,
    ...$.vocab,
  }

  const labelDisplaySource: Omit<LabelDisplaySource, 'inertialPhase'> = {
    ...vocab,
    wFamily,
    locations: src,
  }

  return labelDisplaySource
}

export function logVocabInfo<T extends VocabState>(listOfVocab: T[]) {
  const untouchedVocabList = [...listOfVocab].sort((a, b) => sortByChar(a.word, b.word))
  console.log(`(${untouchedVocabList.length}) words`, { _: untouchedVocabList })
}

export const generatedVocabTrie = (inputText: string, baseVocab: VocabState[], irregularMaps: string[][]) => {
  const trie = new LabeledTire()
  trie.add(inputText)
  trie.mergedVocabulary(baseVocab)
    .mergeDerivedWordIntoStem(irregularMaps)
  const list = trie.vocabulary.filter(Boolean).filter((v) => !v.variant).map(formVocab)
  if (import.meta.env.VITE_SUB_ENV === 'dev') {
    logVocabInfo(list)
    console.log('trie', trie)
  }
  return {
    list,
    count: trie.wordCount,
    sentences: trie.sentences,
  }
}

export const loginToast = () => ({
  title: 'Login required',
  description: 'Please log in to mark words as learned.',
  action: (
    <ToastAction altText="Sign in">
      <Link
        to="/login"
      >
        <Button
          variant="outline"
          className="whitespace-nowrap"
        >
          Sign in
        </Button>
      </Link>
    </ToastAction>
  ),
} as const satisfies Toast)
