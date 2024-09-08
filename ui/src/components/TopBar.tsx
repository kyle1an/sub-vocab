import type React from 'react'

import { CloseButton, Popover, PopoverButton, PopoverPanel, useClose } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { useAtom } from 'jotai'
import {
  useEffect,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'

import { useLogOut } from '@/api/user'
import { useSession } from '@/api/vocab-api'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Icon } from '@/components/ui/icon'
import {
  Menubar,
  MenubarContent,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarTrigger,
} from '@/components/ui/menubar'
import { Separator } from '@/components/ui/separator.tsx'
import { cn } from '@/lib/utils.ts'
import { DEFAULT_THEME, localeAtom, themeAtom, THEMES } from '@/store/useVocab'

const locales = [
  {
    value: 'en',
    label: 'English',
  },
  {
    value: 'zh',
    label: '简体中文',
  },
] as const

function Account({ className, style, ...props }: React.HTMLAttributes<HTMLAnchorElement>) {
  return (
    <Link
      to="/register"
      className={cn('inline-flex items-center gap-3', className)}
      {...props}
    >
      <Icon
        icon="lucide:cog"
        className=""
        width={16}
      />
      <span>Account</span>
    </Link>
  )
}

function SignIn({ className, ...props }: React.HTMLAttributes<HTMLAnchorElement>) {
  return (
    <Link
      to="/login"
      className={cn('inline-flex items-center gap-3', className)}
      {...props}
    >
      <Icon
        icon="mingcute:user-4-fill"
        className=""
        width={16}
      />
      <span>Sign in</span>
    </Link>
  )
}

function Settings({ className, ...props }: React.HTMLAttributes<HTMLAnchorElement>) {
  const { t } = useTranslation()
  return (
    <Link
      to="/user"
      className={cn('inline-flex items-center gap-3', className)}
      {...props}
    >
      <Icon
        icon="lucide:cog"
        className="text-neutral-600"
        width={16}
      />
      <span>
        {t('Settings')}
      </span>
    </Link>
  )
}

function SignOut({ className, ...props }: React.HTMLAttributes<HTMLButtonElement>) {
  const { t } = useTranslation()
  const { mutateAsync: logOut } = useLogOut()
  const navigate = useNavigate()
  const close = useClose()

  function logout() {
    logOut()
      .then((logOutRes) => {
        const { error } = logOutRes
        if (!error) {
          close()
          requestAnimationFrame(() => {
            navigate('/')
          })
        }
      })
      .catch(console.error)
  }

  return (
    <button
      type="button"
      className={cn('inline-flex items-center gap-3', className)}
      {...props}
      onClick={logout}
    >
      <Icon
        icon="solar:logout-2-outline"
        className="-scale-x-100"
        width={16}
      />
      <span>
        {t('SignOut')}
      </span>
    </button>
  )
}

