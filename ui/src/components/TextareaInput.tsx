import { defineComponent } from 'vue'

export const TextareaInput = Object.assign(defineComponent((props: {
  value: string
  placeholder?: string
  onTextChange: (text: {
    value: string
    name?: string
  }) => void
}) => {
  function inputChanged(ev: Event) {
    props.onTextChange({
      value: (ev.target as HTMLInputElement).value
    })
  }

  function dropFile(ev: DragEvent) {
    ev.preventDefault()
    const file = ev.dataTransfer?.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        props.onTextChange({
          value: e.target?.result as string,
          name: file.name
        })
      }
      reader.readAsText(file)
    }
  }

  return () => (
    <textarea
      value={props.value}
      class="h-[260px] max-h-[360px] w-full resize-none rounded-none px-[30px] py-3 align-top outline-none ffs-[normal] md:h-full md:max-h-full"
      placeholder={props.placeholder ?? ''}
      onInput={inputChanged}
      onDrop={dropFile}
    />
  )
}), { props: ['value', 'placeholder', 'onTextChange'] })
