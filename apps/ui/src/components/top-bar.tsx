import type React from 'react'

import { Slot } from '@radix-ui/react-slot'
import { useMutation } from '@tanstack/react-query'
import clsx from 'clsx'
import { Console, Effect } from 'effect'
import { useAtom } from 'jotai'
import { useEffect, useTransition } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { toast } from 'sonner'
import IconFaLanguage from '~icons/fa/language'
import IconLucideCog from '~icons/lucide/cog'
import IconMingcuteUser4Fill from '~icons/mingcute/user4-fill'
import IconSolarLogout2Outline from '~icons/solar/logout2-outline'

import { DEFAULT_THEME, THEMES } from '@/components/themes'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Menubar, MenubarContent, MenubarMenu, MenubarRadioGroup, MenubarRadioItem, MenubarTrigger } from '@/components/ui/menubar'
import { bindApply } from '@/lib/bindApply'
import { cn } from '@/lib/utils'
import { localeAtom, sessionAtom, supabaseAuth, themeAtom } from '@/store/useVocab'

const LOCALES = [
  {
    value: 'en',
    label: 'English',
  },
  {
    value: 'zh',
    label: '简体中文',
  },
] as const

function Account({ className, style, ...props }: React.ComponentProps<'a'>) {
  return (
    <Link
      to="/register"
      className={cn('inline-flex items-center gap-3', className)}
      {...props}
    >
      <IconLucideCog
        className="size-4"
      />
      <span>Account</span>
    </Link>
  )
}

function SignIn({ className, ...props }: React.ComponentProps<'a'>) {
  return (
    <Link
      to="/login"
      className={cn('inline-flex items-center gap-3', className)}
      {...props}
    >
      <IconMingcuteUser4Fill
        className="size-4"
      />
      <span>Sign in</span>
    </Link>
  )
}

function SignOut({ className, ...props }: React.ComponentProps<'button'>) {
  const { t } = useTranslation()
  const { mutateAsync: signOut } = useMutation({
    mutationKey: ['signOut'],
    mutationFn: bindApply(supabaseAuth.signOut, supabaseAuth),
  })

  const logout = () => Effect.runPromise(Effect.gen(function* () {
    const { error } = yield* Effect.tryPromise(() => signOut([{ scope: 'local' }]))
    if (error) {
      return yield* Effect.fail(error)
    }
  }).pipe(
    Effect.tapError(Console.error),
    Effect.catchAll((e) => Effect.gen(function* () {
      toast.error(e.message)
    })),
  ))

  return (
    <button
      type="button"
      className={cn('inline-flex items-center gap-3', className)}
      {...props}
      onClick={logout}
    >
      <IconSolarLogout2Outline
        className="size-4 -scale-x-100"
      />
      <span>
        {t('SignOut')}
      </span>
    </button>
  )
}

export function TopBar({ className }: { className?: string }) {
  const { t, i18n } = useTranslation()
  const [session] = useAtom(sessionAtom)
  const user = session?.user
  const account = user?.user_metadata?.username || user?.email || ''
  const [locale, updateLocale] = useAtom(localeAtom)
  const [themePreference, setThemePreference] = useAtom(themeAtom)
  const [isThemeTransitioning, startThemeTransition] = useTransition()

  useEffect(() => {
    i18n.changeLanguage(locale).catch(console.error)
  }, [locale, i18n, updateLocale])

  const avatarSource = `https://avatar.vercel.sh/${account}?size=${22}`

  return (
    <div
      className={cn(
        className,
      )}
    >
      <nav
        className={clsx(
          'group/nav z-20 w-full rounded-t-3xl bg-background',
        )}
      >
        <>
          <>
            <div>
              <div>
                <div className="flex h-11 items-center justify-between">
                  <div className="flex h-full items-center gap-2">
                    <Menubar className="h-full border-0 bg-transparent p-0 shadow-none">
                      <MenubarMenu>
                        <MenubarTrigger className="size-8 justify-center p-0">
                          <div className="flex h-full items-center">
                            <Slot
                              className="size-4.25 text-neutral-500 dark:text-neutral-400"
                            >
                              {THEMES.find((theme) => theme.value === themePreference)?.icon ?? DEFAULT_THEME.icon}
                            </Slot>
                          </div>
                        </MenubarTrigger>
                        <MenubarContent
                          className="min-w-0"
                          align="end"
                          sideOffset={3}
                        >
                          <MenubarRadioGroup
                            value={themePreference}
                            className={clsx(isThemeTransitioning && '[body:has(&)_*]:transition-none! [body:has(&)_*::after]:transition-none! [body:has(&)_*::before]:transition-none!')}
                          >
                            {THEMES.map((theme) => (
                              <MenubarRadioItem
                                key={theme.value}
                                value={theme.value}
                                disabled={theme.value === themePreference}
                                onSelect={() => {
                                  setThemePreference(theme.value)
                                  startThemeTransition(() => {})
                                }}
                              >
                                {theme.label}
                              </MenubarRadioItem>
                            ))}
                          </MenubarRadioGroup>
                        </MenubarContent>
                      </MenubarMenu>
                    </Menubar>

                    <Menubar className="h-full border-0 bg-transparent p-0 shadow-none">
                      <MenubarMenu>
                        <MenubarTrigger className="size-8 justify-center p-0">
                          <div className="flex h-full items-center">
                            <IconFaLanguage
                              className="size-4 text-neutral-500 dark:text-neutral-400"
                            />
                          </div>
                        </MenubarTrigger>
                        <MenubarContent
                          className="min-w-0"
                          align="end"
                          sideOffset={3}
                        >
                          <MenubarRadioGroup value={locale}>
                            {LOCALES.map((language) => (
                              <MenubarRadioItem
                                key={language.value}
                                value={language.value}
                                disabled={language.value === locale}
                                onSelect={() => {
                                  updateLocale(language.value)
                                }}
                              >
                                {language.label}
                              </MenubarRadioItem>
                            ))}
                          </MenubarRadioGroup>
                        </MenubarContent>
                      </MenubarMenu>
                    </Menubar>
                    <div className="flex size-8 items-center justify-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          asChild
                          className="flex size-8 p-0 select-none [--sq-r:.75rem]"
                        >
                          {user ? (
                            <Button variant="ghost">
                              <img
                                src={avatarSource}
                                alt="avatar"
                                className="rounded-full border"
                              />
                            </Button>
                          ) : (
                            <Button variant="ghost">
                              <IconMingcuteUser4Fill
                                className="size-5.5 text-neutral-500"
                              />
                            </Button>
                          )}
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          className="w-[unset] [&_[role=menuitem]]:p-0 [&_[role=menuitem]_svg]:text-neutral-600 [&_[role=menuitem]>*]:grow [&_[role=menuitem]>*]:px-2 [&_[role=menuitem]>*]:py-1.5"
                          align="end"
                        >
                          {user ? (
                            <>
                              <DropdownMenuLabel>
                                {account}
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuGroup>
                                <DropdownMenuItem>
                                  <SignOut />
                                </DropdownMenuItem>
                              </DropdownMenuGroup>
                            </>
                          ) : (
                            <>
                              <DropdownMenuGroup>
                                <DropdownMenuItem>
                                  <Account />
                                </DropdownMenuItem>
                              </DropdownMenuGroup>
                              <DropdownMenuSeparator />
                              <DropdownMenuGroup>
                                <DropdownMenuItem>
                                  <SignIn />
                                </DropdownMenuItem>
                              </DropdownMenuGroup>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        </>
      </nav>
    </div>
  )
}
