import type { LucideIcon } from 'lucide-react'

import { useReactRouterIsMatch } from 'foxact/use-react-router-is-match'
import React, { Fragment } from 'react'
import { Link } from 'react-router'

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
  icon: LucideIcon
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
          <NavSidebarMenuItem
            key={item.title}
            item={item}
          />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}

function NavSidebarMenuItem({ item }: { item: Item }) {
  return (
    <SidebarMenuItem
      className="flex"
    >
      <Fragment>
        <SidebarMenuButton
          isActive={useReactRouterIsMatch(item.url)}
          asChild
        >
          <Link
            to={item.url}
            className="flex"
          >
            <item.icon />
            <span>{item.title}</span>
          </Link>
        </SidebarMenuButton>
        {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
      </Fragment>
    </SidebarMenuItem>
  )
}
