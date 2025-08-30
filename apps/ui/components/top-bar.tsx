import type React from 'react'

import { Slot } from '@radix-ui/react-slot'
import { useMutation } from '@tanstack/react-query'
import { $trycatch } from '@tszen/trycatch'
import clsx from 'clsx'
import { useAtom } from 'jotai'
import Link from 'next/link'
import { Fragment, useTransition } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { themeAtom } from '@/atoms'
import { sessionAtom } from '@/atoms/auth'
import { DEFAULT_THEME, THEMES } from '@/components/themes'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Menubar, MenubarContent, MenubarMenu, MenubarRadioGroup, MenubarRadioItem, MenubarTrigger } from '@/components/ui/menubar'
import { localeAtom } from '@/i18n'
import { cn } from '@/lib/utils'
import { supabaseAuth } from '@/utils/supabase'
import { bindApply, omitUndefined } from '@sub-vocab/utils/lib'

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
      href="/register"
      className={cn('inline-flex items-center gap-3', className)}
      {...omitUndefined(props)}
    >
      <svg
        className="icon-[lucide--cog] size-4"
      />
      <span>Account</span>
    </Link>
  )
}

function SignIn({ className, ...props }: React.ComponentProps<'a'>) {
  return (
    <Link
      href="/login"
      className={cn('inline-flex items-center gap-3', className)}
      {...omitUndefined(props)}
    >
      <svg
        className="icon-[mingcute--user-4-fill] size-4"
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

  const logout = async () => {
    const [value, error] = await $trycatch(signOut([{ scope: 'local' }]))
    if (error !== null) {
      toast.error(error.message)
    } else {
      const { error } = value
      if (error) {
        toast.error(error.message)
      }
    }
  }

  return (
    <button
      type="button"
      aria-label="logout"
      className={cn('inline-flex items-center gap-3', className)}
      {...props}
      onClick={logout}
    >
      <svg
        className="icon-[solar--logout-2-outline] size-4 -scale-x-100"
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
        <Fragment>
          <Fragment>
            <div>
              <div>
                <div className="flex h-11 items-center justify-between">
                  <div className="flex h-full items-center gap-2">
                    <Menubar className="h-full border-0 bg-transparent p-0 shadow-none">
                      <MenubarMenu>
                        <MenubarTrigger
                          aria-label="theme"
                          className="size-8 justify-center p-0"
                        >
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
                            // Potential conflict with style-observer.
                            className={clsx(isThemeTransitioning && '[body:has(&)_*::after]:transition-none! [body:has(&)_*::before]:transition-none! [body:has(&)_*:not(main)]:transition-none!')}
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
                        <MenubarTrigger
                          aria-label="language"
                          className="size-8 justify-center p-0"
                        >
                          <div className="flex h-full items-center">
                            <svg
                              className="icon-[fa--language] size-4 text-neutral-500 dark:text-neutral-400"
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
                          aria-label="user"
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
                              <svg
                                className="icon-[mingcute--user-4-fill] size-5.5 text-neutral-500"
                              />
                            </Button>
                          )}
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          className="w-[unset] [&_[role=menuitem]]:p-0 [&_[role=menuitem]_svg]:text-neutral-600 [&_[role=menuitem]>*]:grow [&_[role=menuitem]>*]:px-2 [&_[role=menuitem]>*]:py-1.5"
                          align="end"
                        >
                          {user ? (
                            <Fragment>
                              <DropdownMenuLabel>
                                {account}
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuGroup>
                                <DropdownMenuItem>
                                  <SignOut />
                                </DropdownMenuItem>
                              </DropdownMenuGroup>
                            </Fragment>
                          ) : (
                            <Fragment>
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
                            </Fragment>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Fragment>
        </Fragment>
      </nav>
    </div>
  )
}
