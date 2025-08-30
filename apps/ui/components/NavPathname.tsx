import { usePathname } from 'next/navigation'

export function NavPathname({
  children,
}: {
  children: (pathname: string) => React.ReactNode
}) {
  return children(usePathname())
}
