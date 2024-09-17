import type { CheckedState } from '@radix-ui/react-checkbox'

import { useMediaQuery } from 'foxact/use-media-query'

import { type FileType, fileTypesAtom, isBackgroundScaledAtom } from '@/store/useVocab'

function FileSettingsContent({
  className,
  fileTypes,
  onFileTypesChange,
}: {
  className?: string
  fileTypes: FileType[]
  onFileTypesChange: (fileTypes: FileType, checkedState: CheckedState) => void
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
                className={cn(
                  'size-fit min-w-[35px] rounded-full px-1.5 py-1 text-muted-foreground [--sq-r:7] sq:rounded-none',
                )}
                onPressedChange={(pressed) => {
                  onFileTypesChange(fileType, pressed)
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
  const [open, setOpen] = useState(searchParams.get('popup') === 'file-settings')
  const [, setIsBackgroundScaled] = useAtom(isBackgroundScaledAtom)
  const [fileTypes, setFileTypes] = useAtom(fileTypesAtom)
  const [fileTypesInterim, setFileTypesInterim] = useState(fileTypes)

  function removePopup() {
    if (searchParams.get('popup') === 'file-settings') {
      searchParams.delete('popup')
      setSearchParams(searchParams)
    }
  }

  function addPopup() {
    if (searchParams.get('popup') !== 'file-settings') {
      searchParams.set('popup', 'file-settings')
      setSearchParams(searchParams)
    }
  }

  function updatePopup(open: boolean) {
    if (open) {
      addPopup()
    } else {
      removePopup()
    }
  }

  useEffect(() => {
    const popup = searchParams.get('popup')
    updatePopup(popup === 'file-settings')
    setOpen(popup === 'file-settings')
  }, [searchParams, updatePopup])

  useEffect(() => {
    setFileTypesInterim(fileTypes)
  }, [fileTypes])

  function handleFileTypesChange({ type }: FileType, checkedState: CheckedState) {
    setFileTypesInterim(produce((draft) => {
      const a = draft.find((ft) => ft.type === type)
      if (a) {
        a.checked = checkedState === true
      }
    }))
  }

  function save() {
    setFileTypes(fileTypesInterim)
    setOpen(false)
  }

  const settingsUnchanged = JSON.stringify(fileTypes) === JSON.stringify(fileTypesInterim)

  const Trigger = (
    <Button
      variant="outline"
      className="size-8 rounded-[7px] p-0 shadow-none sq:drop-shadow-none"
    >
      <IconLucideCog
        className="size-[14px]"
      />
    </Button>
  )

  function handleOpenChange(open: boolean) {
    if (!open) {
      setFileTypesInterim(fileTypes)
    }
    updatePopup(open)
    setOpen(open)
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{FILE_SETTINGS_TITLE}</DialogTitle>
            <DialogDescription>
              {FILE_SETTINGS_DESCRIPTION}
            </DialogDescription>
          </DialogHeader>
          <FileSettingsContent
            fileTypes={fileTypesInterim}
            onFileTypesChange={handleFileTypesChange}
          />
          <DialogFooter>
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

  function handleDrawerOpenChange(open: boolean) {
    handleOpenChange(open)
    setIsBackgroundScaled(open)
  }

  return (
    <Drawer
      open={open}
      onOpenChange={handleDrawerOpenChange}
    >
      <DrawerTrigger asChild>
        {Trigger}
      </DrawerTrigger>
      <DrawerContent>
        <div className="w-full border-b pb-3 pt-1 text-lg">
          <DialogTitle className="m-auto w-fit font-semibold">
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
              onFileTypesChange={handleFileTypesChange}
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
