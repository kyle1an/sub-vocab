import { useForm } from 'react-hook-form'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@/components/ui/icon'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useVocabStore } from '@/store/useVocab.ts'
import { useChangePassword, useLogOut } from '@/api/user'

type FormValues = {
  oldPassword: string
  newPassword: string
}

export const Password = () => {
  const { t } = useTranslation()
  const username = useVocabStore((state) => state.username)
  const navigate = useNavigate()
  const { mutateAsync: logOut } = useLogOut()

  function logout() {
    logOut({
      username,
    })
      .then((logOutRes) => {
        if (logOutRes?.success) {
          requestAnimationFrame(() => {
            navigate('/')
          })
        }
      })
      .catch(console.error)
  }

  const form = useForm<FormValues>({
    defaultValues: {
      oldPassword: '',
      newPassword: '',
    },
    reValidateMode: 'onSubmit',
  })

  const {
    register, handleSubmit, formState: { errors }, setError,
  } = form

  const [oldPasswordVisible, setOldPasswordVisible] = useState(false)
  const [newPasswordVisible, setNewPasswordVisible] = useState(false)
  const { mutateAsync: changePassword, isError, isPending } = useChangePassword()

  async function onSubmit(values: FormValues) {
    setOldPasswordVisible(false)
    setNewPasswordVisible(false)
    const res = await changePassword({
      username,
      oldPassword: values.oldPassword,
      newPassword: values.newPassword,
    })

    if (res.success) {
      logout()
    } else {
      setError('root.serverError', {
        message: 'Something went wrong.',
      })
    }
  }

  useEffect(() => {
    if (isError) {
      setError('root.serverError', {
        message: 'Something went wrong, please try again later',
      })
    }
  }, [isError, setError])

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
                name="oldPassword"
                rules={{
                  required: 'The password is required.',
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('Old Password')}</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-1">
                        <Input
                          type={oldPasswordVisible ? 'text' : 'password'}
                          autoComplete="current-password"
                          placeholder=""
                          {...field}
                          {...register('oldPassword')}
                          className="text-base md:text-sm"
                        />
                        <Button
                          variant="outline"
                          className="px-2"
                          aria-checked={oldPasswordVisible}
                          onClick={(e) => {
                            e.preventDefault()
                            setOldPasswordVisible(!oldPasswordVisible)
                          }}
                        >
                          {oldPasswordVisible ? (
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
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="newPassword"
                rules={{
                  required: 'The password is required.',
                  minLength: { value: 8, message: 'The password must be at least 8 characters.' },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('New Password')}</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-1">
                        <Input
                          type={newPasswordVisible ? 'text' : 'password'}
                          autoComplete="new-password"
                          placeholder=""
                          {...field}
                          {...register('newPassword')}
                          className="text-base md:text-sm"
                        />
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
              <FormMessage>{errors.root?.serverError.message}</FormMessage>
              <Button
                className="mt-8 gap-1.5"
                type="submit"
                disabled={isPending}
              >
                {t('Confirm Changes')}
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
