import { defineComponent } from 'vue'
import { formatDistanceToNowStrict } from 'date-fns'

function formatDistance(time: string) {
  const date = new Date(time)
  return (
    <div class="flex flex-row gap-0.5 text-neutral-900">
      {formatDistanceToNowStrict(date)}
    </div>
  )
}

export default defineComponent({
  props: {
    time: { type: String, default: '' },
  },
  setup(props: { time: string }) {
    return () => (props.time ? formatDistance(props.time) : '')
  },
})
