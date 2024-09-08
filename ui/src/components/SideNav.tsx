import { Link, useLocation } from 'react-router-dom'

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
  const location = useLocation()
  return (
    <aside className={cn('w-52 pr-4', className)}>
      <ol className="flex flex-col gap-0.5">
        {navList.map((nav) => (
          <li
            key={nav.to}
            className={cn(location.pathname === nav.to && '*:bg-zinc-100 dark:*:bg-zinc-600')}
          >
            <Squircle
              squircle={{
                cornerRadius: 8,
              }}
              className="hover:bg-zinc-200 dark:hover:bg-zinc-600"
            >
              <Link
                to={nav.to}
                className="flex h-full items-center px-3 py-1.5 text-stone-700 hover:text-black dark:text-stone-300"
              >
                <div className="text-sm">
                  {nav.title}
                </div>
              </Link>
            </Squircle>
          </li>
        ))}
      </ol>
    </aside>
  )
}
