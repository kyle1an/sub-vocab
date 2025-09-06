import './globals.css'

import type { Metadata } from 'next'

import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { ComposeContextProvider } from 'foxact/compose-context-provider'
import { cookies } from 'next/headers'
import { Fragment, Suspense, use } from 'react'

import type { ColorModeValue } from '@/components/themes'

import { AppSidebarInset } from '@/app/[locale]/_components/app-sidebar-inset'
import { Body } from '@/app/[locale]/_components/BodyProvider'
import { HydrateAtoms } from '@/app/[locale]/_components/HydrateAtoms'
import { JotaiProvider } from '@/app/[locale]/_components/JotaiProvider'
import { Providers } from '@/app/[locale]/_components/providers'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { SIDEBAR_COOKIE_NAME } from '@/components/ui/sidebar.var'
import { Toaster } from '@/components/ui/sonner'
import { COLOR_MODE_SETTING_KEY } from '@/constants/keys'
import { DARK__BACKGROUND, LIGHT_THEME_COLOR } from '@/constants/theme'
import { createClient } from '@/lib/supabase/server'
import { I18nProviderClient } from '@/locales/client'

export const metadata: Metadata = {
  title: 'Subvocab',
  description: 'Enhance your English learning with Subvocab. Input texts, like subtitles or articles, and instantly categorize words into known and new. Streamline your vocabulary enhancement with smart tools for tracking and personalized learning. Ideal for preparing for English media consumption.',
}

export default function RootLayout({
  params,
  children,
}: LayoutProps<'/[locale]'>) {
  const { locale } = use(params)
  const cookieStore = use(cookies())
  const supabase = use(createClient())
  const { data: { user } } = use(supabase.auth.getUser())
  const setting = cookieStore.get(COLOR_MODE_SETTING_KEY)?.value as ColorModeValue | undefined ?? 'auto'
  const defaultOpen = cookieStore.get(SIDEBAR_COOKIE_NAME)?.value !== 'false'
  return (
    <html
      lang={locale}
      data-color-mode={setting}
    >
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="mobile-web-app-capable" content="yes" />
        {setting === 'dark' ? (
          <meta name="theme-color" content={DARK__BACKGROUND} />
        ) : setting === 'light' ? (
          <meta name="theme-color" content={LIGHT_THEME_COLOR} />
        ) : (
          <Fragment>
            <meta name="theme-color" media="(prefers-color-scheme: dark)" content={DARK__BACKGROUND} />
            <meta name="theme-color" media="(prefers-color-scheme: light)" content={LIGHT_THEME_COLOR} />
          </Fragment>
        )}
        {/* <script crossOrigin="anonymous" src="//unpkg.com/react-scan/dist/auto.global.js" /> */}
        <script
          // https://x.com/shuding_/status/1948233116264321304
          // eslint-disable-next-line react-dom/no-dangerously-set-innerhtml
          dangerouslySetInnerHTML={{
            __html: `(${String(() => {
              const COLOR_MODE_SETTING_KEY = 'color_mode_setting'
              const DARK__BACKGROUND = 'oklch(0.145 0 0)'
              const setting = localStorage.getItem(COLOR_MODE_SETTING_KEY)
              if (setting === '"dark"' || (setting !== '"light"' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                for (const e of document.querySelectorAll('meta[name="theme-color"]')) {
                  e.setAttribute('content', DARK__BACKGROUND)
                }
              }
            })})()`,
          }}
        />
      </head>
      <ComposeContextProvider
        contexts={[
          /* eslint-disable react/no-missing-key */
          <I18nProviderClient locale={locale} children={null} />,
          <JotaiProvider />,
          <HydrateAtoms
            colorModeSetting={setting}
            user={user}
          />,
          <Body />,
          <Providers />,
          <SidebarProvider
            defaultOpen={defaultOpen}
            className="isolate h-svh pr-(--pr) antialiased sq:superellipse-[1.5]"
            data-vaul-drawer-wrapper=""
          />,
          /* eslint-enable react/no-missing-key */
        ]}
      >
        <AppSidebar
          collapsible="icon"
        />
        <AppSidebarInset>
          {children}
        </AppSidebarInset>
        <Suspense fallback={null}>
          <Toaster
            closeButton
            richColors
          />
        </Suspense>
        {process.env.NODE_ENV === 'production' ? (
          <Fragment>
            <SpeedInsights />
            <Analytics />
          </Fragment>
        ) : null}
      </ComposeContextProvider>
    </html>
  )
}
