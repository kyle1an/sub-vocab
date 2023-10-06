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
      value={props.value}
      className="h-[calc(10*1.5em-2*3rem/4)] max-h-[350px] w-full resize-none rounded-none px-[30px] py-3 align-top outline-none ffs-[normal] md:h-full md:max-h-full"
      placeholder={props.placeholder ?? ''}
      onChange={textareaOnChange}
      onDrop={dropHandler}
    />
  )
}
