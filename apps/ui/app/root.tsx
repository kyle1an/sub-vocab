import {
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
} from 'react-router'

import { App } from '@/app/App'

export function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <link rel="icon" type="image/svg+xml" href="/react.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta
          name="description"
          content="Enhance your English learning with Subvocab. Input texts, like subtitles or articles, and instantly categorize words into known and new. Streamline your vocabulary enhancement with smart tools for tracking and personalized learning. Ideal for preparing for English media consumption."
        />
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
                const dark = 'oklch(0.145 0 0)' // --background
                document.querySelector(`meta[name="theme-color"]`)?.setAttribute('content', dark)
              }
            })})()`,
          }}
        />
        <title>Subvocab</title>
        <Meta />
        <Links />
      </head>
      <body className="overflow-y-scroll tracking-[.02em] text-foreground">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function Root() {
  return <App />
}
