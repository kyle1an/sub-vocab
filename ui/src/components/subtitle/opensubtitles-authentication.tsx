import { zodResolver } from '@hookform/resolvers/zod'
import { useUnmountEffect } from '@react-hookz/web'
import { atom, useAtom } from 'jotai'
import { get } from 'lodash-es'
import { ResultAsync } from 'neverthrow'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import IconLucideEye from '~icons/lucide/eye'
import IconLucideEyeOff from '~icons/lucide/eye-off'
import IconLucideLoader2 from '~icons/lucide/loader2'

import type { ZodObj } from '@/types/utils'

import { osSessionAtom, useOpenSubtitlesLogin } from '@/api/opensubtitles'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input, InputWrapper } from '@/components/ui/input'

const osAuthAtom = atom({
  username: '',
  password: '',
})

export function OpensubtitlesAuthentication() {
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [osAuth, setOsAuth] = useAtom(osAuthAtom)
  const [osSession, setOsSession] = useAtom(osSessionAtom)
  const { mutateAsync, isPending } = useOpenSubtitlesLogin()
  const formDefaultValues = osAuth
  type FormValues = typeof formDefaultValues
  const form = useForm<FormValues>({
    defaultValues: formDefaultValues,
    mode: 'onBlur',
    resolver: zodResolver(
      z
        .object<ZodObj<FormValues>>({
          username: z
            .string()
            .min(1, {
              message: 'Username is required',
            }),
          password: z
            .string()
            .min(1, {
              message: 'Password is required',
            }),
        }),
    ),
  })

  const {
    handleSubmit,
    formState: { errors },
    setError,
  } = form

  async function onSubmit(values: FormValues) {
    setPasswordVisible(false)
    const result = await ResultAsync.fromPromise(mutateAsync(values), (e) => get(e, 'data.message') ?? get(e, 'message') ?? 'Error')
    if (result.isOk()) {
      setOsSession(result.value)
    }
    else {
      setError('root.serverError', {
        message: result.error,
      })
    }
  }

  useUnmountEffect(() => {
    setOsAuth(form.getValues())
  })

  return (
    <div className="grid gap-4">
      <div className="space-y-2">
        <h4 className="font-medium leading-none">
          Sign In to
          {' '}
          <a
            href="https://www.opensubtitles.com/users/sign_up"
            target="_blank"
            rel="noreferrer noopener"
            className="underline"
          >
            OpenSubtitles
          </a>
        </h4>
      </div>
      <div className="grid gap-2">
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
                  <FormLabel>Username</FormLabel>
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
                    <span className="flex-grow">
                      Password
                    </span>
                  </FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-1">
                      <InputWrapper className="grow">
                        <Input
                          type={passwordVisible ? 'text' : 'password'}
                          autoComplete="current-password"
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
            <FormMessage className="break-words">{errors.root?.serverError?.message}</FormMessage>
            <Button
              className="mt-8 gap-1.5"
              type="submit"
              disabled={isPending}
            >
              Get Token
              {isPending ? (
                <IconLucideLoader2
                  className="animate-spin"
                />
              ) : null}
            </Button>
          </form>
        </Form>
      </div>
      {osSession?.token ? (
        <div className="overflow-x-scroll">
          <span>{osSession.token}</span>
        </div>
      ) : null}
    </div>
  )
}
