import { useForm } from 'react-hook-form'
import { Icon } from '@iconify/react'
import { useState } from 'react'
import Cookies from 'js-cookie'
import { useTranslation } from 'react-i18next'
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
import { router } from '@/router'
import { useBearStore } from '@/store/useVocab.ts'
import {
  changePassword, logoutToken,
} from '@/api/user'

type FormValues = {
  oldPassword: string
  newPassword: string
}

export const Password = () => {
  const { t } = useTranslation()
  const user = useBearStore((state) => state.username)
  const setUsername = useBearStore((state) => state.setUsername)
  function logout() {
    logoutToken({
      username: user,
    })
      .then(() => {
        Cookies.remove('_user', { path: '' })
        Cookies.remove('acct', { path: '' })
        setUsername('')
        requestAnimationFrame(() => {
          router.navigate('/').catch(console.error)
        })
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
    register, trigger, handleSubmit, formState: { errors }, setError,
  } = form

  const [oldPasswordVisible, setOldPasswordVisible] = useState(false)
  const [newPasswordVisible, setNewPasswordVisible] = useState(false)

  async function onSubmit(values: FormValues) {
    setOldPasswordVisible(false)
    try {
      const res = await changePassword({
        username: user,
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
    } catch (e) {
      setError('root.serverError', {
        message: 'Something went wrong, please try again later',
      })
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <div className="mb-3 border-b pb-1.5 text-xl">
          {t('changePassword')}
        </div>
        <div className="flex w-80" >
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
                          className="bg-white px-2"
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
                          className="bg-white px-2"
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
                className="mt-8"
                type="submit"
              >
                {t('Confirm Changes')}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}
