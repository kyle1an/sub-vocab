'use client'

import { standardSchemaResolver as zodResolver } from '@hookform/resolvers/standard-schema'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Fragment, startTransition, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod/v4-mini'

import { PASSWORD_MIN_LENGTH } from '@/app/[locale]/(auth)/_constants/constraints'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { bindApply } from '@sub-vocab/utils/lib'

export default function Register() {
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
        .object({
          email: z
            .email(),
          password: z
            .string()
            .check(z.minLength(1, {
              error: 'Password is required',
            }), z.minLength(PASSWORD_MIN_LENGTH, {
              error: `Password should be at least ${PASSWORD_MIN_LENGTH} characters.`,
            })),
        }),
    ),
  })

  const {
    handleSubmit,
    formState: { errors },
    setError,
  } = form

  const [passwordVisible, setPasswordVisible] = useState(false)
  const supabase = createClient()
  const { mutateAsync: signUp, isPending } = useMutation({
    mutationKey: ['signUp'],
    mutationFn: bindApply(supabase.auth.signUp, supabase.auth),
  })
  const router = useRouter()

  async function onSubmit(values: FormValues) {
    const { email, password } = values
    setPasswordVisible(false)
    const { error } = await signUp([{
      email,
      password,
    }])

    if (error) {
      setError('root.serverError', {
        message: error.message,
      })
      return
    }
    startTransition(() => {
      router.push('/')
    })
  }

  return (
    <Fragment>
      <Fragment>
        <Fragment>
          <Fragment>
            <Fragment>
              <Fragment>
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
                            <div>
                              <Input
                                type="text"
                                autoComplete="username"
                                {...field}
                                className="text-base md:text-sm"
                              />
                            </div>
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
                              <div className="grow">
                                <Input
                                  type={passwordVisible ? 'text' : 'password'}
                                  autoComplete="new-password"
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
                      Create account
                      <svg className="icon-[lucide--loader-2] hidden animate-spin group-disabled:block" />
                    </Button>
                  </form>
                </Form>
              </Fragment>
            </Fragment>
          </Fragment>
        </Fragment>
      </Fragment>
    </Fragment>
  )
}
