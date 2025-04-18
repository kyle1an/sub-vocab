import { Home } from 'lucide-react'
import * as React from 'react'
import AkarIconsKey from '~icons/akar-icons/key'
import IconBiGithub from '~icons/bi/github'
import LucideUserRoundPen from '~icons/lucide/user-round-pen'
import MaterialSymbolsArrowOutwardRounded from '~icons/material-symbols/arrow-outward-rounded'
import MaterialSymbolsBarChart4Bars from '~icons/material-symbols/bar-chart-4-bars'
import MaterialSymbolsInfoOutline from '~icons/material-symbols/info-outline'
import NrkMediaSubtitles from '~icons/nrk/media-subtitles'
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
      title: 'Subtitles',
      url: '/subtitles',
      icon: NrkMediaSubtitles,
      badge: '10',
    },
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
  ],
  navFooter: [
    {
      title: 'About',
      url: '/about',
      icon: MaterialSymbolsInfoOutline,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader className="gap-1.5">
        <SidebarTrigger className="size-8" />
        <NavMain items={data.navMain} />
      </SidebarHeader>
      <div className="flex w-full">
        <Separator className="mx-3 shrink" />
      </div>
      <SidebarContent className="p-2">
        <NavMain items={data.navSecondary} />
      </SidebarContent>
      <div className="flex w-full">
        <Separator className="mx-3 shrink" />
      </div>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
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
                <span className="grow">Github</span>
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
