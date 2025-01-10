import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, Navigate } from 'react-router'
import { z } from 'zod'

import type { ZodObj } from '@/types/utils'

import { useSignInWithEmail, useSignInWithUsername } from '@/api/user'
import { authChangeEventAtom, sessionAtom } from '@/store/useVocab'

export function Login() {
  const [session] = useAtom(sessionAtom)
  const user = session?.user
  const [passwordVisible, setPasswordVisible] = useState(false)
  const { mutateAsync: signInWithEmailAsync, isPending: isPendingEmailSignIn } = useSignInWithEmail()
  const { mutateAsync: signInWithUsernameAsync, isPending: isPendingUsernameSignIn } = useSignInWithUsername()
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
  const [authChangeEvent] = useAtom(authChangeEventAtom)
  if (!authChangeEvent)
    return null

  if (user)
    return <Navigate to="/" />

  const {
    handleSubmit,
    formState: { errors },
    setError,
  } = form
  const isPending = isPendingEmailSignIn || isPendingUsernameSignIn

  function signIn({ username, password }: FormValues) {
    if (z.string().email().safeParse(username).success) {
      return signInWithEmailAsync({
        email: username,
        password,
      })
    }
    else {
      return signInWithUsernameAsync({
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
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email or username</FormLabel>
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
                            <Link
                              to="/reset-password"
                              className="text-foreground opacity-60"
                            >
                              Forgot password?
                            </Link>
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
                    <FormMessage>{errors.root?.serverError?.message}</FormMessage>
                    <Button
                      className="mt-8 gap-1.5"
                      type="submit"
                      disabled={isPending}
                    >
                      Sign in
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
