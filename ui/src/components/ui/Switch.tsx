export function Switch({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <div>
      <label className="group/label flex cursor-pointer justify-center">
        <input
          checked={checked}
          type="checkbox"
          className="peer hidden"
          onChange={(ev) => {
            onChange(ev.target.checked)
          }}
        />
        <div className="group/d relative inline-block h-[26px] w-[46px] select-none overflow-hidden rounded-[23px] bg-neutral-200 align-text-bottom transition-all duration-300 ease-linear mask-squircle sq-smooth-y-[.3] sq-radius-full sq-radius-y-[7.8] sq-fill-[red] *:absolute *:rounded-full peer-checked:bg-[rgb(52,199,89)] peer-checked:*:right-[18px] sq:rounded-none">
          <div className="h-[22px] w-[42px] bg-neutral-200 [transform:translate3d(2px,2px,0)_scale3d(1,1,1)] [transition:all_0.25s_linear] peer-checked:group-[]/d:[transform:translate3d(18px,2px,0)_scale3d(0,0,0)]" />
          <div className="size-[22px] bg-white shadow-md [transform:translate3d(2px,2px,0)] [transition:all_0.35s_cubic-bezier(0.34,0.35,0.11,1.19),width_150ms_ease-in-out] group-hover/label:group-active/label:w-7 group-hover/label:group-active/label:delay-75 peer-checked:group-[]/d:[transform:translate3d(16px,2px,0)]" />
        </div>
      </label>
    </div>
  )
}
