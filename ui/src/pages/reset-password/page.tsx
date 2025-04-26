import { zodResolver } from '@hookform/resolvers/zod'
import { useAtom } from 'jotai'
import { startTransition } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { z } from 'zod'
import IconLucideLoader2 from '~icons/lucide/loader2'

import type { ZodObj } from '@/types/utils'

import { useResetPasswordForEmail } from '@/api/user'
import { ContentRoot } from '@/components/content-root'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { MS_PER_MINUTE } from '@/constants/time'
import { authChangeEventAtom, sessionAtom } from '@/store/useVocab'

function ResetEmailNotification() {
  return (
    <div className="flex w-full flex-col gap-1">
      <div className="flex flex-row justify-between">
        <div>
          If you registered using your email and password, you will receive a password reset email.
        </div>
      </div>
    </div>
  )
}

export default function ResetPassword() {
  const [session] = useAtom(sessionAtom)
  const user = session?.user
  const { mutateAsync: resetPasswordForEmail, isPending } = useResetPasswordForEmail()
  const navigate = useNavigate()

  const formDefaultValues = {
    email: '',
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
        }),
    ),
  })
  const [authChangeEvent] = useAtom(authChangeEventAtom)
  if (!authChangeEvent)
    return null

  if (user)
    return <Navigate to="/" />

  const {
    handleSubmit,
    formState: { errors },
  } = form

  async function onSubmit(values: FormValues) {
    const { error } = await resetPasswordForEmail(values.email)
    if (!error) {
      toast(<ResetEmailNotification />, {
        duration: MS_PER_MINUTE,
      })
      startTransition(() => {
        navigate('/login')
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
                  Reset Your Password
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
                    <FormMessage>{errors.root?.serverError?.message}</FormMessage>
                    <Button
                      className="mt-8 gap-1.5"
                      type="submit"
                      disabled={isPending}
                    >
                      Send Reset Email
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
    </ContentRoot>
  )
}
