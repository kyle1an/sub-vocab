import type { CheckedState } from '@radix-ui/react-checkbox'

import { useMediaQuery } from 'foxact/use-media-query'
import { useAtom, useSetAtom } from 'jotai'
import { isEqual } from 'lodash-es'
import { useEffect } from 'react'
import { useSearchParams } from 'react-router'
import { useImmer } from 'use-immer'
import IconLucideCog from '~icons/lucide/cog'

import type { FileType } from '@/store/useVocab'

import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTrigger } from '@/components/ui/drawer'
import { Separator } from '@/components/ui/separator'
import { Toggle } from '@/components/ui/toggle'
import { fileTypesAtom, isDrawerOpenAtom } from '@/store/useVocab'

function FileSettingsContent({
  className,
  fileTypes,
  onFileTypeChange: setFileType,
}: {
  className?: string
  fileTypes: FileType[]
  onFileTypeChange: (fileTypes: FileType, checkedState: CheckedState) => void
}) {
  return (
    <div className={className}>
      <div className="flex flex-wrap gap-x-3 gap-y-2">
        {fileTypes.map((fileType) => {
          const { type, checked } = fileType
          return (
            <div
              key={type}
              className="flex items-center space-x-2"
            >
              <Toggle
                pressed={checked}
                variant="outline"
                aria-label="Regular expression"
                className="size-fit min-w-[35px] px-1.5 py-1 text-muted-foreground"
                onPressedChange={(pressed) => {
                  setFileType(fileType, pressed)
                }}
              >
                {fileType.type}
              </Toggle>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const FILE_SETTINGS_TITLE = `Select File Types`
const FILE_SETTINGS_DESCRIPTION = `Choose the file types you want to include for text input.`

export function FileSettings() {
  const isMdScreen = useMediaQuery('(min-width: 768px)')
  const [searchParams, setSearchParams] = useSearchParams()
  const open = searchParams.get('popup') === 'file-settings'
  const setIsDrawerOpen = useSetAtom(isDrawerOpenAtom)
  const [fileTypes, setFileTypes] = useAtom(fileTypesAtom)
  const [fileTypesInterim, setFileTypesInterim] = useImmer(fileTypes)

  useEffect(() => {
    setIsDrawerOpen(open)
  }, [open, setIsDrawerOpen])

  useEffect(() => {
    setFileTypesInterim(fileTypes)
  }, [fileTypes, setFileTypesInterim])

  function handleFileTypeChange({ type }: FileType, checkedState: CheckedState) {
    setFileTypesInterim((draft) => {
      const fileType = draft.find((ft) => ft.type === type)
      if (fileType)
        fileType.checked = checkedState === true
    })
  }

  function save() {
    setFileTypes(fileTypesInterim)
    searchParams.delete('popup')
  }

  const settingsUnchanged = isEqual(fileTypes, fileTypesInterim)

  const Trigger = (
    <Button
      variant="outline"
      className="size-8 p-0"
    >
      <IconLucideCog
        className="size-[14px]"
      />
    </Button>
  )

  function handleOpenChange(open: boolean) {
    if (open) {
      searchParams.set('popup', 'file-settings')
    }
    else {
      searchParams.delete('popup')
      setFileTypesInterim(fileTypes)
    }
    setSearchParams(searchParams)
  }

  if (isMdScreen) {
    return (
      <Dialog
        open={open}
        onOpenChange={handleOpenChange}
      >
        <DialogTrigger asChild>
          {Trigger}
        </DialogTrigger>
        <DialogContent className="flex flex-col gap-0 sm:max-w-[425px]">
          <DialogHeader className="pb-2">
            <DialogTitle>{FILE_SETTINGS_TITLE}</DialogTitle>
            <DialogDescription>
              {FILE_SETTINGS_DESCRIPTION}
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <div className="size-full overflow-y-scroll px-0.5 py-3">
            <FileSettingsContent
              fileTypes={fileTypesInterim}
              onFileTypeChange={handleFileTypeChange}
            />
          </div>
          <Separator />
          <DialogFooter className="pt-3">
            <DialogClose asChild>
              <Button variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={settingsUnchanged}
              onClick={save}
            >
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DrawerTrigger asChild>
        {Trigger}
      </DrawerTrigger>
      <DrawerContent>
        <div className="w-full border-b pb-3 pt-1 text-lg">
          <DialogTitle className="m-auto w-fit text-lg font-semibold leading-none">
            {FILE_SETTINGS_TITLE}
          </DialogTitle>
        </div>
        <div className="size-full overflow-y-scroll px-6 pb-4">
          <div className="mx-auto max-w-[425px]">
            <DrawerHeader className="px-0 text-left">
              <DrawerDescription>
                {FILE_SETTINGS_DESCRIPTION}
              </DrawerDescription>
            </DrawerHeader>
            <FileSettingsContent
              fileTypes={fileTypesInterim}
              onFileTypeChange={handleFileTypeChange}
            />
          </div>
        </div>
        <DrawerFooter className="border-t pt-2">
          <Button
            type="submit"
            disabled={settingsUnchanged}
            onClick={save}
          >
            Save changes
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">
              Cancel
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
