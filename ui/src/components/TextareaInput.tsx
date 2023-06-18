import { defineComponent } from 'vue'
import { readDataTransferItemList, readEntryFiles } from '@/utils/filesHandler'

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

  function dropHandler(event: DragEvent): void {
    event.preventDefault()
    if (!event.dataTransfer?.items) return

    Promise.all(readDataTransferItemList(event.dataTransfer.items))
      .then(fileContents => {
        const { title, content } = readEntryFiles(fileContents)
        props.onTextChange({
          value: content,
          name: title
        })
      })
      .catch(console.error)
  }

  return () => (
    <textarea
      value={props.value}
      class="h-[260px] max-h-[360px] w-full resize-none rounded-none px-[30px] py-3 align-top outline-none ffs-[normal] md:h-full md:max-h-full"
      placeholder={props.placeholder ?? ''}
      onInput={inputChanged}
      onDrop={dropHandler}
    />
  )
}), { props: ['value', 'placeholder', 'onTextChange'] })
