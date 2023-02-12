import { defineComponent } from 'vue'
import { v4 as uuidv4 } from 'uuid'

type fileResult = { result: FileReader['result'] }

function readSingleFile(file: File) {
  return new Promise<fileResult>((resolve, reject) => {
    const fr = new FileReader()
    fr.onload = () => {
      const { result } = fr
      resolve({ result })
    }
    fr.onerror = reject
    fr.readAsText(file)
  })
}

async function readFiles(files: FileList) {
  const fileList: fileResult[] = []
  for (let i = 0; i < files.length; i++) {
    fileList.push(await readSingleFile(files[i]))
  }

  return fileList
}

export const FileInput = defineComponent({
  emits: {
    fileInput: (e: {
      value: string,
      name: string,
    }) => e,
  },
  setup(props, { slots, emit, expose }) {
    async function onFileChange(ev: Event) {
      const files = (ev.target as HTMLInputElement).files
      const numberOfFiles = files?.length
      if (!numberOfFiles) return
      emit('fileInput', {
        value: (await readFiles(files)).reduce((pre, { result }) => pre + result, ''),
        name: numberOfFiles === 1 ? files[0].name : `${numberOfFiles} files selected`
      })
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
      const input = document.querySelectorAll(selectors) as NodeListOf<HTMLInputElement>
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
