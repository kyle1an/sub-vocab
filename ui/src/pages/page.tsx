import {
  useDeferredValue,
  useEffect,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { atom, useAtom } from 'jotai'
import { produce } from 'immer'
import { useMediaQuery } from 'foxact/use-media-query'
import type { CheckedState } from '@radix-ui/react-checkbox'
import { FileInput } from '@/components/ui/FileInput'
import { TextareaInput } from '@/components/ui/TextareaInput'
import {
  type LabelDisplaySource,
  formVocab,
} from '@/lib/vocab'
import { VocabSourceTable } from '@/components/ui/VocabSource.tsx'
import {
  useIrregularMapsQuery,
  useVocabularyQuery,
} from '@/api/vocab-api'
import { purgedRows, statusRetainedList } from '@/lib/vocab-utils'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import { cn } from '@/lib/utils'
import { SquircleBg, SquircleMask } from '@/components/ui/squircle'
import { Switch } from '@/components/ui/Switch'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { useDrawerOpenChange } from '@/lib/hooks'
import { LabeledTire } from '@/lib/LabeledTire'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Icon } from '@/components/ui/icon'
import { type FileType, fileTypesAtom } from '@/store/useVocab'
import { Toggle } from '@/components/ui/toggle'

const fileInfoAtom = atom('')
const sourceTextAtom = atom('')
const textCountAtom = atom(0)

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
                  'size-fit min-w-[35px] rounded-full px-1.5 py-1 text-muted-foreground [--sq-r:9]',
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

