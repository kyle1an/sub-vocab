'use client'

import { standardSchemaResolver as zodResolver } from '@hookform/resolvers/standard-schema'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod/v4-mini'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PASSWORD_MIN_LENGTH } from '@/constants/constraints'
import { supabaseAuth } from '@/utils/supabase'
import { bindApply } from '@sub-vocab/utils/lib'

export default function Password() {
  const { t } = useTranslation()
  const { mutateAsync: signOut } = useMutation({
    mutationKey: ['signOut'],
    mutationFn: bindApply(supabaseAuth.signOut, supabaseAuth),
  })

  const formDefaultValues = {
    newPassword: '',
  }
  type FormValues = typeof formDefaultValues
  const form = useForm<FormValues>({
    defaultValues: formDefaultValues,
    reValidateMode: 'onSubmit',
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

  return (
    <div className="flex flex-col gap-3">
      <div>
        <div className="mb-3 border-b pb-1.5 text-xl">
          {t('changePassword')}
        </div>
        <div className="flex">
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
                      <div className="flex gap-1">
                        <div>
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
                            <svg
                              className="icon-[lucide--eye] size-4.5 text-neutral-600"
                            />
                          ) : (
                            <svg
                              className="icon-[lucide--eye-off] size-4.5 text-neutral-600"
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
                  <svg className="icon-[lucide--loader-2] animate-spin" />
                ) : null}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}
