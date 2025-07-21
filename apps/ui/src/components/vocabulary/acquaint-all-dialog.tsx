import { Trans, useTranslation } from 'react-i18next'
import IconSolarListCheckBold from '~icons/solar/list-check-bold'

import type { TrackedWord } from '@/lib/LabeledTire'

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { useAcquaintAll } from '@/hooks/vocab-toggle'
import { transParams } from '@/i18n'

export function AcquaintAllDialog<T extends TrackedWord>({ vocabulary }: { vocabulary: T[] }) {
  const { t } = useTranslation()
  const acquaintAllVocab = useAcquaintAll()
  const rowsToRetain = vocabulary.filter((row) => row.form.length <= 32)
  const count = rowsToRetain.length
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <div className="flex w-full flex-row items-center gap-3 px-2 py-1.5">
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
              if (rowsToRetain.length > 0) {
                acquaintAllVocab(rowsToRetain)
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
