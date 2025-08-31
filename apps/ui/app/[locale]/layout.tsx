import './globals.css'

import type { Metadata } from 'next'

import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Fragment, use } from 'react'

import { Providers } from '@/app/[locale]/providers'
import { I18nProviderClient } from '@/locales/client'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Subvocab',
  description: 'Enhance your English learning with Subvocab. Input texts, like subtitles or articles, and instantly categorize words into known and new. Streamline your vocabulary enhancement with smart tools for tracking and personalized learning. Ideal for preparing for English media consumption.',
}

export default function RootLayout({
  params,
  children,
}: Readonly<{
  params: Promise<{ locale: string }>
  children: React.ReactNode
}>) {
  const { locale } = use(params)
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="white" />
        {/* <script crossOrigin="anonymous" src="//unpkg.com/react-scan/dist/auto.global.js" /> */}
        <script
          // https://x.com/shuding_/status/1948233116264321304
          // eslint-disable-next-line react-dom/no-dangerously-set-innerhtml
          dangerouslySetInnerHTML={{
            __html: `(${String(() => {
              const THEME_KEY = 'themeAtom'
              const setting = localStorage.getItem(THEME_KEY)
              if (setting === `"dark"` || (setting !== `"light"` && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark')
                const _dark__background = 'oklch(0.145 0 0)'
                document.querySelector(`meta[name="theme-color"]`)?.setAttribute('content', _dark__background)
              }
            })})()`,
          }}
        />
      </head>
      <body
        className={`overflow-y-scroll tracking-[.02em] text-foreground antialiased ${geistSans.variable} ${geistMono.variable}`}
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
