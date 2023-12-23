import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

export const SideNav = ({
  nav: navList,
  className = '',
}: {
  nav: Readonly<{
    title: string
    to: string
  }[]>
  className?: string
}) => {
  const location = useLocation()
  return (
    <aside className={cn('w-52 pr-4', className)}>
      <ol className="flex flex-col gap-0.5">
        {navList.map((nav) => (
          <li
            key={nav.to}
            className={cn(location.pathname === nav.to && '[&>a]:bg-zinc-100')}
          >
            <Link
              to={nav.to}
              className="flex h-full items-center rounded-md px-3 py-1.5 text-stone-700 hover:bg-zinc-200 hover:text-black"
            >
              <div className="text-sm">
                {nav.title}
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </aside>
  )
}
