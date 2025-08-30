import clsx from 'clsx'
import Link from 'next/link'

import { NavPathname } from '@/components/NavPathname'
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
          <NavPathname
            key={nav.to}
          >
            {(pathname) => (
              <Link
                key={nav.to}
                href={nav.to}
                className={clsx(
                  pathname === nav.to && '*:bg-zinc-100 dark:*:bg-zinc-600',
                )}
              >
                <div
                  className="rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-600 sq:rounded-[.9375rem]"
                >
                  <div
                    className="flex h-full items-center px-3 py-1.5 text-stone-700 hover:text-black dark:text-stone-300"
                  >
                    <div className="text-sm">
                      {nav.title}
                    </div>
                  </div>
                </div>
              </Link>
            )}
          </NavPathname>
        ))}
      </nav>
    </aside>
  )
}
