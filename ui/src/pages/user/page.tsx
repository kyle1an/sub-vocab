import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'
import { useChangeUsername, useIsUsernameTaken } from '@/api/user'
import { useVocabStore } from '@/store/useVocab'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'

type FormValues = {
  newUsername: string
}

export const UserPage = () => {
  const { t } = useTranslation()
  const username = useVocabStore((state) => state.username)
  const form = useForm<FormValues>({
    defaultValues: {
      newUsername: username,
    },
    reValidateMode: 'onSubmit',
  })

  const {
    register, handleSubmit, formState: { errors }, setError,
  } = form
  const { mutateAsync: changeUsername, isError: isChangeUsernameError, isPending } = useChangeUsername()
  const { mutateAsync: isUsernameTaken, isError: isUsernameTakenError, isPending: isUsernameTakenPending } = useIsUsernameTaken()
  async function submitForm(values: FormValues) {
    if (values.newUsername === username) {
      setError('newUsername', {
        message: 'The new username is the same as the current username.',
      })
      return
    }

    const usernameTaken = await isUsernameTaken({
      username: values.newUsername,
    })
    if (usernameTaken.has) {
      setError('newUsername', {
        message: 'The username is taken.',
      })
      return
    }

    await changeUsername({
      username,
      newUsername: values.newUsername,
    })
  }

  useEffect(() => {
    if (isChangeUsernameError) {
      setError('newUsername', {
        message: 'Something went wrong',
      })
    }
  }, [isChangeUsernameError, setError])

  useEffect(() => {
    if (isUsernameTakenError) {
      setError('root.serverError', {
        message: 'Something went wrong, please try again later',
      })
    }
  }, [isUsernameTakenError, setError])

  return (
    <div className="flex flex-col gap-3">
      <div>
        <div className="mb-3 border-b pb-1.5 text-xl">
          {t('changeUsername')}
        </div>
        <div className="flex w-80">
          <Form {...form}>
            <form
              onSubmit={handleSubmit(submitForm)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="newUsername"
                rules={{
                  required: 'The Username is required.',
                  minLength: { value: 3, message: 'The Username must be at least 3 characters.' },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('Name')}</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder=""
                        autoComplete="off"
                        {...field}
                        {...register('newUsername')}
                        className="text-base md:text-sm"
                      />
                    </FormControl>
                    <FormMessage>{errors.newUsername?.message ?? ''}</FormMessage>
                  </FormItem>
                )}
              />
              <FormMessage>{errors.root?.serverError?.message}</FormMessage>
              <Button
                className="mt-8 gap-1.5"
                type="submit"
                disabled={isUsernameTakenPending || isPending}
              >
                {t('Confirm Changes')}
                {isUsernameTakenPending || isPending ? (
                  <Icon
                    icon="lucide:loader-2"
                    className="animate-spin"
                  />
                ) : null}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}
