import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Icon } from '@iconify/react'
import { CheckIcon } from '@radix-ui/react-icons'
import type React from 'react'
import {
  useEffect, useRef, useState,
} from 'react'
import { useCookie, useLockBodyScroll } from 'react-use'
import { Disclosure } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { useOnClickOutside } from 'usehooks-ts'
import { Separator } from '@/components/ui/separator.tsx'
import { cn } from '@/lib/utils.ts'
import { useSnapshotStore } from '@/store/useVocab'
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
  Command,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { lng } from '@/i18n'

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
  const closeFnRef = useRef<() => void>(() => {})

  function onClickOutside() {
    if (open && closeFnRef.current) {
      closeFnRef.current()
    }
  }

  useOnClickOutside(ref, onClickOutside, 'mouseup')

  return {
    ref, open, setOpen, closeFnRef,
  }
}

export function TopBar({ className }: { className?: string }) {
  const { t, i18n } = useTranslation()
  const { username } = useSnapshotStore()
  const user = {
    name: username,
  }
  const navigation = [
    { name: t('mine'), href: '/mine', current: true },
    { name: 'About', href: '/', current: false },
  ]
  const {
    ref: disclosureRef, closeFnRef, open: disclosureOpen, setOpen: setDisclosureOpen,
  } = useExclusiveDisclosure()

  useLockBodyScroll(disclosureOpen)

  const Account = ({ className, style, ...props }: React.HTMLAttributes<HTMLAnchorElement>) => (
    <Link
      to="/register"
      className={cn('inline-flex items-center gap-3', className)}
      style={{ boxShadow: 'inset 0 1px 0 0 hsl(0deg 0% 100% / 40%)', ...style }}
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

  const SignIn = ({ className, ...props }: React.HTMLAttributes<HTMLAnchorElement>) => (
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

  const Settings = ({ className, ...props }: React.HTMLAttributes<HTMLAnchorElement>) => (
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

  const SignOut = ({ className, onClick, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div
      className={cn('inline-flex items-center gap-3', className)}
      onClick={(e) => {
        logout()
        onClick?.(e)
      }}
      {...props}
    >
      <Icon
        icon="humbleicons:logout"
        className="text-neutral-600"
        width={16}
      />
      <span>
        {t('SignOut')}
      </span>
    </div>
  )

  const userNavigation = [
    ...!user.name ? [
      {
        name: 'Sign up',
        El: Account,
      },
      {
        name: 'Sign in',
        El: SignIn,
      },
    ] : [
      {
        name: 'Settings',
        El: Settings,
      },
      {
        name: 'Sign Out',
        El: SignOut,
      },
    ],
  ] as const
  const navigate = useNavigate()
  const { mutateAsync: logOut } = useLogOut()

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

  const [openPopover, setOpenPopover] = useState(false)
  const [locale, updateLocale, deleteLocale] = useCookie('_locale')
  const [value, setValue] = useState(locale || lng)

  useEffect(() => {
    if (locale && locale !== value) {
      setValue(locale)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
      )}
    >
      <Disclosure
        as="nav"
        ref={disclosureRef}
        className={cn('ffs-pre fixed z-20 w-full bg-white tracking-wide shadow-sm [&_[href]]:tap-transparent')}
      >
        {({ open, close }) => {
          closeFnRef.current = close
          queueMicrotask(() => setDisclosureOpen(open))
          return (
            <>
              <div className="mx-auto max-w-7xl px-4 md:px-6 xl:px-0">
                <div className="flex h-11 items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="shrink-0 pl-3 pr-2">
                      <Link
                        to="/"
                        onClick={() => closeFnRef.current()}
                      >
                        <div className={cn('group flex items-center gap-2.5 rounded-md text-sm font-medium text-neutral-600 hover:text-black')}>
                          <Icon
                            icon="mingcute:home-3-line"
                            width={18}
                            className="text-neutral-400 transition-all duration-200 group-hover:text-black"
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
                          className={cn('rounded-md px-3 py-2 text-sm font-medium text-neutral-600 hover:text-black')}
                          aria-current={item.current ? 'page' : undefined}
                        >
                          {item.name}
                        </Link>
                      </div>
                    ))}
                    <Separator
                      orientation="vertical"
                      className="h-5 w-[1px]"
                    />
                    <div className="shrink-0">
                      <a
                        href="https://github.com/kyle1an/sub-vocab"
                        target="_blank"
                        className="mr-3 block px-2 text-neutral-300 transition-all hover:text-neutral-400 dark:hover:text-neutral-300 xl:mr-0"
                        rel="noreferrer"
                      >
                        <span className="sr-only">SubVocab on GitHub</span>
                        <svg
                          viewBox="0 0 16 16"
                          className="h-4 w-4"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                        </svg>
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Popover
                      open={openPopover}
                      onOpenChange={setOpenPopover}
                    >
                      <PopoverTrigger asChild>
                        <div className="flex h-full cursor-pointer items-center px-2">
                          <Icon
                            icon="fa:language"
                            width={16}
                            height={16}
                            className="h-full text-neutral-500"
                          />
                        </div>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-[100px] p-0"
                        align="end"
                      >
                        <Command>
                          <CommandGroup>
                            {locales.map((language) => (
                              <CommandItem
                                key={language.value}
                                onSelect={() => {
                                  setValue(language.value)
                                  setOpenPopover(false)
                                }}
                              >
                                {language.label}
                                <CheckIcon
                                  className={cn(
                                    'ml-auto h-4 w-4',
                                    value === language.value ? 'opacity-100' : 'opacity-0',
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>

                    {/* Profile dropdown */}
                    <div className="flex w-10 items-center justify-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          asChild
                          className="hidden md:flex"
                        >
                          {user.name ? (
                            <div className="cursor-pointer">
                              <div className="select-none rounded-full border border-gray-50">
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
                          className="w-[unset] [&_[role=menuitem]>*>svg]:text-neutral-600 [&_[role=menuitem]>*]:grow [&_[role=menuitem]>*]:px-2 [&_[role=menuitem]>*]:py-1.5 [&_[role=menuitem]]:p-0"
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
                        <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md p-1">
                          <span className="absolute -inset-0.5" />
                          <span className="sr-only">Open main menu</span>
                          {open ? (
                            <XMarkIcon
                              className="block h-6 w-6"
                              aria-hidden="true"
                            />
                          ) : (
                            <Bars3Icon
                              className="block h-6 w-6"
                              aria-hidden="true"
                            />
                          )}
                        </Disclosure.Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Disclosure.Panel className="md:hidden">
                <div className="flex flex-col gap-3.5 px-14 pb-4 pt-1.5">
                  {navigation.map((item) => {
                    return (
                      <div
                        key={item.name}
                        className="inline-flex"
                      >
                        <Link
                          to={item.href}
                          className={cn('block rounded-md text-neutral-600 hover:text-black')}
                          onClick={() => closeFnRef.current()}
                        >
                          {item.name}
                        </Link>
                      </div>
                    )
                  })}
                </div>
                <div className="px-4">
                  <Separator className="bg-neutral-100" />
                </div>
                {user.name ? (
                  <div className="flex items-center px-6 pt-5">
                    <div className="cursor-pointer">
                      <div className="select-none rounded-full border border-gray-50">
                        <img
                          src={avatarSource}
                          alt="avatar"
                          className="rounded-full"
                        />
                      </div>
                    </div>
                    <div className="pl-3">
                      <div className="text-base font-medium leading-none">{user.name}</div>
                    </div>
                  </div>
                ) : null}
                <div className="flex flex-col gap-3.5 px-7 py-4">
                  {userNavigation.map((Item) => (
                    <div
                      key={Item.name}
                      className="flex items-center"
                    >
                      <Item.El
                        className="inline-flex shrink-0 items-center gap-3 rounded-md [&>*]:text-neutral-600 [&>*]:transition-all [&>*]:hover:text-black [&>svg]:text-neutral-400"
                        onClick={() => closeFnRef.current()}
                      />
                    </div>
                  ))}
                </div>
              </Disclosure.Panel>
            </>
          )
        }}
      </Disclosure>
      <div className="grow" />
    </div>
  )
}
