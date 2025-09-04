'use client'

import { standardSchemaResolver as zodResolver } from '@hookform/resolvers/standard-schema'
import { useMutation } from '@tanstack/react-query'
import ms from 'ms'
import { useRouter } from 'next/navigation'
import { Fragment, startTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod/v4-mini'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { bindApply } from '@sub-vocab/utils/lib'

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
  const supabase = createClient()
  const { mutateAsync: resetPasswordForEmail, isPending } = useMutation({
    mutationKey: ['resetPasswordForEmail'],
    mutationFn: bindApply(supabase.auth.resetPasswordForEmail, supabase.auth),
  })
  const router = useRouter()

  const formDefaultValues = {
    email: '',
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
        }),
    ),
  })

  const {
    handleSubmit,
    formState: { errors },
  } = form

  async function onSubmit(values: FormValues) {
    const { error } = await resetPasswordForEmail([values.email])
    if (!error) {
      toast(<ResetEmailNotification />, {
        duration: ms('1min'),
      })
      startTransition(() => {
        router.push('/login')
      })
    }
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
                    <FormMessage>{errors.root?.serverError?.message}</FormMessage>
                    <Button
                      className="group gap-1.5"
                      type="submit"
                      disabled={isPending}
                    >
                      Send Reset Email
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
