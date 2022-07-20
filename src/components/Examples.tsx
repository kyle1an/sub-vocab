import { defineComponent, Ref } from 'vue'

export default defineComponent({
  props: {
    sentence: { type: String, default: '' },
    idxes: { type: Array, default: () => [0, 0] },
  },
  setup(props: any) {
    const { idxes } = toRefs<{ idxes: Ref<[number, number][]> }>(props)
    const lines: JSX.Element[] = []
    let progress = 0
    for (const [start, count] of idxes.value) {
      lines.push(
        <>
          <span>
            {props.sentence.slice(progress, start)}
          </span>
          {/*// @ts-ignore*/}
          <span class="italic underline">
            {props.sentence.slice(start, start + count)}
          </span>
        </>
      )
      progress = start + count
    }

    return () => lines
  },
})
