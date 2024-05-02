import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from '@radix-ui/react-alert-dialog'
import { Trans, useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { LoginToast } from '../login-toast'
import { AlertDialogFooter, AlertDialogHeader } from './alert-dialog'
import { Icon } from './icon'
import { useVocabStore } from '@/store/useVocab'
import type { VocabState } from '@/lib/LabeledTire'
import type { TI } from '@/i18n'
import { useAcquaintWordsMutation } from '@/api/vocab-api'

export function AcquaintAllDialog<T extends VocabState>({ vocabulary }: { vocabulary: T[] }) {
  const { t } = useTranslation()
  const { mutateAsync: mutateAcquaintWordsAsync } = useAcquaintWordsMutation()
  const username = useVocabStore((state) => state.username)
  function acquaintAllVocab(rows: T[]) {
    if (!username) {
      toast(<LoginToast />)
      return
    }

    mutateAcquaintWordsAsync(rows)
      .catch(console.error)
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <div className="flex w-full flex-row items-center gap-1.5 px-2 py-1.5">
          <Icon icon="solar:list-check-bold" />
          <div className="">{t('acquaintedAll')}</div>
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <AlertDialogTitle>{t('acquaintedAll')}</AlertDialogTitle>
          <AlertDialogDescription>
            <Trans
              i18nKey="acquaintedAllConfirmText"
              count={vocabulary.length}
            >
              Are you sure to mark all (
              <span className="font-bold text-black">{{ count: vocabulary.length } as TI}</span>
              ) vocabulary as acquainted?
            </Trans>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="">
          <AlertDialogCancel>{t('Cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              if (vocabulary.length > 0) {
                acquaintAllVocab(vocabulary)
              }
            }}
          >
            {t('Continue')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
