'use client'

import { standardSchemaResolver as zodResolver } from '@hookform/resolvers/standard-schema'
import { useMutation } from '@tanstack/react-query'
import { useAtom } from 'jotai'
import { useForm } from 'react-hook-form'
import { z } from 'zod/v4-mini'

import { userAtom } from '@/atoms/auth'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { USERNAME_MIN_LENGTH } from '@/constants/constraints'
import { env } from '@/env'
import { createClient } from '@/lib/supabase/client'
import { useI18n } from '@/locales/client'
import { bindApply } from '@sub-vocab/utils/lib'

export default function ProfilePage() {
  const t = useI18n()
  const [user] = useAtom(userAtom)
  const username = user?.user_metadata?.username || ''
  const email = user?.email || ''
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
        .object({
          newUsername: z
            .string()
            .check(z.minLength(1, {
              error: 'Username is required',
            }), z.minLength(USERNAME_MIN_LENGTH, {
              error: `Username should be at least ${USERNAME_MIN_LENGTH} characters.`,
            }), z.refine((val) => val !== username, {
              error: 'The new username is the same as the current username.',
            })),
        }),
    ),
  })

  const {
    register: registerUsernameForm,
    handleSubmit: handleUsernameFormSubmit,
    formState: { errors: usernameErrors },
    setError: setUsernameFormError,
  } = usernameForm

  const supabase = createClient()
  const { mutateAsync: updateUsername, isPending: isUsernameUpdatePending } = useMutation({
    mutationKey: ['updateUsername'],
    mutationFn: bindApply(supabase.auth.updateUser, supabase.auth),
  })
  const { mutateAsync: updateEmail, isPending: isEmailUpdatePending } = useMutation({
    mutationKey: ['updateEmail'],
    mutationFn: bindApply(supabase.auth.updateUser, supabase.auth),
  })

  async function submitUsernameForm(values: UsernameFormValues) {
    const { error } = await updateUsername([{
      data: {
        username: values.newUsername,
      },
    }])
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
        .object({
          newEmail: z
            .email()
            .check(z.refine((val) => val !== email, {
              error: 'The new email is the same as the current email.',
            })),
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
    const { error } = await updateEmail([{
      email: values.newEmail,
    }])
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
                        <div>
                          <Input
                            type="text"
                            placeholder=""
                            autoComplete="username"
                            {...field}
                            {...registerUsernameForm('newUsername')}
                            className="text-base md:text-sm"
                          />
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage>{usernameErrors.newUsername?.message ?? ''}</FormMessage>
                  </FormItem>
                )}
              />
              <FormMessage>{usernameErrors.root?.serverError?.message}</FormMessage>
              <Button
                className="group gap-1.5"
                type="submit"
                disabled={isUsernameUpdatePending}
              >
                {t('confirm_changes')}
                <svg className="icon-[lucide--loader-2] hidden animate-spin group-disabled:block" />
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
                        <div>
                          <Input
                            type="text"
                            placeholder=""
                            autoComplete="email"
                            {...field}
                            {...registerEmailForm('newEmail')}
                            className="text-base md:text-sm"
                          />
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage>{emailErrors.newEmail?.message ?? ''}</FormMessage>
                    {email.endsWith(env.NEXT_PUBLIC_LEGACY_USER_EMAIL_SUFFIX) ? (
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
                className="group gap-1.5"
                type="submit"
                disabled={isEmailUpdatePending}
              >
                {t('confirm_changes')}
                <svg className="icon-[lucide--loader-2] hidden animate-spin group-disabled:block" />
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}
