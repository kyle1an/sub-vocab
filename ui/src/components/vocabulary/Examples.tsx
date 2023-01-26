import { VocabSource } from '@/types'

function Line(
  {
    sentence = '',
    idxes,
  }: {
    sentence: string,
    idxes: [number, number][],
  }
) {
  let progress = 0
  return (
    <div
      class="break-words"
      style="word-break: break-word;"
    >
      {idxes.map(([start, count]) => (
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
}

export function Examples(
  {
    sentences,
    src = [],
  }: {
    sentences: string[],
    src: VocabSource,
  }
) {
  const vocabPositions: [number, [number, number][]][] = []
  src.sort((a, b) => a.sentenceId - b.sentenceId || a.startIndex - b.startIndex)

  for (const { sentenceId, startIndex, wordLength } of src) {
    if (vocabPositions.length === 0) {
      vocabPositions.push([sentenceId, [[startIndex, wordLength]]])
      continue
    }

    const adjacentSentence = vocabPositions[vocabPositions.length - 1]
    const adjacentSentenceIdex = adjacentSentence[0]
    const currentAndAdjacentAreFromTheSameSentence = sentenceId === adjacentSentenceIdex
    if (currentAndAdjacentAreFromTheSameSentence) {
      adjacentSentence[1].push([startIndex, wordLength])
    } else {
      vocabPositions.push([sentenceId, [[startIndex, wordLength]]])
    }
  }

  return (
    <div class="mb-1 ml-5 mr-3">
      {vocabPositions.map(([no, idx], index) => (
        <Line
          key={index}
          sentence={sentences[no]}
          idxes={idx}
        />
      ))}
    </div>
  )
}
