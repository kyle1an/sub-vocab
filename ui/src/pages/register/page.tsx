import { zodResolver } from '@hookform/resolvers/zod'
import { useAtom } from 'jotai'
import { startTransition, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useNavigate } from 'react-router'
import { z } from 'zod'
import IconLucideEye from '~icons/lucide/eye'
import IconLucideEyeOff from '~icons/lucide/eye-off'
import IconLucideLoader2 from '~icons/lucide/loader2'

import type { ZodObj } from '@/types/utils'

import { useRegister } from '@/api/user'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input, InputWrapper } from '@/components/ui/input'
import { PASSWORD_MIN_LENGTH } from '@/constants/constraints'
import { authChangeEventAtom, sessionAtom } from '@/store/useVocab'

export default function Register() {
  const [session] = useAtom(sessionAtom)
  const user = session?.user
  const formDefaultValues = {
    email: '',
    password: '',
  }
  type FormValues = typeof formDefaultValues
  const form = useForm<FormValues>({
    defaultValues: formDefaultValues,
    mode: 'onBlur',
    resolver: zodResolver(
      z
        .object<ZodObj<FormValues>>({
          email: z
            .string()
            .min(1, {
              message: 'Email is required',
            })
            .email(),
          password: z
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

  const [passwordVisible, setPasswordVisible] = useState(false)
  const { mutateAsync: signUp, isPending } = useRegister()
  const navigate = useNavigate()
  const [authChangeEvent] = useAtom(authChangeEventAtom)
  if (!authChangeEvent)
    return null

  if (user)
    return <Navigate to="/" />

  async function onSubmit(values: FormValues) {
    const { email, password } = values
    setPasswordVisible(false)
    const { error } = await signUp({
      email,
      password,
    })

    if (error) {
      setError('root.serverError', {
        message: error.message,
      })
      return
    }
    startTransition(() => {
      navigate('/')
    })
  }

  return (
    <div className="flex flex-row">
      <div className="mx-auto py-6">
        <section className="py-5">
          <div className="mx-auto flex flex-col items-center justify-center px-6 py-8 lg:py-0">
            <Card className="w-full rounded-lg sm:max-w-md md:mt-0 xl:p-0">
              <div className="max-w-80 space-y-4 p-6 sm:px-8 sm:py-7 md:w-80 md:space-y-6">
                <h1 className="text-xl/tight font-bold md:text-2xl">
                  Sign up
                </h1>
                <Form {...form}>
                  <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <InputWrapper>
                              <Input
                                type="text"
                                autoComplete="username"
                                {...field}
                                className="text-base md:text-sm"
                              />
                            </InputWrapper>
                          </FormControl>
                          <FormMessage>{errors.email?.message ?? ''}</FormMessage>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-1">
                              <InputWrapper className="grow">
                                <Input
                                  type={passwordVisible ? 'text' : 'password'}
                                  autoComplete="new-password"
                                  {...field}
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
                          <FormMessage>{errors.password?.message ?? ''}</FormMessage>
                        </FormItem>
                      )}
                    />
                    <FormMessage>{errors.root?.serverError?.message}</FormMessage>
                    <Button
                      className="mt-8 gap-1.5"
                      type="submit"
                      disabled={isPending}
                    >
                      Create account
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
