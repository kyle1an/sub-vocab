import { useColorScheme } from '@mui/joy/styles'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useMediaQuery } from 'foxact/use-media-query'
import { DevTools } from 'jotai-devtools'
import { Outlet } from 'react-router'

import { useVocabRealtimeSync } from '@/api/vocab-api'
import { TopBar } from '@/components/TopBar.tsx'
import { COLOR_SCHEME_QUERY, isDarkModeAtom, metaThemeColorEffect } from '@/lib/hooks'

import './globals.css'

import { authChangeEventAtom, isMdScreenAtom, LIGHT_THEME_COLOR, metaThemeColorAtom, prefersDarkAtom, sessionAtom, supabase } from '@/store/useVocab'

function useSyncAtomWithHooks() {
  const isMdScreen = useMediaQuery('(min-width: 768px)')
  const setIsMdScreen = useSetAtom(isMdScreenAtom)
  useEffect(() => {
    setIsMdScreen(isMdScreen)
  }, [isMdScreen, setIsMdScreen])
}

function useSyncAtomWithUser() {
  const setAuthChangeEvent = useSetAtom(authChangeEventAtom)
  const setUser = useSetAtom(sessionAtom)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setAuthChangeEvent(event)
      setUser(session)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [setAuthChangeEvent, setUser])
}

function useSyncDarkPreference() {
  const isDarkOS = useMediaQuery(COLOR_SCHEME_QUERY)
  const [prefersDark, setPrefersDark] = useAtom(prefersDarkAtom)
  useEffect(() => {
    if (prefersDark !== isDarkOS)
      setPrefersDark(isDarkOS)
  }, [prefersDark, isDarkOS, setPrefersDark])
}

function useSyncMuiColorScheme() {
  const [isDarkMode] = useAtom(isDarkModeAtom)
  const { mode, setMode } = useColorScheme()
  useLayoutEffect(() => {
    const nextMode = isDarkMode ? 'dark' : 'light'
    if (nextMode !== mode)
      setMode(nextMode)
  }, [isDarkMode, mode, setMode])
}

function useSyncMetaThemeColor<T extends Element>(ref: React.RefObject<T>) {
  const [isDarkMode] = useAtom(isDarkModeAtom)
  const setMetaThemeColor = useSetAtom(metaThemeColorAtom)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode)
    let themeColorContentValue: string
    if (isDarkMode)
      themeColorContentValue = 'black'
    else
      themeColorContentValue = LIGHT_THEME_COLOR

    requestAnimationFrame(() => {
      themeColorContentValue = window.getComputedStyle(ref.current, null).getPropertyValue('background-color')
      if (themeColorContentValue === 'rgb(255, 255, 255)')
        themeColorContentValue = LIGHT_THEME_COLOR

      setMetaThemeColor(themeColorContentValue)
    })
  }, [isDarkMode, ref, setMetaThemeColor])
}

export default function RootLayout() {
  const ref = useRef<HTMLDivElement>(null!)
  useSyncMuiColorScheme()
  useSyncDarkPreference()
  useAtom(metaThemeColorEffect)
  useSyncAtomWithHooks()
  useSyncMetaThemeColor(ref)

  useSyncAtomWithUser()
  useVocabRealtimeSync()

  return (
    <div
      ref={ref}
      className="isolate flex h-full min-h-full flex-col bg-[--theme-bg] pr-[--pr] tracking-[--tracking] antialiased sq-smooth-[0.6] sq-radius-[5_5_0_0] sq-fill-[red] [--b-g:var(--theme-bg)] [--tracking:.02em] [&[style*='border-radius:_8px;']]:sq:[mask:paint(squircle)]"
      data-vaul-drawer-wrapper=""
    >
      <TopBar />
      <div className="flex min-h-svh flex-col items-center pt-11">
        <Outlet />
      </div>
      <Toaster
        closeButton
        richColors
      />
      <DevTools />
      <ReactQueryDevtools initialIsOpen={false} />
    </div>
  )
}
