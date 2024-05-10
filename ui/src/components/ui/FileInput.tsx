import type React from 'react'
import { v4 as uuidv4 } from 'uuid'
import { cn } from '@/lib/utils.ts'
import { getFileContent } from '@/lib/filesHandler'

export function FileInput(props: {
  onFileChange: (file: {
    value: string
    name: string
  }) => void
  inputRef?: React.RefObject<HTMLInputElement>
  children: React.ReactNode
  className?: string
}) {
  function handleFileChange(ev: React.ChangeEvent<HTMLInputElement>) {
    const fileList = ev.target.files
    if (fileList) {
      getFileContent(fileList).then(props.onFileChange).catch(console.error)
    }
  }

  function dropFile(ev: React.DragEvent<HTMLDivElement>) {
    ev.preventDefault()
    const files = ev.dataTransfer?.files
    if (files) {
      getFileContent(files).then(props.onFileChange).catch(console.error)
    }
  }

  const inputId = `browseFiles${uuidv4()}`

  return (
    <div
      onDrop={dropFile}
      className={cn(props.className)}
    >
      <label
        className="inline-flex h-8 max-h-full grow-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-md border bg-white px-3 py-2.5 text-center align-middle text-sm/3 tracking-wide text-neutral-800 transition-colors hover:border-sky-300 hover:bg-sky-100 hover:text-sky-600 dark:bg-slate-900 dark:text-slate-400"
        htmlFor={inputId}
      >
        {props.children}
      </label>
      <input
        ref={props.inputRef}
        id={inputId}
        aria-label="File input"
        type="file"
        hidden
        multiple
        onChange={handleFileChange}
      />
    </div>
  )
}
