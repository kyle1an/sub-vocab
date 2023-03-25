import { defineComponent } from 'vue'
import { v4 as uuidv4 } from 'uuid'

async function readFiles(files: FileList) {
  const fileList = []
  for (let i = 0; i < files.length; i++) {
    fileList.push(new Promise<{ result: FileReader['result'] }>((resolve, reject) => {
      const fr = new FileReader()
      fr.onload = () => {
        const { result } = fr
        resolve({ result })
      }
      fr.onerror = reject
      fr.readAsText(files[i])
    }))
  }

  return await Promise.all(fileList)
}

export const FileInput = defineComponent({
  emits: {
    fileInput: (e: {
      value: string,
      name: string,
    }) => e,
  },
  setup(props, { slots, emit, expose }) {
    function onFileChange(ev: Event) {
      const fileList = (ev.target as HTMLInputElement).files
      if (fileList && fileList.length > 0) {
        readFiles(fileList)
          .then((fl) => {
            emit('fileInput', {
              value: fl.reduce((pre, { result }) => pre + String(result), ''),
              name: fileList.length === 1 ? fileList[0].name : `${fileList.length} files selected`
            })
          })
          .catch(console.error)
      }
    }

    function dropFile(ev: DragEvent) {
      ev.preventDefault()
      const file = ev.dataTransfer?.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          emit('fileInput', {
            value: e.target?.result as string,
            name: file.name
          })
        }
        reader.readAsText(file)
      }
    }

    function resetFileInput(selectors: string) {
      const input: NodeListOf<HTMLInputElement> = document.querySelectorAll(selectors)
      for (let i = 0; i < input.length; i++) {
        input[i].value = ''
      }
    }

    expose({
      inputChanged() {
        resetFileInput('#browseFiles' + id)
      }
    })
    const id = uuidv4()
    return () => (
      <div onDrop={dropFile}>
        <label
          class="box-border inline-flex h-8 max-h-full grow-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-md border bg-white px-3 py-2.5 text-center align-middle text-sm leading-3 tracking-wide text-neutral-800 transition-colors hover:border-sky-300 hover:bg-sky-100 hover:text-sky-600"
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
  },
})
