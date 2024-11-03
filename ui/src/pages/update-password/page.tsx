import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Navigate } from 'react-router'
import { z } from 'zod'

import type { ZodObj } from '@/types/utils'

import { useLogOut, useUpdateUser } from '@/api/user'
import { PASSWORD_MIN_LENGTH } from '@/constants/constraints'
import { authChangeEventAtom, sessionAtom } from '@/store/useVocab'

export function UpdatePassword() {
  const { t } = useTranslation()
  const { mutateAsync: logOut } = useLogOut()
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
        .object<ZodObj<FormValues>>({
          newPassword: z
            .string()
            .min(1, {
              message: 'Password is required',
            })
            .min(PASSWORD_MIN_LENGTH, {
              message: `Password should be at least ${PASSWORD_MIN_LENGTH} characters.`,
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

  const [authChangeEvent] = useAtom(authChangeEventAtom)
  if (!authChangeEvent) {
    return null
  }

  if (!user) {
    return <Navigate to="/login" />
  }

  return (
    <div className="flex flex-row">
      <div className="mx-auto py-6">
        <section className="py-5">
          <div className="mx-auto flex flex-col items-center justify-center px-6 py-8 lg:py-0">
            <Card className="w-full rounded-lg sm:max-w-md md:mt-0 xl:p-0">
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
                              <InputWrapper className="grow">
                                <Input
                                  type={newPasswordVisible ? 'text' : 'password'}
                                  autoComplete="new-password"
                                  {...field}
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
            </Card>
          </div>
        </section>
      </div>
    </div>
  )
}
