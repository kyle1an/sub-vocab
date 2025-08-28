'use client'

import type { LucideIcon } from 'lucide-react'

import { useReactRouterIsMatch } from 'foxact/use-react-router-is-match'
import { Link } from 'react-router'

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

type Item = {
  title: string
  url: string
  icon?: LucideIcon
  isActive?: boolean
}

export function NavMain({
  items,
}: {
  items: Item[]
}) {
  return (
    <SidebarMenu>
      {items.map((item) => (
        <NavSidebarMenuItem
          key={item.title}
          item={item}
        />
      ))}
    </SidebarMenu>
  )
}

function NavSidebarMenuItem({ item }: { item: Item }) {
  return (
    <SidebarMenuItem
      className="flex"
    >
      <SidebarMenuButton
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
    </SidebarMenuItem>
  )
}
