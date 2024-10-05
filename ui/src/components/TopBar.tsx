import type React from 'react'

import { CloseButton, Popover, PopoverButton, PopoverPanel, useClose } from '@headlessui/react'
import { Slot } from '@radix-ui/react-slot'
import { Link, useNavigate } from 'react-router'

import { useLogOut } from '@/api/user'
import { DEFAULT_THEME, THEMES } from '@/components/themes'
import { localeAtom, sessionAtom, themeAtom } from '@/store/useVocab'

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

function Account({ className, style, ...props }: React.HTMLAttributes<HTMLAnchorElement>) {
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

function SignIn({ className, ...props }: React.HTMLAttributes<HTMLAnchorElement>) {
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

function Settings({ className, ...props }: React.HTMLAttributes<HTMLAnchorElement>) {
  const { t } = useTranslation()
  return (
    <Link
      to="/user/profile"
      className={cn('inline-flex items-center gap-3', className)}
      {...props}
    >
      <IconLucideCog
        className="size-4 text-neutral-600"
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
  const account = user?.user_metadata.username || user?.email || ''
  const navigation = [
    { name: t('mine'), href: '/mine/vocabulary', current: true },
    // { name: 'About', href: '/', current: false },
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
          'group/nav ffs-pre fixed z-20 w-full rounded-t-3xl bg-white tracking-wide shadow-sm group-has-[[vaul-drawer]]/body:bg-[unset] dark:bg-slate-900',
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
                          <IconMingcuteHome3Line
                            className="size-[18px] text-neutral-400 transition-all duration-200 group-hover:text-black dark:group-hover:text-slate-300"
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
                        className="mr-3 block px-2 text-neutral-400 transition-all hover:text-neutral-500 dark:hover:text-neutral-200 xl:mr-0"
                        rel="noreferrer noopener"
                      >
                        <span className="sr-only">SubVocab on GitHub</span>
                        <IconBiGithub />
                      </a>
                    </div>
                  </div>
                  <div className="flex h-full items-center gap-2">
                    <Menubar className="h-full border-0 bg-transparent p-0 shadow-none">
                      <MenubarMenu>
                        <MenubarTrigger className="size-8 justify-center p-0">
                          <div className="flex h-full items-center">
                            <Slot
                              className="size-[1.0625rem] text-neutral-500 dark:text-neutral-400"
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
                    <div className="flex size-8 items-center justify-center">
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
                              <IconMingcuteUser4Fill
                                className="size-[22px] text-neutral-500"
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
                        <PopoverButton
                          as={Button}
                          variant="ghost"
                          className="relative inline-flex size-8 items-center justify-center p-0"
                        >
                          <span className="absolute -inset-0.5" />
                          <span className="sr-only">Open main menu</span>
                          <IconHeroiconsXMark
                            className="hidden size-6 group-data-[open]/nav:block"
                            aria-hidden="true"
                          />
                          <IconHeroiconsBars3
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
