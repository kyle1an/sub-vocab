import { useIrregularMapsQuery, userVocabWithBaseVocabAtom } from '@/api/vocab-api'
import { VocabDataTable } from '@/components/VocabData'
import { LabeledTire } from '@/lib/LabeledTire'
import { formVocab, type LabelDisplayTable } from '@/lib/vocab'
import { statusRetainedList } from '@/lib/vocab-utils'

export function VocabularyPage() {
  const [userWords] = useAtom(userVocabWithBaseVocabAtom)

  const [rows, setRows] = useState<LabelDisplayTable[]>([])
  const { data: irregulars = [] } = useIrregularMapsQuery()

  useEffect(() => {
    const trie = new LabeledTire()
    for (const word of userWords) {
      trie.update(word.word, -1, -1)
    }
    trie.mergedVocabulary(userWords)
    trie.mergeDerivedWordIntoStem(irregulars)
    const list = trie.getVocabulary().filter((v) => !v.variant).map(formVocab)
    setRows((r) => statusRetainedList(r, list))
  }, [irregulars, userWords])

  function handlePurge() {
    setRows(produce ((draft) => {
      draft.forEach((todo) => {
        todo.inertialPhase = todo.vocab.learningPhase
      })
    }))
  }

  return (
    <div className="h-full pb-7">
      <div className="flex h-14">
        <div className="flex-auto grow" />
      </div>
      <SquircleBg className="m-auto flex h-[calc(100vh-4px*36)] max-w-full items-center justify-center overflow-hidden rounded-xl border-[length:--l-w] sq-outline-[--l-w] sq-stroke-border [--l-w:1px] [--sq-r:9px] md:h-[calc(100%-4px*14)]">
        <SquircleMask className="flex size-full sq-radius-[calc(var(--sq-r)-var(--l-w)+0.5px)]">
          <VocabDataTable
            data={rows}
            onPurge={handlePurge}
            className="size-full md:mx-0 md:grow"
          />
        </SquircleMask>
      </SquircleBg>
    </div>
  )
}
