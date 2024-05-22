import type React from 'react'
import { readDataTransferItemList, readEntryFiles } from '@/lib/filesHandler'

export function TextareaInput({
  value,
  placeholder,
  onChange,
}: {
  value: string
  placeholder?: string
  onChange: (text: {
    value: string
    name?: string
  }) => void
}) {
  function textareaOnChange(ev: React.ChangeEvent<HTMLTextAreaElement>) {
    onChange({
      value: ev.target.value,
    })
  }

  function dropHandler(event: React.DragEvent<HTMLTextAreaElement>) {
    event.preventDefault()
    if (!event.dataTransfer?.items) {
      return
    }

    Promise.all(readDataTransferItemList(event.dataTransfer.items))
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
      className="size-full max-h-full resize-none rounded-none px-[30px] py-3 align-top tracking-[.02em] outline-none ffs-[normal] dark:bg-slate-900 dark:text-slate-400 dark:placeholder:text-slate-600"
      placeholder={placeholder ?? ''}
      onChange={textareaOnChange}
      onDrop={dropHandler}
    />
  )
}
