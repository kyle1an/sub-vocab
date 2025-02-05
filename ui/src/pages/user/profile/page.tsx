import type { ZodObj } from '@ui/src/types/utils'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useUpdateEmail, useUpdateUser } from '@/api/user'
import { USERNAME_MIN_LENGTH } from '@/constants/constraints'
import { env } from '@/env'
import { sessionAtom } from '@/store/useVocab'

export function ProfilePage() {
  const { t } = useTranslation()
  const [session] = useAtom(sessionAtom)
  const username = session?.user?.user_metadata?.username || ''
  const email = session?.user?.email || ''
  const usernameFormDefaultValues = {
    newUsername: username,
  }
  const emailFormDefaultValues = {
    newEmail: email,
  }

  type UsernameFormValues = typeof usernameFormDefaultValues

  const usernameForm = useForm<UsernameFormValues>({
    defaultValues: usernameFormDefaultValues,
    reValidateMode: 'onSubmit',
    resolver: zodResolver(
      z
        .object<ZodObj<UsernameFormValues>>({
          newUsername: z
            .string()
            .min(1, {
              message: 'Username is required',
            })
            .min(USERNAME_MIN_LENGTH, {
              message: `Username should be at least ${USERNAME_MIN_LENGTH} characters.`,
            })
            .refine((val) => val !== username, {
              message: 'The new username is the same as the current username.',
            }),
        }),
    ),
  })

  const {
    register: registerUsernameForm,
    handleSubmit: handleUsernameFormSubmit,
    formState: { errors: usernameErrors },
    setError: setUsernameFormError,
  } = usernameForm

  const { mutateAsync: updateUser, isPending: isUsernameUpdatePending } = useUpdateUser()
  const { mutateAsync: updateEmail, isPending: isEmailUpdatePending } = useUpdateEmail()

  async function submitUsernameForm(values: UsernameFormValues) {
    const { error } = await updateUser({
      data: {
        username: values.newUsername,
      },
    })
    if (error) {
      setUsernameFormError('newUsername', {
        message: error.message,
      })
    }
  }

  type EmailFormValues = typeof emailFormDefaultValues

  const emailForm = useForm<EmailFormValues>({
    defaultValues: emailFormDefaultValues,
    reValidateMode: 'onSubmit',
    resolver: zodResolver(
      z
        .object<ZodObj<EmailFormValues>>({
          newEmail: z
            .string()
            .min(1, {
              message: 'Email is required',
            })
            .email()
            .refine((val) => val !== email, {
              message: 'The new email is the same as the current email.',
            }),
        }),
    ),
  })

  const {
    register: registerEmailForm,
    handleSubmit: handleEmailFormSubmit,
    formState: { errors: emailErrors },
    setError: setEmailFormError,
  } = emailForm

  async function submitEmailForm(values: EmailFormValues) {
    const { error } = await updateEmail({
      email: values.newEmail,
    })
    if (error) {
      setEmailFormError('newEmail', {
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
          <Form {...usernameForm}>
            <form
              onSubmit={handleUsernameFormSubmit(submitUsernameForm)}
              className="space-y-4"
            >
              <FormField
                control={usernameForm.control}
                name="newUsername"
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
                            {...registerUsernameForm('newUsername')}
                            className="text-base md:text-sm"
                          />
                        </InputWrapper>
                      </div>
                    </FormControl>
                    <FormMessage>{usernameErrors.newUsername?.message ?? ''}</FormMessage>
                  </FormItem>
                )}
              />
              <FormMessage>{usernameErrors.root?.serverError?.message}</FormMessage>
              <Button
                className="group mt-8 gap-1.5"
                type="submit"
                disabled={isUsernameUpdatePending}
              >
                {t('confirm_changes')}
                <IconLucideLoader2
                  className={clsx(
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
          <Form {...emailForm}>
            <form
              onSubmit={handleEmailFormSubmit(submitEmailForm)}
              className="space-y-4"
            >
              <FormField
                control={emailForm.control}
                name="newEmail"
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
                            {...registerEmailForm('newEmail')}
                            className="text-base md:text-sm"
                          />
                        </InputWrapper>
                      </div>
                    </FormControl>
                    <FormMessage>{emailErrors.newEmail?.message ?? ''}</FormMessage>
                    {email.endsWith(env.VITE_LEGACY_USER_EMAIL_SUFFIX) ? (
                      <article className="text-sm">
                        <span className="text-neutral-700">
                          * This is an auto-generated placeholder email address.
                        </span>
                      </article>
                    ) : null}
                  </FormItem>
                )}
              />
              <FormMessage>{emailErrors.root?.serverError?.message}</FormMessage>
              <Button
                className="group mt-8 gap-1.5"
                type="submit"
                disabled={isEmailUpdatePending}
              >
                {t('confirm_changes')}
                <IconLucideLoader2
                  className="animate-spin group-[:not(disabled)]:hidden"
                />
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}
