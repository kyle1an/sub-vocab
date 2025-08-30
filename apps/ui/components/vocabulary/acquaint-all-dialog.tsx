import { useStore } from 'jotai'
import { Trans, useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import type { TrackedWord } from '@/lib/LexiconTrie'

import { useUserWordPhaseMutation } from '@/api/vocab-api'
import { sessionAtom } from '@/atoms/auth'
import { LoginToast } from '@/components/login-toast'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { transParams } from '@/i18n'

export function AcquaintAllDialog<T extends TrackedWord>({
  vocabulary,
}: {
  vocabulary: T[]
}) {
  const { t } = useTranslation()
  const { mutateAsync: userWordPhaseMutation } = useUserWordPhaseMutation()
  const store = useStore()
  const acquaintAllVocab = (rows: T[]) => {
    if (!store.get(sessionAtom)?.user) {
      toast(<LoginToast />)
      return
    }
    userWordPhaseMutation(rows)
      .catch(console.error)
  }
  const rowsToRetain = vocabulary.filter((row) => row.form.length <= 32)
  const count = rowsToRetain.length
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <div className="flex w-full flex-row items-center gap-3 px-2 py-1.5">
          <svg className="icon-[solar--list-check-bold]" />
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
