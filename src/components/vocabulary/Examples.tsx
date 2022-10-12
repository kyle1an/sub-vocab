function Line({ sentence = '', idxes = [[0, 0]] }) {
  let progress = 0
  return (
    <>
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
    </>
  )
}

export function Examples({ sentences = [''], src = [[0, 0]] }) {
  const lines: [number, [number, number][]][] = []
  src.sort((a, b) => a[0] - b[0] || a[1] - b[1])

  for (const [sid, start, count] of src) {
    if (lines[lines.length - 1]?.[0] === sid) {
      lines[lines.length - 1][1].push([start, count])
    } else {
      lines.push([sid, [[start, count]]])
    }
  }

  return (
    <div class="mb-1 ml-5 mr-3">
      {lines.map(([no, idx], index) => (
        <div
          key={index}
          class="break-words"
          style="word-break: break-word;"
        >
          <Line
            sentence={sentences[no]}
            idxes={idx}
          />
        </div>
      ))}
    </div>
  )
}
