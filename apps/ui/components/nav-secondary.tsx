'use client'

import Link from 'next/link'
import React, { Fragment } from 'react'

import { NavPathname } from '@/components/NavPathname'
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

type Item = {
  title: string
  url: string
  icon: React.ReactNode
  badge?: React.ReactNode
}

export function NavSecondary({
  items,
  ...props
}: {
  items: Item[]
} & React.ComponentPropsWithRef<typeof SidebarGroup>) {
  return (
    <SidebarGroup {...props}>
      <SidebarMenu>
        {items.map((item) => (
          <NavPathname key={item.title}>
            {(pathname) => (
              <SidebarMenuItem
                className="flex"
              >
                <Fragment>
                  <SidebarMenuButton
                    isActive={pathname === item.url}
                    asChild
                  >
                    <Link
                      href={item.url}
                      className="flex"
                    >
                      {item.icon}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                  {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
                </Fragment>
              </SidebarMenuItem>
            )}
          </NavPathname>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
