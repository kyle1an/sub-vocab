import { Link, Outlet } from 'react-router'

import { FileInput } from '@/components/file-input'
import { sourceTextAtom } from '@/store/useVocab'

import { FileSettings } from './file-settings'

const fileInfoAtom = atom('')

export default function Home() {
  const { t } = useTranslation()
  const setFileInfo = useSetAtom(fileInfoAtom)
  const setSourceText = useSetAtom(sourceTextAtom)

  function handleFileChange({ name, value }: { name: string, value: string }) {
    setFileInfo(name)
    setSourceText((v) => ({
      text: value,
      version: v.version++,
    }))
  }

  return (
    <main className="m-auto h-[calc(100svh-4px*11)] w-full max-w-screen-xl px-5 pb-7">
      <div className="relative flex h-14 items-center gap-2">
        <FileInput
          onFileSelect={handleFileChange}
        >
          {t('browseFiles')}
        </FileInput>
        <FileSettings />
        <Button
          variant="outline"
          className="whitespace-nowrap p-0"
          size="sm"
        >
          <Link
            to="/subtitles"
            className="flex size-full items-center px-3"
          >
            Subtitles
          </Link>
        </Button>
        <div className="grow" />
      </div>
      <Outlet />
    </main>
  )
}
