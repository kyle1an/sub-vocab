import type React from 'react'

import type { FileType } from '@/store/useVocab'

import { DataTransferItemListReader, readEntryFiles } from '@/lib/filesHandler'

export function TextareaInput({
  value,
  placeholder,
  fileTypes,
  onChange,
}: {
  value: string
  placeholder?: string
  fileTypes: FileType[]
  onChange: (text: {
    value: string
    name?: string
  }) => void
}) {
  const dataTransferItemListReader = new DataTransferItemListReader(fileTypes.filter((fileType) => fileType.checked).map((fileType) => fileType.type))

  function textareaOnChange(ev: React.ChangeEvent<HTMLTextAreaElement>) {
    onChange({
      value: ev.target.value,
    })
  }

  function dropHandler(event: React.DragEvent<HTMLTextAreaElement>) {
    event.preventDefault()
    Promise.all(dataTransferItemListReader.readDataTransferItemList(event.dataTransfer.items))
      .then((fileContents) => {
        const { title, content } = readEntryFiles(fileContents)
        onChange({
          value: content,
          name: title,
        })
      })
      .catch(console.error)
  }

  return (
    <textarea
      aria-label="Text input"
      value={value}
      className="size-full max-h-full resize-none rounded-none bg-background px-[30px] py-3 align-top tracking-normal outline-none ffs-[normal] placeholder:tracking-[.01em] dark:text-slate-400 dark:placeholder:text-slate-600"
      placeholder={placeholder ?? ''}
      onChange={textareaOnChange}
      onDrop={dropHandler}
    />
  )
}
