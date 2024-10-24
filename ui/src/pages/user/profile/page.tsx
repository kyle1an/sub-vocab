import { useForm } from 'react-hook-form'

import { useUpdateEmail, useUpdateUser } from '@/api/user'
import { env } from '@/env'
import { sessionAtom } from '@/store/useVocab'

export function ProfilePage() {
  const { t } = useTranslation()
  const [session] = useAtom(sessionAtom)
  const username = session?.user.user_metadata.username || ''
  const email = session?.user.email || ''
  const formDefaultValues = {
    newUsername: username,
    newEmail: email,
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
    if (values.newEmail === email) {
      setError('newEmail', {
        message: 'The new email is the same as the current email.',
      })
      return
    }
    const { error } = await updateEmail({
      email: values.newEmail,
    })
    if (error) {
      setError('newEmail', {
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
        <div className="flex">
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
                      <div className="flex">
                        <InputWrapper>
                          <Input
                            type="text"
                            placeholder=""
                            autoComplete="username"
                            {...field}
                            {...register('newUsername')}
                            className="text-base md:text-sm"
                          />
                        </InputWrapper>
                      </div>
                    </FormControl>
                    <FormMessage>{errors.newUsername?.message ?? ''}</FormMessage>
                  </FormItem>
                )}
              />
              <FormMessage>{errors.root?.serverError?.message}</FormMessage>
              <Button
                className="group mt-8 gap-1.5"
                type="submit"
                disabled={isUsernameUpdatePending}
              >
                {t('confirm_changes')}
                <IconLucideLoader2
                  className={cn(
                    'animate-spin group-[:not(disabled)]:hidden',
                  )}
                />
              </Button>
            </form>
          </Form>
        </div>
      </div>) : null}
      <div>
        <div className="mb-3 border-b pb-1.5 text-xl">
          Change email
        </div>
        <div className="flex">
          <Form {...form}>
            <form
              onSubmit={handleSubmit(submitEmailForm)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="newEmail"
                rules={{
                  required: 'The email is required.',
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="flex">
                        <InputWrapper>
                          <Input
                            type="text"
                            placeholder=""
                            autoComplete="email"
                            {...field}
                            {...register('newEmail')}
                            className="text-base md:text-sm"
                          />
                        </InputWrapper>
                      </div>
                    </FormControl>
                    <FormMessage>{errors.newEmail?.message ?? ''}</FormMessage>
                    {email.endsWith(env.VITE_LEGACY_USER_EMAIL_SUFFIX) ? (
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
                className="group mt-8 gap-1.5"
                type="submit"
                disabled={isEmailUpdatePending}
              >
                {t('confirm_changes')}
                <IconLucideLoader2
                  className={cn(
                    'animate-spin group-[:not(disabled)]:hidden',
                  )}
                />
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}
