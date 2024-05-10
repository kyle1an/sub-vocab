import { useForm } from 'react-hook-form'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@/components/ui/icon'
import { useSignIn } from '@/api/user'
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

type FormValues = {
  username: string
  password: string
}

export default function Login() {
  const form = useForm<FormValues>({
    defaultValues: {
      username: '',
      password: '',
    },
    reValidateMode: 'onSubmit',
  })

  const {
    register,
    trigger,
    handleSubmit,
    formState: { errors },
    setError,
  } = form
  const [passwordVisible, setPasswordVisible] = useState(false)
  const { mutateAsync: signInAsync, isError, isPending } = useSignIn()
  const navigate = useNavigate()

  async function onSubmit(values: FormValues) {
    setPasswordVisible(false)
    const resAuth = await signInAsync({
      username: values.username,
      password: values.password,
    })

    if (resAuth[0]) {
      navigate('/')
    } else {
      setError('root.serverError', {
        message: 'The username/password is incorrect.',
      })
      setError('username', {
        message: '',
      })
      setError('password', {
        message: '',
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
    <div className="flex flex-row">
      <div className="mx-auto py-6">
        <section className="py-5">
          <div className="mx-auto flex flex-col items-center justify-center px-6 py-8 lg:py-0">
            <div className="w-full rounded-lg bg-white shadow dark:border dark:bg-zinc-900 sm:max-w-md md:mt-0 xl:p-0">
              <div className="max-w-80 space-y-4 p-6 sm:px-8 sm:py-7 md:w-80 md:space-y-6">
                <h1 className="text-xl/tight font-bold md:text-2xl">
                  Sign in
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
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              autoComplete="username"
                              placeholder=""
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
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-1">
                              <Input
                                type={passwordVisible ? 'text' : 'password'}
                                autoComplete="current-password"
                                placeholder=""
                                {...field}
                                {...register('password')}
                                className="text-base md:text-sm"
                              />
                              <Button
                                variant="outline"
                                className="px-2"
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

                        </FormItem>
                      )}
                    />
                    <FormMessage>{errors.root?.serverError?.message}</FormMessage>
                    <Button
                      className="mt-8 gap-1.5"
                      type="submit"
                      disabled={isPending}
                    >
                      Sign in
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
        </section>
      </div>
    </div>
  )
}
