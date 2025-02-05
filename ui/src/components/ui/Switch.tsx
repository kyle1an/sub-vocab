export function Switch({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <div>
      <label className="group/label flex cursor-pointer justify-center [--squircle-circle-smooth:0.14]">
        <input
          checked={checked}
          type="checkbox"
          className="peer hidden"
          onChange={(ev) => {
            onChange(ev.target.checked)
          }}
        />
        <div className="group/d relative inline-block h-[--sw-h] w-[--sw-w] select-none overflow-hidden rounded-[23px] bg-neutral-200 align-text-bottom transition-all duration-300 ease-linear mask-squircle sq-smooth-x-[.14] sq-smooth-y-[.8] sq-radius-full sq-radius-y-[8.4] sq-fill-[red] [--sw-h:26px] [--sw-w:46px] *:absolute *:rounded-full peer-checked:bg-[rgb(52,199,89)] peer-checked:*:right-[18px] sq:rounded-none dark:bg-neutral-700">
          <div className="h-[calc(var(--sw-h)-4px)] w-[calc(var(--sw-w)-4px)] bg-neutral-200 [transform:translate3d(2px,2px,0)_scale3d(1,1,1)] [transition:all_0.25s_linear] peer-checked:group-[]/d:[transform:translate3d(18px,2px,0)_scale3d(0,0,0)] dark:bg-neutral-700" />
          <div className="size-[calc(var(--sw-h)-4px)] bg-white shadow-md squircle sq-smooth-x-[.14] sq-radius-[5] sq-outline-0 sq-fill-white [transform:translate3d(2px,2px,0)] [transition:all_0.35s_cubic-bezier(0.34,0.35,0.11,1.19),width_150ms_ease-in-out] group-hover/label:group-active/label:w-7 group-hover/label:group-active/label:delay-75 peer-checked:group-[]/d:[transform:translate3d(16px,2px,0)] sq:bg-transparent" />
        </div>
      </label>
    </div>
  )
}
