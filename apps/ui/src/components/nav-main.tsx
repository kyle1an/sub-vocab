'use client'

import type { LucideIcon } from 'lucide-react'

import { useReactRouterIsMatch } from 'foxact/use-react-router-is-match'
import { Link } from 'react-router'
import $ from 'render-hooks'

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
  }[]
}) {
  return (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem
          key={item.title}
          className="flex"
        >
          <$ hooks={{ useReactRouterIsMatch }}>
            {({ useReactRouterIsMatch }) => (
              <SidebarMenuButton
                // eslint-disable-next-line react-compiler/react-compiler, react-hooks/rules-of-hooks
                isActive={useReactRouterIsMatch(item.url)}
                tooltip={item.title}
                asChild
              >
                <Link
                  to={item.url}
                  className="flex"
                >
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            )}
          </$>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}
