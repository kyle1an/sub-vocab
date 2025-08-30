'use client'

import Link from 'next/link'

import { NavPathname } from '@/components/NavPathname'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

type Item = {
  title: string
  url: string
  icon?: React.ReactNode
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
        <NavPathname key={item.title}>
          {(pathname) => (
            <SidebarMenuItem
              className="flex"
            >
              <SidebarMenuButton
                isActive={pathname === item.url}
                tooltip={item.title}
                asChild
              >
                <Link
                  href={item.url}
                  className="flex"
                >
                  {item.icon && item.icon}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </NavPathname>
      ))}
    </SidebarMenu>
  )
}
