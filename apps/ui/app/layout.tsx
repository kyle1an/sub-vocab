import './globals.css'

import type { Metadata } from 'next'

import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Fragment } from 'react'

import { Providers } from '@/app/providers'

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
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="favicon.ico" type="image/x-icon" />
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
        <Providers>
          {children}
        </Providers>
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
