import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { useLogOut, useUpdateUser } from '@/api/user'
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

export function Password() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { mutateAsync: logOut } = useLogOut()

  function logout() {
    logOut()
      .then((logOutRes) => {
        const { error } = logOutRes
        if (!error) {
          requestAnimationFrame(() => {
            navigate('/')
          })
        }
      })
      .catch(console.error)
  }

  const formDefaultValues = {
    newPassword: '',
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
    logout()
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <div className="mb-3 border-b pb-1.5 text-xl">
          {t('changePassword')}
        </div>
        <div className="flex w-80">
          <Form {...form}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="newPassword"
                rules={{
                  required: 'The password is required.',
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('New Password')}</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-1">
                        <InputWrapper>
                          <Input
                            type={newPasswordVisible ? 'text' : 'password'}
                            autoComplete="new-password"
                            placeholder=""
                            {...field}
                            {...register('newPassword')}
                            className="text-base md:text-sm"
                          />
                        </InputWrapper>
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
                            <Icon
                              icon="lucide:eye"
                              width={18}
                              className="text-neutral-600"
                            />
                          ) : (
                            <Icon
                              icon="lucide:eye-off"
                              width={18}
                              className="text-neutral-600"
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
