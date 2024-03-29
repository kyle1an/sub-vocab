import type React from 'react'
import { readDataTransferItemList, readEntryFiles } from '@/lib/filesHandler'

export const TextareaInput = (props: {
  value: string
  placeholder?: string
  onChange: (text: {
    value: string
    name?: string
  }) => void
}) => {
  function textareaOnChange(ev: React.ChangeEvent<HTMLTextAreaElement>) {
    props.onChange({
      value: ev.target.value,
    })
  }

  function dropHandler(event: React.DragEvent<HTMLTextAreaElement>) {
    event.preventDefault()
    if (!event.dataTransfer?.items) return

    Promise.all(readDataTransferItemList(event.dataTransfer.items))
      .then((fileContents) => {
        const { title, content } = readEntryFiles(fileContents)
        props.onChange({
          value: content,
          name: title,
        })
      })
      .catch(console.error)
  }

  return (
    <textarea
      aria-label="Text input"
      value={props.value}
      className="size-full max-h-full resize-none rounded-none px-[30px] py-3 align-top tracking-[.02em] outline-none ffs-[normal]"
      placeholder={props.placeholder ?? ''}
      onChange={textareaOnChange}
      onDrop={dropHandler}
    />
  )
}
