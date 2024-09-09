import { useAtom } from 'jotai/react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { useUpdateEmail, useUpdateUser } from '@/api/user'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Icon } from '@/components/ui/icon'
import { Input, InputWrapper } from '@/components/ui/input'
import { sessionAtom } from '@/store/useVocab'

export function UserPage() {
  const { t } = useTranslation()
  const [session] = useAtom(sessionAtom)
  const username = session?.user.user_metadata.username || ''
  const email = session?.user.email || ''
  const formDefaultValues = {
    newUsername: username,
    email,
  }
  type FormValues = typeof formDefaultValues
  const form = useForm<FormValues>({
    defaultValues: formDefaultValues,
    reValidateMode: 'onSubmit',
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = form
  const { mutateAsync: updateUser, isPending: isUsernameUpdatePending } = useUpdateUser()
  const { mutateAsync: updateEmail, isPending: isEmailUpdatePending } = useUpdateEmail()
  async function submitForm(values: FormValues) {
    if (values.newUsername === username) {
      setError('newUsername', {
        message: 'The new username is the same as the current username.',
      })
      return
    }

    const { error } = await updateUser({
      data: {
        username: values.newUsername,
      },
    })
    if (error) {
      setError('newUsername', {
        message: error.message,
      })
    }
  }

  async function submitEmailForm(values: FormValues) {
    const { error } = await updateEmail({
      email: values.email,
    })
    if (error) {
      setError('email', {
        message: error.message,
      })
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {username ? (<div>
        <div className="mb-3 border-b pb-1.5 text-xl">
          {t('change_username')}
        </div>
        <div className="flex w-full">
          <Form {...form}>
            <form
              onSubmit={handleSubmit(submitForm)}
              className="w-full space-y-4"
            >
              <FormField
                control={form.control}
                name="newUsername"
                rules={{
                  required: 'The Username is required.',
                  minLength: { value: 3, message: 'The Username must be at least 3 characters.' },
                }}
                render={({ field }) => (
                  <FormItem
                    className="max-w-48"
                  >
                    <FormLabel>{t('Name')}</FormLabel>
                    <FormControl>
                      <InputWrapper>
                        <Input
                          type="text"
                          placeholder=""
                          autoComplete="off"
                          {...field}
                          {...register('newUsername')}
                          className="text-base md:text-sm"
                        />
                      </InputWrapper>
                    </FormControl>
                    <FormMessage>{errors.newUsername?.message ?? ''}</FormMessage>
                  </FormItem>
                )}
              />
              <FormMessage>{errors.root?.serverError?.message}</FormMessage>
              <Button
                className="mt-8 gap-1.5"
                type="submit"
                disabled={isUsernameUpdatePending}
              >
                {t('confirm_changes')}
                { isUsernameUpdatePending ? (
                  <Icon
                    icon="lucide:loader-2"
                    className="animate-spin"
                  />
                ) : null}
              </Button>
            </form>
          </Form>
        </div>
      </div>) : null}
      <div>
        <div className="mb-3 border-b pb-1.5 text-xl">
          {t('Change email')}
        </div>
        <div className="flex w-full">
          <Form {...form}>
            <form
              onSubmit={handleSubmit(submitEmailForm)}
              className="w-full space-y-4"
            >
              <FormField
                control={form.control}
                name="email"
                rules={{
                  required: 'The email is required.',
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('Email')}</FormLabel>
                    <FormControl
                      className="max-w-48"
                    >
                      <InputWrapper>
                        <Input
                          type="text"
                          placeholder=""
                          autoComplete="off"
                          {...field}
                          {...register('email')}
                          className="text-base md:text-sm"
                        />
                      </InputWrapper>
                    </FormControl>
                    <FormMessage>{errors.email?.message ?? ''}</FormMessage>
                    {email.endsWith(import.meta.env.VITE_LEGACY_USER_EMAIL_SUFFIX) ? (
                      <article className="prose-sm">
                        <span className="text-neutral-700">
                          * This is an auto-generated placeholder email address.
                        </span>
                      </article>
                    ) : null}
                  </FormItem>
                )}
              />
              <FormMessage>{errors.root?.serverError?.message}</FormMessage>
              <Button
                className="mt-8 gap-1.5"
                type="submit"
                disabled={isEmailUpdatePending}
              >
                {t('confirm_changes')}
                { isEmailUpdatePending ? (
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
