import { useAtom } from 'jotai'
import { Home } from 'lucide-react'
import * as React from 'react'
import AkarIconsKey from '~icons/akar-icons/key'
import IconBiGithub from '~icons/bi/github'
import LucideUserRoundPen from '~icons/lucide/user-round-pen'
import MaterialSymbolsBarChart4Bars from '~icons/material-symbols/bar-chart-4-bars'
import MaterialSymbolsInfoOutline from '~icons/material-symbols/info-outline'
import SolarChecklistBold from '~icons/solar/checklist-bold'

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
import { sessionAtom } from '@/store/useVocab'

const data = {
  navMain: [
    {
      title: 'Home',
      url: '/',
      icon: Home,
    },
  ],
  navSecondary: [
    {
      title: 'Vocabulary',
      url: '/mine/vocabulary',
      icon: SolarChecklistBold,
    },
    {
      title: 'Chart',
      url: '/mine/chart',
      icon: MaterialSymbolsBarChart4Bars,
    },
  ],
  navFooter: [
    {
      title: 'About',
      url: '/about',
      icon: MaterialSymbolsInfoOutline,
    },
  ],
}

const accountNav = [
  {
    title: 'User',
    url: '/user/profile',
    icon: LucideUserRoundPen,
  },
  {
    title: 'Password',
    url: '/user/password',
    icon: AkarIconsKey,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [session] = useAtom(sessionAtom)
  const user = session?.user
  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader className="gap-1.5">
        <SidebarTrigger />
        <NavMain items={data.navMain} />
      </SidebarHeader>
      <div className="flex w-full">
        <Separator className="mx-3 shrink" />
      </div>
      <SidebarContent className="p-2">
        <NavMain items={data.navSecondary} />
        {user ? (<>
          <Separator className="min-h-px shrink" />
          <NavMain items={accountNav} />
        </>) : null}
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
                className="group/bg mr-3 block px-2 *:z-10 xl:mr-0"
                rel="noreferrer noopener"
              >
                <span className="sr-only">Subvocab on GitHub</span>
                <IconBiGithub className="bg-sidebar group-hover/bg:bg-inherit" />
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
