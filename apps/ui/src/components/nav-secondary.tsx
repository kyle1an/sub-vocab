import type { LucideIcon } from 'lucide-react'

import { useReactRouterIsMatch } from 'foxact/use-react-router-is-match'
import React from 'react'
import { Link } from 'react-router'
import $ from 'render-hooks'

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

export function NavSecondary({
  items,
  ...props
}: {
  items: {
    title: string
    url: string
    icon: LucideIcon
    badge?: React.ReactNode
  }[]
} & React.ComponentPropsWithRef<typeof SidebarGroup>) {
  return (
    <SidebarGroup {...props}>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem
            key={item.title}
            className="flex"
          >
            <$ hooks={{ useReactRouterIsMatch }}>
              {({ useReactRouterIsMatch }) => (
                <>
                  <SidebarMenuButton
                    // eslint-disable-next-line react-compiler/react-compiler, react-hooks/rules-of-hooks
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
                </>
              )}
            </$>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
