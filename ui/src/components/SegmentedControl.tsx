import { PropType, defineComponent, ref, watch } from 'vue'
import { useElementBounding, useSessionStorage } from '@vueuse/core'

export const SegmentedControl = defineComponent({
  props: {
    value: { required: true, type: String },
    name: { type: String, default: '' },
    segments: { required: true, type: Array as PropType<Readonly<{ value: string, label: string }[]>> },
    onChoose: { required: true, type: Function as PropType<(value: any) => void> }
  },
  setup(props) {
    const pill = ref()
    const pillWidth = useSessionStorage(`${props.name}-width`, 0)
    watch(useElementBounding(pill).width, (v) => v !== 0 && (pillWidth.value = v))
    return () => (
      <div class="text-precision !overflow-scrolling-touch box-border flex w-full grow-0 !touch-manipulation px-5 pb-2 pt-3 tracking-wide antialiased tap-transparent ffs-['cv08'] [&_*]:box-border">
        <div class="grid w-full select-none auto-cols-[1fr] grid-flow-col overflow-hidden rounded-[9px] bg-[#EFEFF0] p-0.5 outline-none">
          <span
            ref={pill}
            style={{ transform: `translateX(${pillWidth.value * props.segments.findIndex((seg) => seg.value === props.value)}px)` }}
            class="z-10 col-start-1 col-end-auto row-start-1 row-end-auto rounded-[7px] border-[.5px] border-black/[0.04] bg-white shadow-md transition-transform duration-300 ease-[ease] will-change-transform"
          />
          {props.segments.map((item, index) => (
            <div
              key={index}
              class="group relative first-of-type:col-[1] first-of-type:row-[1] first-of-type:shadow-[none] before:[&:first-of-type_label]:opacity-0 after:[&:last-of-type_label]:opacity-0"
            >
              <input
                id={`${props.name}-${item.value}`}
                type="radio" value={item.value}
                checked={item.value === props.value}
                class="group/i peer absolute inset-0 appearance-none opacity-0 outline-none"
                onInput={(ev) => props.onChoose((ev.target as HTMLInputElement).value)}
              />
              <label
                for={`${props.name}-${item.value}`}
                class="relative block cursor-pointer bg-transparent text-center before:absolute before:inset-y-[14%] before:left-0 before:w-px before:translate-x-[-.5px] before:rounded-[10px] before:bg-[#8E8E9326] before:transition-[background] before:duration-200 before:ease-[ease] before:will-change-[background] after:absolute after:inset-y-[14%] after:right-0 after:w-px after:translate-x-[.5px] after:rounded-[10px] after:bg-[#8E8E9326] after:transition-[background] after:duration-200 after:ease-[ease] after:will-change-[background] peer-checked:cursor-default before:peer-checked:z-[1] before:peer-checked:bg-[#EFEFF0FF] after:peer-checked:z-[1] after:peer-checked:bg-[#EFEFF0FF] [&_span]:peer-checked:font-medium"
              >
                <span class="relative z-10 flex justify-center text-sm leading-6 text-black transition-all duration-200 ease-[ease] will-change-transform group-hover:opacity-20 group-focus:opacity-20 group-active:opacity-20 group-[&:checked+label]/i:opacity-100 group-active:group-[&:not(:checked)+label]/i:scale-95">
                  {item.label}
                </span>
              </label>
            </div>
          ))}
        </div>
      </div>
    )
  },
})
