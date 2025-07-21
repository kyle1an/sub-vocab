import type React from 'react'

import { useAtom } from 'jotai'
import { Button as AriaButton, FileTrigger } from 'react-aria-components'

import { Button } from '@/components/ui/button'
import { getFileContent, SUPPORTED_FILE_TYPES } from '@/lib/filesHandler'
import { fileTypesAtom } from '@/store/useVocab'

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
      className={className}
    >
      <FileTrigger
        allowsMultiple
        acceptedFileTypes={acceptedFileTypes}
        onSelect={handleFileSelect}
      >
        <div>
          <Button
            variant="outline"
            asChild
          >
            <AriaButton>
              {children}
            </AriaButton>
          </Button>
        </div>
      </FileTrigger>
    </div>
  )
}
