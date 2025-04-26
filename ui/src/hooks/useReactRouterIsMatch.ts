// https://github.com/SukkaW/foxact/blob/master/packages/foxact/src/use-react-router-is-match/index.ts
import type { RelativeRoutingType, To } from 'react-router'

import { use, useMemo } from 'react'
import { UNSAFE_NavigationContext, useLocation, useResolvedPath } from 'react-router'

import { omitUndefined } from '@/lib/utilities'

interface UseReactRouterIsMatchOption {
  relative?: RelativeRoutingType
  caseSensitive?: boolean
  end?: boolean
}

const identity = <V>(value: V) => value

export function useReactRouterIsMatch(to: To, {
  relative,
  caseSensitive = false,
  end = false,
}: UseReactRouterIsMatchOption = {}) {
  const { pathname: $locationPathname } = useLocation()

  const { navigator: { encodeLocation = identity } } = use<React.ContextType<typeof UNSAFE_NavigationContext>>(UNSAFE_NavigationContext)
  const path = useResolvedPath(to, omitUndefined({ relative }))

  return useMemo(() => {
    let locationPathname = $locationPathname
    let toPathname = encodeLocation(path).pathname

    if (!caseSensitive) {
      locationPathname = locationPathname.toLowerCase()
      toPathname = toPathname.toLowerCase()
    }

    return locationPathname === toPathname
      || (
        !end
        && locationPathname.startsWith(toPathname)
        && locationPathname.charAt(toPathname.length) === '/'
      )
  }, [encodeLocation, path, $locationPathname, caseSensitive, end])
}
