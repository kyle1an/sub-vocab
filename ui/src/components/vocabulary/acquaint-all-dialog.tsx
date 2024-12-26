import {
  Trans,
  useTranslation,
} from 'react-i18next'

import type { VocabState } from '@/lib/LabeledTire'

import { useAcquaintAll } from '@/hooks/vocabToggle'
import { transParams } from '@/i18n'

export function AcquaintAllDialog<T extends VocabState>({ vocabulary }: { vocabulary: T[] }) {
  const { t } = useTranslation()
  const acquaintAllVocab = useAcquaintAll()
  const count = vocabulary.length
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <div className="flex w-full flex-row items-center gap-1.5 px-2 py-1.5">
          <IconSolarListCheckBold />
          <div className="">{t('acquaintedAll')}</div>
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <AlertDialogTitle>{t('acquaintedAll')}</AlertDialogTitle>
          <AlertDialogDescription>
            <Trans
              i18nKey="acquaintedAllConfirmText"
              values={{ count }}
            >
              ()
              <span className="font-bold text-foreground">{transParams({ count })}</span>
            </Trans>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              if (vocabulary.length > 0) {
                acquaintAllVocab(vocabulary)
              }
            }}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
