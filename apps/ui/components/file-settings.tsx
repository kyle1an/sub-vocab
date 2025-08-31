'use client'

import type { CheckedState } from '@radix-ui/react-checkbox'

import { pipe } from 'effect'
import { isEqual } from 'es-toolkit'
import { useAtom, useAtomValue } from 'jotai'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { useImmer } from 'use-immer'

import type { FileType } from '@/atoms/file-types'

import { mediaQueryFamily } from '@/atoms'
import { fileTypesAtom } from '@/atoms/file-types'
import { NoSSR } from '@/components/NoSsr'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTrigger } from '@/components/ui/drawer'
import { Separator } from '@/components/ui/separator'
import { Toggle } from '@/components/ui/toggle'
import { isServer, tap } from '@sub-vocab/utils/lib'

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

const Trigger = (
  <Button
    variant="outline"
    className="size-8 p-0"
    suppressHydrationWarning
  >
    <svg className="icon-[lucide--cog] size-3.5" />
  </Button>
)

export function Settings() {
  const isMdScreen = useAtomValue(mediaQueryFamily.useA('(min-width: 768px)'))
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const createQueryString = (name: string, value: string) => pipe(
    new URLSearchParams(searchParams.toString()),
    tap((x) => {
      x.set(name, value)
    }),
    (x) => x.toString(),
  )
  const open = searchParams.get('popup') === 'file-settings'
  const [fileTypes, setFileTypes] = useAtom(fileTypesAtom)
  const [fileTypesInterim, setFileTypesInterim] = useImmer(fileTypes)

  function handleFileTypeChange({ type }: FileType, checkedState: CheckedState) {
    setFileTypesInterim((draft) => {
      const fileType = draft.find((ft) => ft.type === type)
      if (fileType) {
        fileType.checked = checkedState === true
      }
    })
  }

  function save() {
    setFileTypes(fileTypesInterim)
    router.push(``)
  }

  const settingsUnchanged = isEqual(fileTypes, fileTypesInterim)

  function handleOpenChange(open: boolean) {
    if (open) {
      router.push(`${pathname}?${createQueryString('popup', 'file-settings')}`)
    } else {
      router.push(`${pathname}`)
      setFileTypesInterim(fileTypes)
    }
  }

  if (isMdScreen) {
    return (
      <Dialog
        open={open}
        onOpenChange={handleOpenChange}
      >
        <DialogTrigger
          aria-label="file-settings"
          asChild
        >
          {Trigger}
        </DialogTrigger>
        <DialogContent className="flex max-h-[calc(100vh-1rem)] flex-col gap-0 sm:max-w-[425px]">
          <DialogHeader className="pb-2">
            <DialogTitle>{FILE_SETTINGS_TITLE}</DialogTitle>
            <DialogDescription>
              {FILE_SETTINGS_DESCRIPTION}
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <div className="-ml-1 size-full overflow-y-scroll px-0.5 py-3 pl-1">
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
      shouldScaleBackground
      onOpenChange={handleOpenChange}
    >
      <DrawerTrigger asChild>
        {Trigger}
      </DrawerTrigger>
      <DrawerContent>
        <div className="w-full border-b pt-1 pb-3 text-lg">
          <DialogTitle className="m-auto w-fit text-lg leading-none font-semibold">
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

export function FileSettings() {
  return (
    <Suspense>
      <Settings />
    </Suspense>
  )
}