export function TopBar({ className }: { className?: string }) {
  const { t, i18n } = useTranslation()
  const { data: session } = useSession()
  const user = session?.user
  const account = user?.user_metadata.username || user?.email || ''
  const navigation = [
    { name: t('mine'), href: '/mine', current: true },
    { name: 'About', href: '/', current: false },
  ]

  const userNavigation = [
    ...!user ? [
      {
        name: 'Sign up',
        Component: Account,
      },
      {
        name: 'Sign in',
        Component: SignIn,
      },
    ] : [
      {
        name: 'Settings',
        Component: Settings,
      },
      {
        name: 'Sign Out',
        Component: SignOut,
      },
    ],
  ] as const

  const [locale, updateLocale] = useAtom(localeAtom)
  const [themePreference, setThemePreference] = useAtom(themeAtom)
  const [isThemeTransitioning, setIsThemeTransitioning] = useState(false)

  useEffect(() => {
    i18n.changeLanguage(locale).catch(console.error)
  }, [locale, i18n, updateLocale])

  const avatarSource = `https://avatar.vercel.sh/${account}?size=${22}`

  return (
    <div
      className={cn(
        'fixed z-20 flex w-full flex-col',
        'has-[>[data-open]]:h-full has-[>[data-open]]:backdrop-blur-sm has-[>[data-open]]:transition-all has-[>[data-open]]:duration-300 has-[>[data-open]]:ease-in-out',
        className,
      )}
    >
      <Popover
        as="nav"
        className={cn(
          'group/nav ffs-pre fixed z-20 w-full bg-white tracking-wide shadow-sm group-has-[[vaul-drawer]]/body:bg-[unset] dark:bg-slate-900',
          '[body:has(&[data-open])]:mr-[--scrollbar-width] [body:has(&[data-open])]:overflow-hidden',
        )}
      >
        {() => {
          return (
            <div className={cn('mr-[--removed-body-scroll-bar-size]')}>
              <div className="mx-auto max-w-7xl px-4 group-data-[open]/nav:mr-[--scrollbar-width] md:group-data-[open]/nav:mr-auto">
                <div className="flex h-11 items-center justify-between">
                  <div className="flex h-full items-center gap-4">
                    <div className="shrink-0 pl-3 pr-2">
                      <CloseButton
                        as={Link}
                        to="/"
                      >
                        <div className={cn('group flex items-center gap-2.5 rounded-md text-sm font-medium text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-slate-300')}>
                          <Icon
                            icon="mingcute:home-3-line"
                            width={18}
                            className="text-neutral-400 transition-all duration-200 group-hover:text-black dark:group-hover:text-slate-300"
                          />
                          <span>
                            {t('home')}
                          </span>
                        </div>
                      </CloseButton>
                    </div>
                    {navigation.map((item) => (
                      <div
                        key={item.name}
                        className="hidden items-baseline space-x-4 md:flex"
                      >
                        <CloseButton
                          as={Link}
                          to={item.href}
                          className={cn('rounded-md px-3 py-2 text-sm font-medium text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-slate-300')}
                          aria-current={item.current ? 'page' : undefined}
                        >
                          {item.name}
                        </CloseButton>
                      </div>
                    ))}
                    <Separator
                      orientation="vertical"
                      className="h-5 w-px"
                    />
                    <div className="shrink-0">
                      <a
                        href="https://github.com/kyle1an/sub-vocab"
                        target="_blank"
                        className="mr-3 block px-2 text-neutral-300 transition-all hover:text-neutral-400 dark:hover:text-neutral-300 xl:mr-0"
                        rel="noreferrer noopener"
                      >
                        <span className="sr-only">SubVocab on GitHub</span>
                        <Icon icon="bi:github" />
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Menubar className="h-auto border-0 bg-transparent p-0 shadow-none">
                      <MenubarMenu>
                        <MenubarTrigger className="px-2.5 py-1">
                          <div className="flex h-full items-center">
                            <Icon
                              icon={THEMES.find((theme) => theme.value === themePreference)?.icon ?? DEFAULT_THEME.icon}
                              width={16}
                              height={16}
                              className="h-full text-neutral-500 dark:text-neutral-400"
                            />
                          </div>
                        </MenubarTrigger>
                        <MenubarContent
                          className="min-w-0"
                          align="end"
                          sideOffset={3}
                        >
                          <MenubarRadioGroup
                            value={themePreference}
                            className={cn(isThemeTransitioning && '[body:has(&)_*::after]:!transition-none [body:has(&)_*::before]:!transition-none [body:has(&)_*]:!transition-none')}
                          >
                            {THEMES.map((theme) => (
                              <MenubarRadioItem
                                key={theme.value}
                                value={theme.value}
                                onSelect={() => {
                                  setIsThemeTransitioning(true)
                                  setThemePreference(theme.value)
                                  requestAnimationFrame(() => {
                                    setIsThemeTransitioning(false)
                                  })
                                }}
                              >
                                {theme.label}
                              </MenubarRadioItem>
                            ))}
                          </MenubarRadioGroup>
                        </MenubarContent>
                      </MenubarMenu>
                    </Menubar>

                    <Menubar className="h-auto border-0 bg-transparent p-0 shadow-none">
                      <MenubarMenu>
                        <MenubarTrigger className="px-2.5 py-1">
                          <div className="flex h-full items-center">
                            <Icon
                              icon="fa:language"
                              width={16}
                              height={16}
                              className="h-full text-neutral-500 dark:text-neutral-400"
                            />
                          </div>
                        </MenubarTrigger>
                        <MenubarContent
                          className="min-w-0"
                          align="end"
                          sideOffset={3}
                        >
                          <MenubarRadioGroup value={locale}>
                            {locales.map((language) => (
                              <MenubarRadioItem
                                key={language.value}
                                value={language.value}
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

                    {/* Profile dropdown */}
                    <div className="flex w-10 items-center justify-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          asChild
                          className="hidden md:flex"
                        >
                          {user ? (
                            <div className="cursor-pointer">
                              <div className="select-none rounded-full border">
                                <img
                                  src={avatarSource}
                                  alt="avatar"
                                  className="rounded-full"
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="">
                              <Icon
                                icon="mingcute:user-4-fill"
                                className="text-neutral-500"
                                width={22}
                              />
                            </div>
                          )}
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          className="w-[unset] [&_[role=menuitem]>*]:grow [&_[role=menuitem]>*]:px-2 [&_[role=menuitem]>*]:py-1.5 [&_[role=menuitem]]:p-0 [&_[role=menuitem]_svg]:text-neutral-600"
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
                                  <Settings />
                                </DropdownMenuItem>
                              </DropdownMenuGroup>
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

                      {/* Mobile menu button */}
                      <div className="flex md:hidden">
                        <PopoverButton className="relative inline-flex items-center justify-center rounded-md p-1">
                          <span className="absolute -inset-0.5" />
                          <span className="sr-only">Open main menu</span>
                          <XMarkIcon
                            className="hidden size-6 group-data-[open]/nav:block"
                            aria-hidden="true"
                          />
                          <Bars3Icon
                            className="block size-6 group-data-[open]/nav:hidden"
                            aria-hidden="true"
                          />
                        </PopoverButton>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <PopoverPanel className="md:hidden">
                <div className="flex flex-col gap-3.5 px-14 pb-4 pt-1.5">
                  {navigation.map((item) => {
                    return (
                      <div
                        key={item.name}
                        className="inline-flex"
                      >
                        <CloseButton
                          as={Link}
                          to={item.href}
                          className={cn('block rounded-md text-neutral-600 hover:text-black dark:text-neutral-400')}
                        >
                          {item.name}
                        </CloseButton>
                      </div>
                    )
                  })}
                </div>
                <div className="px-4">
                  <Separator className="" />
                </div>
                {user ? (
                  <div className="flex h-11 items-center px-6 pt-5">
                    <div className="cursor-pointer">
                      <div className="select-none rounded-full border">
                        <img
                          src={avatarSource}
                          alt="avatar"
                          className="size-6 rounded-full"
                        />
                      </div>
                    </div>
                    <div className="pl-3">
                      <div className="text-base font-medium leading-none">{account}</div>
                    </div>
                  </div>
                ) : null}
                <div className="flex flex-col gap-3.5 px-7 py-4">
                  {userNavigation.map(({ Component, ...item }) => (
                    <div
                      key={item.name}
                      className="flex cursor-default items-center"
                    >
                      <div>
                        <CloseButton
                          as={Component}
                          className="inline-flex shrink-0 items-center gap-3 rounded-md [&>*]:text-neutral-600 [&>*]:transition-all [&>*]:hover:text-black dark:[&>*]:text-neutral-400 [&>svg]:text-neutral-400"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </PopoverPanel>
            </div>
          )
        }}
      </Popover>
      <div className="grow" />
    </div>
  )
}
