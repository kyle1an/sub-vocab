'use client'

import { standardSchemaResolver as zodResolver } from '@hookform/resolvers/standard-schema'
import { useMutation } from '@tanstack/react-query'
import { useAtom } from 'jotai'
import Link from 'next/link'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod/v4-mini'

import type { ZodObj } from '@/types/utils'

import { useSignInWithUsername } from '@/api/user'
import { authChangeEventAtom, userAtom } from '@/atoms/auth'
import { ContentRoot } from '@/components/content-root'
import Navigate from '@/components/Navigate'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { bindApply } from '@sub-vocab/utils/lib'

export default function Login() {
  const [user] = useAtom(userAtom)
  const [passwordVisible, setPasswordVisible] = useState(false)
  const supabase = createClient()
  const { mutateAsync: signInWithPassword, isPending: isPendingEmailSignIn } = useMutation({
    mutationKey: ['signInWithPassword'],
    mutationFn: bindApply(supabase.auth.signInWithPassword, supabase.auth),
  })
  const { mutateAsync: signInWithUsername, isPending: isPendingUsernameSignIn } = useSignInWithUsername()
  const formDefaultValues = {
    username: '',
    password: '',
  }
  type FormValues = typeof formDefaultValues
  const form = useForm<FormValues>({
    defaultValues: formDefaultValues,
    mode: 'onBlur',
    resolver: zodResolver(
      z
        .object({
          username: z
            .string()
            .check(z.minLength(1, {
              error: 'Username is required',
            })),
          password: z
            .string()
            .check(z.minLength(1, {
              error: 'Password is required',
            })),
        } satisfies ZodObj<FormValues>),
    ),
  })
  const [authChangeEvent] = useAtom(authChangeEventAtom)
  if (!authChangeEvent) {
    return null
  }

  if (user) {
    return <Navigate to="/" />
  }

  const {
    handleSubmit,
    formState: { errors },
    setError,
  } = form
  const isPending = isPendingEmailSignIn || isPendingUsernameSignIn

  function signIn({ username, password }: FormValues) {
    if (z.email().safeParse(username).success) {
      return signInWithPassword([{
        email: username,
        password,
      }])
    } else {
      return signInWithUsername({
        username,
        password,
      })
    }
  }

  async function onSubmit(values: FormValues) {
    setPasswordVisible(false)
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
    }
  }

  return (
    <ContentRoot className="items-start">
      <div className="mx-auto py-6">
        <section className="py-5">
          <div className="mx-auto flex flex-col items-center justify-center px-6 py-8 lg:py-0">
            <Card className="w-full sm:max-w-md md:mt-0 xl:p-0">
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
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email or username</FormLabel>
                          <FormControl>
                            <div>
                              <Input
                                type="text"
                                autoComplete="username"
                                {...field}
                                className="text-base md:text-sm"
                              />
                            </div>
                          </FormControl>
                          <FormMessage>{errors.username?.message ?? ''}</FormMessage>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="inline-flex w-full text-sm">
                            <span className="grow">
                              Password
                            </span>
                            <Link
                              href="/reset-password"
                              className="text-foreground opacity-60"
                            >
                              Forgot password?
                            </Link>
                          </FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-1">
                              <div className="grow">
                                <Input
                                  type={passwordVisible ? 'text' : 'password'}
                                  autoComplete="current-password"
                                  {...field}
                                  className="text-base md:text-sm"
                                />
                              </div>
                              <Button
                                variant="outline"
                                className="px-2!"
                                aria-checked={passwordVisible}
                                onClick={(e) => {
                                  e.preventDefault()
                                  setPasswordVisible(!passwordVisible)
                                }}
                              >
                                {passwordVisible ? (
                                  <svg className="icon-[lucide--eye] size-4.5 text-neutral-600" />
                                ) : (
                                  <svg className="icon-[lucide--eye-off] size-4.5 text-neutral-600" />
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
                      className="group gap-1.5"
                      type="submit"
                      disabled={isPending}
                    >
                      Sign in
                      <svg className="icon-[lucide--loader-2] hidden animate-spin group-disabled:block" />
                    </Button>
                  </form>
                </Form>
              </div>
            </Card>
          </div>
        </section>
      </div>
    </ContentRoot>
  )
}
