import { useAtom } from 'jotai'
import { Home } from 'lucide-react'
import { Fragment } from 'react'
import * as React from 'react'

import { sessionAtom } from '@/atoms/auth'
import { ArrowOutwardRounded } from '@/components/icons/arrow'
import { NavMain } from '@/components/nav-main'
import { NavSecondary } from '@/components/nav-secondary'
import { Separator } from '@/components/ui/separator'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

const data = {
  navMain: [
    {
      title: 'Home',
      url: '/',
      icon: <Home />,
    },
  ],
  navSecondary: [
    {
      title: 'Vocabulary',
      url: '/mine/vocabulary',
      icon: <svg className="icon-[solar--checklist-bold]" />,
    },
    {
      title: 'Chart',
      url: '/mine/chart',
      icon: <svg className="icon-[material-symbols--bar-chart-4-bars]" />,
    },
  ],
  navFooter: [
    {
      title: 'About',
      url: '/about',
      icon: <svg className="icon-[material-symbols--info-outline]" />,
    },
  ],
}

const accountNav = [
  {
    title: 'User',
    url: '/user/profile',
    icon: <svg className="icon-[lucide--user-round-pen]" />,
  },
  {
    title: 'Password',
    url: '/user/password',
    icon: <svg className="icon-[akar-icons--key]" />,
  },
]

export function AppSidebar({ className, ...props }: React.ComponentProps<typeof Sidebar>) {
  const [session] = useAtom(sessionAtom)
  const user = session?.user
  return (
    <Sidebar className={cn('border-r-0', className)} {...props}>
      <SidebarHeader className="gap-1.5">
        <SidebarTrigger className="size-8" />
        <NavMain items={data.navMain} />
      </SidebarHeader>
      <div className="flex w-full">
        <Separator className="mx-3 shrink" />
      </div>
      <SidebarContent className="p-2">
        <NavMain items={data.navSecondary} />
        {user ? (<Fragment>
          <Separator className="min-h-px shrink" />
          <NavMain items={accountNav} />
        </Fragment>) : null}
      </SidebarContent>
      <div className="flex w-full">
        <Separator className="mx-3 shrink" />
      </div>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem className="flex">
            <SidebarMenuButton
              asChild
            >
              <a
                href="https://github.com/kyle1an/sub-vocab"
                target="_blank"
                className="group/bg block px-2 *:z-10"
                rel="noreferrer noopener"
              >
                <span className="sr-only">Subvocab on GitHub</span>
                <span className="size-4 shrink-0 bg-sidebar group-hover/bg:bg-inherit">
                  <span className="icon-[bi--github] size-full" />
                </span>
                <span className="grow">
                  <span className="bg-sidebar group-hover/bg:bg-inherit">GitHub</span>
                </span>
              </a>
            </SidebarMenuButton>
            <SidebarMenuBadge>
              <ArrowOutwardRounded />
            </SidebarMenuBadge>
          </SidebarMenuItem>
        </SidebarMenu>
        <NavSecondary items={data.navFooter} className="mt-auto p-0" />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
