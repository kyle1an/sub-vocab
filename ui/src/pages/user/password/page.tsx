import { standardSchemaResolver as zodResolver } from '@hookform/resolvers/standard-schema'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod/v4'
import IconLucideEye from '~icons/lucide/eye'
import IconLucideEyeOff from '~icons/lucide/eye-off'
import IconLucideLoader2 from '~icons/lucide/loader2'

import type { ZodObj } from '@/types/utils'

import { useLogOut, useUpdateUser } from '@/api/user'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PASSWORD_MIN_LENGTH } from '@/constants/constraints'

export default function Password() {
  const { t } = useTranslation()
  const { mutateAsync: logOut } = useLogOut()

  const formDefaultValues = {
    newPassword: '',
  }
  type FormValues = typeof formDefaultValues
  const form = useForm<FormValues>({
    defaultValues: formDefaultValues,
    reValidateMode: 'onSubmit',
    resolver: zodResolver(
      z
        .object<ZodObj<FormValues>>({
          newPassword: z
            .string()
            .min(1, {
              error: 'Password is required',
            })
            .min(PASSWORD_MIN_LENGTH, {
              error: `Password should be at least ${PASSWORD_MIN_LENGTH} characters.`,
            }),
        }),
    ),
  })

  const {
    handleSubmit,
    formState: { errors },
    setError,
  } = form

  const [newPasswordVisible, setNewPasswordVisible] = useState(false)
  const { mutateAsync: updateUser, isPending } = useUpdateUser()

  async function onSubmit(values: FormValues) {
    setNewPasswordVisible(false)
    const { error } = await updateUser({
      password: values.newPassword,
    })
    if (error) {
      setError('root.serverError', {
        message: error.message,
      })
      return
    }
    logOut()
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
                          className="px-2"
                          aria-checked={newPasswordVisible}
                          onClick={(e) => {
                            e.preventDefault()
                            setNewPasswordVisible(!newPasswordVisible)
                          }}
                        >
                          {newPasswordVisible ? (
                            <IconLucideEye
                              className="size-[18px] text-neutral-600"
                            />
                          ) : (
                            <IconLucideEyeOff
                              className="size-[18px] text-neutral-600"
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
                className="mt-8 gap-1.5"
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
      </div>
    </div>
  )
}
