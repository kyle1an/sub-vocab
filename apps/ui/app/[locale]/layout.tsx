import './globals.css'

import type { Metadata } from 'next'

import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { ComposeContextProvider } from 'foxact/compose-context-provider'
import { cookies } from 'next/headers'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { Fragment, Suspense, use } from 'react'

import type { ColorModeValue } from '@/components/themes'

import { AppSidebarInset } from '@/app/[locale]/_components/app-sidebar-inset'
import { HydrateAtoms } from '@/app/[locale]/_components/HydrateAtoms'
import { JotaiProvider } from '@/app/[locale]/_components/JotaiProvider'
import { AppSidebar } from '@/components/app-sidebar'
import { TextSelectionToolbar } from '@/components/text-selection-toolbar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/sonner'
import { DARK__BACKGROUND, LIGHT_THEME_COLOR } from '@/constants/theme'
import { getUser } from '@/lib/supabase/server'
import { I18nProviderClient } from '@/locales/client'
import { TRPCReactProvider } from '@/trpc/client'

export const metadata: Metadata = {
  title: 'Subvocab',
  description: 'Enhance your English learning with Subvocab. Input texts, like subtitles or articles, and instantly categorize words into known and new. Streamline your vocabulary enhancement with smart tools for tracking and personalized learning. Ideal for preparing for English media consumption.',
}

export default function RootLayout({
  params,
  children,
}: LayoutProps<'/[locale]'>) {
  const { locale } = use(params)
  if (process.env.NODE_ENV === 'development') {
    if (locale === 'src' || locale === '.well-known') {
      return null
    }
  }
  const cookieStore = use(cookies())
  const { data: { user } } = use(getUser())
  const setting = cookieStore.get('color_mode_setting')?.value as ColorModeValue | undefined ?? 'auto'
  const defaultOpen = cookieStore.get('sidebar_state')?.value !== 'false'
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
              const DARK__BACKGROUND = 'oklch(0.145 0 0)'
              const setting = localStorage.getItem('color_mode_setting')
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
          <TRPCReactProvider children={null} />,
          <SidebarProvider
            defaultOpen={defaultOpen}
            className="isolate h-svh pr-(--pr) antialiased sq:superellipse-[1.5]"
            data-vaul-drawer-wrapper=""
          />,
          <NuqsAdapter children={null} />,
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
        <TextSelectionToolbar />
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
