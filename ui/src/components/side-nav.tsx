import clsx from 'clsx'
import { NavLink } from 'react-router'

import { Squircle } from '@/components/ui/squircle'
import { cn } from '@/lib/utils'

export function SideNav({
  nav: navList,
  className = '',
}: {
  nav: Readonly<{
    title: string
    to: string
  }[]>
  className?: string
}) {
  return (
    <aside className={cn('w-52 pr-4', className)}>
      <nav className="flex flex-col gap-0.5">
        {navList.map((nav) => (
          <NavLink
            key={nav.to}
            to={nav.to}
            className={(l) => clsx(
              l.isActive && '*:bg-zinc-100 dark:*:bg-zinc-600',
            )}
          >
            <Squircle
              squircle={{
                cornerRadius: 8,
              }}
              className="hover:bg-zinc-200 dark:hover:bg-zinc-600"
            >
              <div
                className="flex h-full items-center px-3 py-1.5 text-stone-700 hover:text-black dark:text-stone-300"
              >
                <div className="text-sm">
                  {nav.title}
                </div>
              </div>
            </Squircle>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
