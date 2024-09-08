import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { useSignIn, useSignInWithUsername } from '@/api/user'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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

const emailSchema = z.string().email()

function isValidEmail(username: string): boolean {
  const result = emailSchema.safeParse(username)
  return result.success
}

export function Login() {
  const formDefaultValues = {
    username: '',
    password: '',
  }
  type FormValues = typeof formDefaultValues
  const form = useForm<FormValues>({
    defaultValues: formDefaultValues,
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
  const { mutateAsync: signInAsync, isPending: isSignInPending } = useSignIn()
  const { mutateAsync: signInWithUsernameAsync, isPending: isSignInWithUsernameAsyncPending } = useSignInWithUsername()
  const navigate = useNavigate()
  const isPending = isSignInPending || isSignInWithUsernameAsyncPending

  function signIn(values: FormValues) {
    setPasswordVisible(false)
    if (isValidEmail(values.username)) {
      return signInAsync({
        email: values.username,
        password: values.password,
      })
    } else {
      return signInWithUsernameAsync({
        username: values.username,
        password: values.password,
      })
    }
  }

  async function onSubmit(values: FormValues) {
    const { error } = await signIn(values)
    if (error) {
      setError('root.serverError', {
        message: error.message,
      })
      setError('username', {
        message: '',
      })
      setError('password', {
        message: '',
      })
      return
    }
    navigate('/')
  }

  return (
    <div className="flex flex-row">
      <div className="mx-auto py-6">
        <section className="py-5">
          <div className="mx-auto flex flex-col items-center justify-center px-6 py-8 lg:py-0">
            <Card className="w-full rounded-lg sm:max-w-md md:mt-0 xl:p-0">
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
                          <FormLabel>Email or username</FormLabel>
                          <FormControl>
                            <InputWrapper>
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
                            </InputWrapper>
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
                              <InputWrapper className="grow">
                                <Input
                                  type={passwordVisible ? 'text' : 'password'}
                                  autoComplete="current-password"
                                  placeholder=""
                                  {...field}
                                  {...register('password')}
                                  className="text-base md:text-sm"
                                />
                              </InputWrapper>
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
            </Card>
          </div>
        </section>
      </div>
    </div>
  )
}
