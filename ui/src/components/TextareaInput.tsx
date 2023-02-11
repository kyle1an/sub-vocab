import { defineComponent } from 'vue'

export const TextareaInput = defineComponent({
  emits: ['textChange'],
  setup(props: {
    value: string
    placeholder?: string
  }, { emit }) {
    function inputChanged(ev: Event) {
      emit('textChange', {
        value: (ev.target as HTMLInputElement).value
      })
    }

    function dropFile(ev: DragEvent) {
      ev.preventDefault()
      const file = ev.dataTransfer?.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          emit('textChange', {
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
        class="h-[260px] max-h-[360px] w-full resize-none rounded-none py-3 px-[30px] align-top outline-none ffs-[normal] md:h-full md:max-h-full"
        placeholder={props.placeholder ?? ''}
        onInput={inputChanged}
        onDrop={dropFile}
      />
    )
  },
})
