import type React from 'react'

import { Button, FileTrigger } from 'react-aria-components'

import { getFileContent, SUPPORTED_FILE_TYPES } from '@/lib/filesHandler'
import { fileTypesAtom, uapAtom } from '@/store/useVocab'

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
  const { os } = useAtomValue(uapAtom)
  const [fileTypes] = useAtom(fileTypesAtom)
  const fileTypeNames = fileTypes.filter((fileType) => fileType.checked).map((fileType) => fileType.type)
  const acceptedFileTypes = [...SUPPORTED_FILE_TYPES, ...fileTypeNames]

  function handleFileSelect(fileList: FileList | null) {
    if (fileList) {
      getFileContent(fileList).then(onFileSelect).catch(console.error)
    }
  }

  function dropFile(ev: React.DragEvent<HTMLDivElement>) {
    ev.preventDefault()
    const files = ev.dataTransfer.files
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
        // https://stackoverflow.com/a/47387521/10903455
        // https://caniuse.com/input-file-accept
        {...(os?.name === 'iOS' ? {} : {
          acceptedFileTypes,
        })}
        onSelect={handleFileSelect}
      >
        <Squircle
          squircle={{
            cornerRadius: 7,
          }}
          borderWidth={1}
          className="inline-flex h-8 max-h-full grow-0 cursor-pointer items-center justify-center whitespace-nowrap bg-border px-3 py-2.5 text-center align-middle text-sm/3 tracking-wide transition-colors before:bg-background hover:border-sky-300 hover:bg-sky-100 hover:text-sky-600 focus-visible:!bg-ring focus-visible:outline-0"
          asChild
        >
          <Button>
            { children}
          </Button>
        </Squircle>
      </FileTrigger>
    </div>
  )
}
