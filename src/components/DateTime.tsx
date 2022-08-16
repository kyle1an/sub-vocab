import { defineComponent } from 'vue'
import { format, formatDistanceToNowStrict, getDate } from 'date-fns'

function formattedTime(time: string) {
  const date = new Date(time)
  const week = format(date, 'EEE')
  const month = format(date, 'MMM')
  const day = getDate(date)
  const year = format(date, 'yy')

  return (
    <div class="flex flex-row gap-0.5">
      <div class="inline-block w-[25px]">
        {week}
      </div>
      <div class="flex w-[44px] justify-between">
        <div class="inline-block font-bold text-neutral-500">
          {month}
        </div>
        <div>
          <span class="text-black">
            {day}
          </span>,
        </div>
      </div>
      <div class="inline-block text-neutral-500">
        {year}
      </div>
    </div>
  )
}

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
