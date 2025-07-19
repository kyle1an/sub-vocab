import { standardSchemaResolver as zodResolver } from '@hookform/resolvers/standard-schema'
import { useMutation } from '@tanstack/react-query'
import { useAtom } from 'jotai'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Navigate } from 'react-router'
import { z } from 'zod/v4-mini'
import IconLucideEye from '~icons/lucide/eye'
import IconLucideEyeOff from '~icons/lucide/eye-off'
import IconLucideLoader2 from '~icons/lucide/loader2'

import { ContentRoot } from '@/components/content-root'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PASSWORD_MIN_LENGTH } from '@/constants/constraints'
import { bindApply } from '@/lib/bindApply'
import { authChangeEventAtom, sessionAtom, supabaseAuth } from '@/store/useVocab'

export default function UpdatePassword() {
  const { t } = useTranslation()
  const { mutateAsync: signOut } = useMutation({
    mutationKey: ['signOut'],
    mutationFn: bindApply(supabaseAuth.signOut, supabaseAuth),
  })
  const [session] = useAtom(sessionAtom)
  const user = session?.user

  const formDefaultValues = {
    newPassword: '',
  }
  type FormValues = typeof formDefaultValues
  const form = useForm<FormValues>({
    defaultValues: formDefaultValues,
    reValidateMode: 'onBlur',
    resolver: zodResolver(
      z
        .object({
          newPassword: z
            .string()
            .check(z.minLength(1, {
              error: 'Password is required',
            }), z.minLength(PASSWORD_MIN_LENGTH, {
              error: `Password should be at least ${PASSWORD_MIN_LENGTH} characters.`,
            })),
        }),
    ),
  })

  const {
    handleSubmit,
    formState: { errors },
    setError,
  } = form

  const [newPasswordVisible, setNewPasswordVisible] = useState(false)
  const { mutateAsync: updatePassword, isPending } = useMutation({
    mutationKey: ['updatePassword'],
    mutationFn: bindApply(supabaseAuth.updateUser, supabaseAuth),
  })

  async function onSubmit(values: FormValues) {
    setNewPasswordVisible(false)
    const { error } = await updatePassword([{
      password: values.newPassword,
    }])
    if (error) {
      setError('root.serverError', {
        message: error.message,
      })
      return
    }
    signOut([{ scope: 'local' }])
  }

  const [authChangeEvent] = useAtom(authChangeEventAtom)
  if (!authChangeEvent)
    return null

  if (!user)
    return <Navigate to="/login" />

  return (
    <ContentRoot>
      <div className="mx-auto py-6">
        <section className="py-5">
          <div className="mx-auto flex flex-col items-center justify-center px-6 py-8 lg:py-0">
            <Card className="w-full sm:max-w-md md:mt-0 xl:p-0">
              <div className="max-w-80 space-y-4 p-6 sm:px-8 sm:py-7 md:w-80 md:space-y-6">
                <h1 className="text-xl/tight font-bold md:text-2xl">
                  Update Password
                </h1>
                <Form {...form}>
                  <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('New Password')}</FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-1">
                              <div className="grow">
                                <Input
                                  type={newPasswordVisible ? 'text' : 'password'}
                                  autoComplete="new-password"
                                  {...field}
                                  className="text-base md:text-sm"
                                />
                              </div>
                              <Button
                                variant="outline"
                                className="px-2!"
                                aria-checked={newPasswordVisible}
                                onClick={(e) => {
                                  e.preventDefault()
                                  setNewPasswordVisible(!newPasswordVisible)
                                }}
                              >
                                {newPasswordVisible ? (
                                  <IconLucideEye
                                    className="size-4.5 text-neutral-600"
                                  />
                                ) : (
                                  <IconLucideEyeOff
                                    className="size-4.5 text-neutral-600"
                                  />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage>{errors.newPassword?.message ?? ''}</FormMessage>
                        </FormItem>
                      )}
                    />
                    <FormMessage>{errors.root?.serverError?.message}</FormMessage>
                    <Button
                      className="gap-1.5"
                      type="submit"
                      disabled={isPending}
                    >
                      {t('confirm_changes')}
                      {isPending ? (
                        <IconLucideLoader2
                          className="animate-spin"
                        />
                      ) : null}
                    </Button>
                  </form>
                </Form>
              </div>
            </Card>
          </div>
        </section>
      </div>
    </ContentRoot>
  )
}
