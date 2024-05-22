import type React from 'react'
import { Button, FileTrigger } from 'react-aria-components'
import { cn } from '@/lib/utils.ts'
import { SUPPORTED_FILE_TYPES, getFileContent } from '@/lib/filesHandler'

export function FileInput({
  onFileSelect,
  children,
  className = '',
}: {
  onFileSelect: (file: {
    value: string
    name: string
  }) => void
  children: React.ReactNode
  className?: string
}) {
  function handleFileSelect(fileList: FileList | null) {
    if (fileList) {
      getFileContent(fileList).then(onFileSelect).catch(console.error)
    }
  }

  function dropFile(ev: React.DragEvent<HTMLDivElement>) {
    ev.preventDefault()
    const files = ev.dataTransfer?.files
    if (files) {
      getFileContent(files).then(onFileSelect).catch(console.error)
    }
  }

  return (
    <div
      onDrop={dropFile}
      className={cn(className)}
    >
      <FileTrigger
        allowsMultiple
        acceptedFileTypes={SUPPORTED_FILE_TYPES}
        onSelect={handleFileSelect}
      >
        <Button
          className="inline-flex h-8 max-h-full grow-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-md border bg-white px-3 py-2.5 text-center align-middle text-sm/3 tracking-wide text-neutral-800 transition-colors hover:border-sky-300 hover:bg-sky-100 hover:text-sky-600 dark:bg-slate-900 dark:text-slate-400"
        >
          { children}
        </Button>
      </FileTrigger>
    </div>
  )
}
