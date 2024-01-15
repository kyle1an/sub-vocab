import { useForm } from 'react-hook-form'
import { useEffect, useState } from 'react'
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
import { useIsUsernameTaken, useRegister } from '@/api/user'

type FormValues = {
  username: string
  password: string
}

export function SignUp() {
  const form = useForm<FormValues>({
    defaultValues: {
      username: '',
      password: '',
    },
    reValidateMode: 'onSubmit',
  })

  const {
    register, trigger, handleSubmit, formState: { errors }, setError,
  } = form

  const [passwordVisible, setPasswordVisible] = useState(false)
  const { mutateAsync: isUsernameTaken, isError: isUsernameTakenError, isPending: isUsernameTakenPending } = useIsUsernameTaken()
  const { mutateAsync: signUp, isError: isRegisterError, isPending } = useRegister()
  const navigate = useNavigate()

  async function onSubmit(values: FormValues) {
    const { username, password } = values
    setPasswordVisible(false)
    const usernameTaken = await isUsernameTaken({
      username,
    })
    if (usernameTaken.has) {
      setError('username', {
        message: 'The username is taken.',
      })
      return
    }

    const resAuth = await signUp({
      username,
      password,
    })

    if (resAuth[0].result === 1) {
      navigate('/login')
    } else {
      setError('root.serverError', {
        message: 'Something went wrong, please try again later',
      })
    }
  }

  useEffect(() => {
    if (isUsernameTakenError) {
      setError('username', {
        message: 'Something went wrong, please try again later',
      })
    }
  }, [isUsernameTakenError, setError])

  useEffect(() => {
    if (isRegisterError) {
      setError('root.serverError', {
        message: 'Something went wrong, please try again later',
      })
    }
  }, [isRegisterError, setError])

  return (
    <div className="flex flex-row">
      <div className="mx-auto py-6">
        <section className="py-5">
          <div className="mx-auto flex flex-col items-center justify-center px-6 py-8 lg:py-0">
            <div className="w-full rounded-lg bg-white shadow dark:border sm:max-w-md md:mt-0 xl:p-0">
              <div className="max-w-80 space-y-4 p-6 sm:px-8 sm:py-7 md:w-80 md:space-y-6">
                <h1 className="text-xl/tight font-bold text-gray-900 md:text-2xl">
                  Sign Up
                </h1>
                <Form {...form}>
                  <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="username"
                      rules={{
                        required: 'The Username is required.',
                        minLength: { value: 3, message: 'The Username must be at least 3 characters.' },
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder=""
                              autoComplete="username"
                              {...field}
                              {...register('username')}
                              onBlur={() => {
                                if (form.formState.isDirty) {
                                  trigger('username').catch(console.error)
                                }
                              }}
                              className="text-base md:text-sm"
                            />
                          </FormControl>
                          <FormMessage>{errors.username?.message ?? ''}</FormMessage>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      rules={{
                        required: 'The password is required.',
                        minLength: { value: 8, message: 'The password must be at least 8 characters.' },
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-1">
                              <Input
                                type={passwordVisible ? 'text' : 'password'}
                                autoComplete="new-password"
                                placeholder=""
                                {...field}
                                {...register('password')}
                                className="text-base md:text-sm"
                              />
                              <Button
                                variant="outline"
                                className="bg-white px-2"
                                aria-checked={passwordVisible}
                                onClick={(e) => {
                                  e.preventDefault()
                                  setPasswordVisible(!passwordVisible)
                                }}
                              >
                                {passwordVisible ? (
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
                          <FormMessage>{errors.password?.message ?? ''}</FormMessage>
                        </FormItem>
                      )}
                    />
                    <FormMessage>{errors.root?.serverError.message}</FormMessage>
                    <Button
                      className="mt-8 gap-1.5"
                      type="submit"
                      disabled={isUsernameTakenPending || isPending}
                    >
                      Create account
                      {isUsernameTakenPending || isPending ? (
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
        </section>
      </div>
    </div>
  )
}
