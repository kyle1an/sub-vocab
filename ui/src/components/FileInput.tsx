import { defineComponent } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { getFileContent } from '@/utils/filesHandler'

export const FileInput = defineComponent((props: {
  onFileInput: (file: {
    value: string,
    name: string
  }) => void
}, { slots, expose }) => {
  function onFileChange(ev: Event) {
    const fileList = (ev.target as HTMLInputElement).files
    if (fileList && fileList.length > 0) {
      getFileContent(fileList).then(props.onFileInput).catch(console.error)
    }
  }

  function dropFile(ev: DragEvent) {
    ev.preventDefault()
    const files = ev.dataTransfer?.files
    if (files && files.length > 0) {
      getFileContent(files).then(props.onFileInput).catch(console.error)
    }
  }

  function inputChanged() {
    const input: NodeListOf<HTMLInputElement> = document.querySelectorAll('#browseFiles' + id)
    for (let i = 0; i < input.length; i++) {
      input[i].value = ''
    }
  }

  expose({ inputChanged })

  const id = uuidv4()
  return () => (
    <div onDrop={dropFile}>
      <label
        class="box-border inline-flex h-8 max-h-full grow-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-md border bg-white px-3 py-2.5 text-center align-middle text-sm/3 tracking-wide text-neutral-800 transition-colors hover:border-sky-300 hover:bg-sky-100 hover:text-sky-600"
        for={'browseFiles' + id}
      >
        {slots.default?.()}
      </label>
      <input
        id={'browseFiles' + id}
        class="file-input"
        type="file"
        hidden
        multiple
        onChange={onFileChange}
      />
    </div>
  )
})
