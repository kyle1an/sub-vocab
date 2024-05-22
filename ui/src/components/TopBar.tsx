import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type React from 'react'
import {
  useEffect,
  useRef,
  useState,
} from 'react'
import { useCookie, useLockBodyScroll } from 'react-use'
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { useOnClickOutside } from 'usehooks-ts'
import { useSize } from 'ahooks'
import { useAtom } from 'jotai'
import { Icon } from '@/components/ui/icon'
import { Separator } from '@/components/ui/separator.tsx'
import { cn } from '@/lib/utils.ts'
import { DEFAULT_THEME, THEMES, themeAtom, useVocabStore } from '@/store/useVocab'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useLogOut } from '@/api/user'
import {
  Menubar,
  MenubarContent,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarTrigger,
} from '@/components/ui/menubar'
import { getLanguage } from '@/i18n'

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

function useExclusiveDisclosure<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [open, setOpen] = useState(false)
  const closeFnRef = useRef(() => {})

  function onClickOutside() {
    if (open && closeFnRef.current) {
      closeFnRef.current()
    }
  }

  // @ts-expect-error
  useOnClickOutside(ref, onClickOutside, 'mouseup')

  return {
    ref,
    open,
    setOpen,
    closeFnRef,
  }
}

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

function SignOut({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { t } = useTranslation()
  const username = useVocabStore((state) => state.username)
  const { mutateAsync: logOut } = useLogOut()
  const navigate = useNavigate()

  function logout() {
    logOut({
      username,
    })
      .then((logOutRes) => {
        if (logOutRes?.success) {
          requestAnimationFrame(() => {
            navigate('/')
          })
        }
      })
      .catch(console.error)
  }

  return (
    <div
      className={cn('inline-flex items-center gap-3', className)}
      onClick={logout}
      {...props}
    >
      <Icon
        icon="solar:logout-2-outline"
        className="-scale-x-100"
        width={16}
      />
      <span>
        {t('SignOut')}
      </span>
    </div>
  )
}

export function TopBar({ className }: { className?: string }) {
  const { t, i18n } = useTranslation()
  const username = useVocabStore((state) => state.username)
  const user = {
    name: username,
  }
  const navigation = [
    { name: t('mine'), href: '/mine', current: true },
    { name: 'About', href: '/', current: false },
  ]
  const {
    ref: disclosureRef,
    closeFnRef,
    open: disclosureOpen,
    setOpen: setDisclosureOpen,
  } = useExclusiveDisclosure()

  useLockBodyScroll(disclosureOpen)
  const bodySize = useSize(document.body) ?? {
    width: 0,
    height: 0,
  }

  const userNavigation = [
    ...!user.name ? [
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

  const [locale, updateLocale] = useCookie('_locale')
  const [value, setValue] = useState(locale || getLanguage())
  const [themePreference, setThemePreference] = useAtom(themeAtom)

  useEffect(() => {
    updateLocale(value)
    i18n.changeLanguage(value).catch(console.error)
  }, [value, i18n, updateLocale])

  const avatarSource = `https://avatar.vercel.sh/${user.name}?size=${22}`

  return (
    <div
      className={cn(
        'fixed z-20 flex w-full flex-col',
        disclosureOpen && 'h-full backdrop-blur-sm transition-all duration-300 ease-in-out',
        className,
      )}
    >
      <Disclosure
        as="nav"
        ref={disclosureRef}
        className={cn('ffs-pre fixed z-20 w-full bg-white tracking-wide shadow-sm dark:bg-slate-900 [&_[href]]:tap-transparent')}
        style={{
          width: bodySize.width,
        }}
      >
        {({ open, close }) => {
          closeFnRef.current = close
          queueMicrotask(() => setDisclosureOpen(open))
          return (
            <>
              <div className="mx-auto max-w-7xl px-4">
                <div className="flex h-11 items-center justify-between">
                  <div className="flex h-full items-center gap-4">
                    <div className="shrink-0 pl-3 pr-2">
                      <Link
                        to="/"
                        onClick={closeFnRef.current}
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
                      </Link>
                    </div>
                    {navigation.map((item) => (
                      <div
                        key={item.name}
                        className="hidden items-baseline space-x-4 md:flex"
                      >
                        <Link
                          to={item.href}
                          className={cn('rounded-md px-3 py-2 text-sm font-medium text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-slate-300')}
                          aria-current={item.current ? 'page' : undefined}
                        >
                          {item.name}
                        </Link>
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
                    <Menubar className="h-auto border-0 p-0 shadow-none">
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
                          <MenubarRadioGroup value={themePreference}>
                            {THEMES.map((theme) => (
                              <MenubarRadioItem
                                key={theme.value}
                                value={theme.value}
                                onSelect={() => {
                                  setThemePreference(theme.value)
                                }}
                              >
                                {theme.label}
                              </MenubarRadioItem>
                            ))}
                          </MenubarRadioGroup>
                        </MenubarContent>
                      </MenubarMenu>
                    </Menubar>

                    <Menubar className="h-auto border-0 p-0 shadow-none">
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
                          <MenubarRadioGroup value={value}>
                            {locales.map((language) => (
                              <MenubarRadioItem
                                key={language.value}
                                value={language.value}
                                onSelect={() => {
                                  setValue(language.value)
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
                          {user.name ? (
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
                          {user.name ? (
                            <>
                              <DropdownMenuLabel>
                                {user.name}
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
                        <DisclosureButton className="relative inline-flex items-center justify-center rounded-md p-1">
                          <span className="absolute -inset-0.5" />
                          <span className="sr-only">Open main menu</span>
                          {open ? (
                            <XMarkIcon
                              className="block size-6"
                              aria-hidden="true"
                            />
                          ) : (
                            <Bars3Icon
                              className="block size-6"
                              aria-hidden="true"
                            />
                          )}
                        </DisclosureButton>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <DisclosurePanel className="md:hidden">
                <div className="flex flex-col gap-3.5 px-14 pb-4 pt-1.5">
                  {navigation.map((item) => {
                    return (
                      <div
                        key={item.name}
                        className="inline-flex"
                      >
                        <Link
                          to={item.href}
                          className={cn('block rounded-md text-neutral-600 hover:text-black dark:text-neutral-400')}
                          onClick={closeFnRef.current}
                        >
                          {item.name}
                        </Link>
                      </div>
                    )
                  })}
                </div>
                <div className="px-4">
                  <Separator className="" />
                </div>
                {user.name ? (
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
                      <div className="text-base font-medium leading-none">{user.name}</div>
                    </div>
                  </div>
                ) : null}
                <div className="flex flex-col gap-3.5 px-7 py-4">
                  {userNavigation.map(({ Component, ...item }) => (
                    <div
                      key={item.name}
                      className="flex cursor-default items-center"
                    >
                      <div onClick={closeFnRef.current}>
                        <Component
                          className="inline-flex shrink-0 items-center gap-3 rounded-md [&>*]:text-neutral-600 [&>*]:transition-all [&>*]:hover:text-black dark:[&>*]:text-neutral-400 [&>svg]:text-neutral-400"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </DisclosurePanel>
            </>
          )
        }}
      </Disclosure>
      <div className="grow" />
    </div>
  )
}
