import type { LabelVocab } from '@/types'

export function Examples({
  sentences,
  src = [],
}: {
  sentences: string[],
  src: LabelVocab['src'],
}) {
  const vocabPositions: [number, [number, number][]][] = []
  src.sort((a, b) => a.sentenceId - b.sentenceId || a.startIndex - b.startIndex)

  for (const { sentenceId, startIndex, wordLength } of src) {
    if (vocabPositions.length === 0) {
      vocabPositions.push([sentenceId, [[startIndex, wordLength]]])
      continue
    }

    const adjacentSentence = vocabPositions[vocabPositions.length - 1]
    const adjacentSentenceIndex = adjacentSentence[0]
    const areCurrentAndAdjacentInTheSameSentence = sentenceId === adjacentSentenceIndex
    if (areCurrentAndAdjacentInTheSameSentence) {
      adjacentSentence[1].push([startIndex, wordLength])
    } else {
      vocabPositions.push([sentenceId, [[startIndex, wordLength]]])
    }
  }

  return (
    <div class="mb-1 ml-5 mr-3">
      {vocabPositions.map(([no, wordIndexes], index) => {
        let progress = 0
        const sentence = sentences[no]
        return (
          <div
            key={index}
            class="break-words"
            style="word-break: break-word;"
          >
            {wordIndexes.map(([start, count]) => (
              <>
                <span>
                  {sentence.slice(progress, start)}
                </span>
                <span class="font-bold italic">
                  {sentence.slice(start, progress = start + count)}
                </span>
              </>
            ))}
            <span>{sentence.slice(progress)}</span>
          </div>
        )
      })}
    </div>
  )
}
