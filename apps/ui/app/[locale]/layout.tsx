import './globals.css'

import type { Metadata } from 'next'

import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { cookies } from 'next/headers'
import { Fragment, use } from 'react'

import { Providers } from '@/app/[locale]/providers'
import { COLOR_THEME_SETTING_KEY } from '@/constants/keys'
import { DARK__BACKGROUND, LIGHT_THEME_COLOR } from '@/constants/theme'
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
  const setting = cookieStore.get(COLOR_THEME_SETTING_KEY)?.value
  return (
    <html
      lang={locale}
      data-color-theme={setting}
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
              const COLOR_THEME_SETTING_KEY = 'color_theme_setting'
              const DARK__BACKGROUND = 'oklch(0.145 0 0)'
              const setting = localStorage.getItem(COLOR_THEME_SETTING_KEY)
              if (setting === '"dark"' || (setting !== '"light"' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                for (const e of document.querySelectorAll('meta[name="theme-color"]')) {
                  e.setAttribute('content', DARK__BACKGROUND)
                }
              }
            })})()`,
          }}
        />
      </head>
      <body
        className="overflow-y-scroll tracking-[.02em] text-foreground antialiased"
      >
        <I18nProviderClient locale={locale}>
          <Providers>
            {children}
          </Providers>
        </I18nProviderClient>
        {process.env.NODE_ENV === 'production' ? (
          <Fragment>
            <SpeedInsights />
            <Analytics />
          </Fragment>
        ) : null}
      </body>
    </html>
  )
}