function FileSettings() {
  const isMdScreen = useMediaQuery('(min-width: 768px)')
  const [open, setOpen] = useState(true)
  const { updateMetaTheme } = useDrawerOpenChange()
  const [fileTypes, setFileTypes] = useAtom(fileTypesAtom)
  const [fileTypesInterim, setFileTypesInterim] = useState(fileTypes)

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

  function cancel() {
    setFileTypesInterim(fileTypes)
  }

  function save() {
    setFileTypes(fileTypesInterim)
    setOpen(false)
  }

  const settingsUnchanged = JSON.stringify(fileTypes) === JSON.stringify(fileTypesInterim)

  const Trigger = (
    <Button
      variant="outline"
      className="size-8 rounded-[7px] shadow-none sq:drop-shadow-none"
    >
      <Icon
        icon="lucide:cog"
        className=""
        width={14}
      />
    </Button>
  )

  if (isMdScreen) {
    function handleDialogOpenChange(open: boolean) {
      if (!open) {
        cancel()
      }
      setOpen(open)
    }

    return (
      <Dialog
        open={open}
        onOpenChange={handleDialogOpenChange}
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
            <DrawerClose asChild>
              <Button variant="outline">
                Cancel
              </Button>
            </DrawerClose>
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
    if (!open) {
      cancel()
    }
    updateMetaTheme(open)
    setOpen(open)
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
        <div className="w-full border-b pb-3 pt-1 text-lg font-semibold">
          <DialogTitle className="m-auto w-fit">
            {FILE_SETTINGS_TITLE}
          </DialogTitle>
        </div>
        <div className="size-full overflow-scroll px-6 pb-4">
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

function SourceVocab({
  text: sourceText,
}: {
  text: string
}) {
  const { data: baseVocab = [] } = useVocabularyQuery()
  const { data: irregulars = [] } = useIrregularMapsQuery()

  const [rows, setRows] = useState<LabelDisplaySource[]>([])
  const [sentences, setSentences] = useState<string[]>([])
  const [, setCount] = useAtom(textCountAtom)

  useEffect(() => {
    const trie = new LabeledTire()
    trie.add(sourceText)
    trie.mergedVocabulary(baseVocab)
    trie.mergeDerivedWordIntoStem(irregulars)
    const list = trie.vocabulary.filter(Boolean).filter((v) => !v.variant).map(formVocab)
    setRows((r) => statusRetainedList(r, list))
    setSentences(trie.sentences)
    setCount(trie.wordCount)
  }, [sourceText, baseVocab, irregulars, setCount])

  function handlePurge() {
    setRows(purgedRows())
  }

  return (
    <VocabSourceTable
      data={rows}
      sentences={sentences}
      onPurge={handlePurge}
      className="h-full"
    />
  )
}

export function Home() {
  const { t } = useTranslation()
  const [fileInfo, setFileInfo] = useAtom(fileInfoAtom)
  const [sourceText, setSourceText] = useAtom(sourceTextAtom)
  const deferredSourceText = useDeferredValue(sourceText)
  const { updateMetaTheme } = useDrawerOpenChange()

  function handleFileChange({ name, value }: { name: string, value: string }) {
    setFileInfo(name)
    setSourceText(value)
  }

  function handleTextareaChange({ name, value }: { name?: string, value: string }) {
    setSourceText(value)
    if (name) {
      setFileInfo(name)
    }
  }

  const [count] = useAtom(textCountAtom)
  const isMdScreen = useMediaQuery('(min-width: 768px)')
  const direction = isMdScreen ? 'horizontal' : 'vertical'
  let defaultSizes = [56, 44]
  if (direction === 'vertical') {
    defaultSizes = [
      36,
      64,
    ]
  }
  const [fileTypes] = useAtom(fileTypesAtom)
  const [checked, setChecked] = useState(false)

  return (
    <main className="m-auto h-[calc(100svh-4px*11)] w-full max-w-screen-xl px-5 pb-7">
      <div className="relative flex h-14 items-center gap-2">
        <FileInput
          onFileSelect={handleFileChange}
        >
          {t('browseFiles')}
        </FileInput>
        <FileSettings />
        <div className="grow" />
        <Switch
          checked={checked}
          onChange={(checked) => {
            setChecked(checked)
          }}
        />
        <div className="mx-2"></div>
        <Drawer onOpenChange={updateMetaTheme}>
          <DrawerTrigger className="tracking-[.02em]">Open</DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Are you absolutely sure?</DrawerTitle>
              <DrawerDescription>This action cannot be undone.</DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <Button>Submit</Button>
              <DrawerClose asChild>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
      <SquircleBg className="flex h-[calc(100%-4px*14)] items-center justify-center overflow-hidden rounded-xl border">
        <SquircleMask asChild>
          <ResizablePanelGroup
            direction={direction}
            className={cn(
              'iOS:[body:has(&)]:overflow-hidden', // prevent overscroll
            )}
          >
            <ResizablePanel defaultSize={defaultSizes[0]}>
              <div className="flex h-full items-center justify-center">
                <div className="relative flex h-full grow flex-col overflow-hidden">
                  <div className="flex h-10 shrink-0 items-center border-b bg-zinc-50 py-2 pl-4 pr-2 text-xs text-neutral-600 dark:bg-slate-900 dark:text-slate-400">
                    <span className="grow truncate">{fileInfo}</span>
                    <span className="mx-2 inline-block h-[18px] w-px border-l align-middle" />
                    <span className="shrink-0 text-right tabular-nums">{`${count.toLocaleString('en-US')} ${t('words')}`}</span>
                  </div>
                  <div className="size-full grow text-base text-zinc-700 md:text-sm">
                    <TextareaInput
                      value={sourceText}
                      placeholder={t('inputArea')}
                      fileTypes={fileTypes}
                      onChange={handleTextareaChange}
                    />
                  </div>
                </div>
              </div>
            </ResizablePanel>
            <ResizableHandle
              withHandle
              className="focus-visible:bg-ring focus-visible:ring-offset-[-1px]"
            />
            <ResizablePanel defaultSize={defaultSizes[1]}>
              <SourceVocab
                text={deferredSourceText}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </SquircleMask>
      </SquircleBg>
    </main>
  )
}
