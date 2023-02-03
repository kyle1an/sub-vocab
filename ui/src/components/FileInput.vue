<script lang="ts" setup>
import { v4 as uuidv4 } from 'uuid'
import { readFiles, resetFileInput } from '@/utils/utils'

const emit = defineEmits(['fileInput'])

async function onFileChange(ev: Event) {
  const files = (ev.target as HTMLInputElement).files
  const numberOfFiles = files?.length
  if (!numberOfFiles) return

  emit('fileInput', {
    text: (await readFiles(files)).reduce((pre, { result }) => pre + result, ''),
    info: numberOfFiles === 1 ? files[0].name : `${numberOfFiles} files selected`
  })
}

const inputChanged = () => resetFileInput('.file-input')
defineExpose({ inputChanged })
const id = uuidv4()
</script>

<template>
  <div>
    <label
      class="box-border inline-flex h-8 max-h-full grow-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-md border bg-white px-3 py-2.5 text-center align-middle text-sm leading-3 tracking-wide text-neutral-800 transition-colors hover:border-sky-300 hover:bg-sky-100 hover:text-sky-600"
      :for="'browseFiles'+id"
    >
      <slot />
    </label>
    <input
      :id="'browseFiles'+id"
      class="file-input"
      type="file"
      hidden
      multiple
      @change="onFileChange"
    >
  </div>
</template>
