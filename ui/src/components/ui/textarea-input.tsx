import type React from 'react'

import type { FileType } from '@/store/useVocab'

import { Textarea } from '@/components/ui/textarea'
import { DataTransferItemListReader, readEntryFiles } from '@/lib/filesHandler'
import { cn } from '@/lib/utils'

export function TextareaInput({
  className,
  fileTypes,
  onFileChange: handleChange,
  ...props
}: React.ComponentProps<'textarea'> & {
  fileTypes: FileType[]
  onFileChange: (text: {
    value: string
    name?: string
  }) => void
}) {
  const dataTransferItemListReader = new DataTransferItemListReader(fileTypes.filter((fileType) => fileType.checked).map((fileType) => fileType.type))

  function dropHandler(event: React.DragEvent<HTMLTextAreaElement>) {
    event.preventDefault()
    Promise.all(dataTransferItemListReader.readDataTransferItemList(event.dataTransfer.items))
      .then((fileContents) => {
        const { title, content } = readEntryFiles(fileContents)
        handleChange({
          value: content,
          name: title,
        })
      })
      .catch(console.error)
  }

  return (
    <Textarea
      aria-label="Text input"
      className={cn(
        'size-full max-h-full resize-none rounded-none bg-background px-[30px] py-3 align-top tracking-normal outline-hidden placeholder:tracking-[.01em] focus-visible:ring-0 dark:text-neutral-400 dark:placeholder:text-neutral-600',
        'border-0',
        className,
      )}
      onDrop={dropHandler}
      {...props}
    />
  )
}
