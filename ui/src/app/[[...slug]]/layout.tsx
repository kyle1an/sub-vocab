import type { Metadata } from 'next'
import Script from 'next/script'
import React from 'react'
import './globals.css'

// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: 'SubVocab',
  description: 'Vocabulary/sentences statistic of an input text or file.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta
          name="apple-mobile-web-app-capable"
          content="yes"
        />
        <meta
          name="theme-color"
          content="white"
        />
      </head>
      <body>
        <div className="container">
          <Script src="https://www.googletagmanager.com/gtag/js?id=G-GXR2MV6WDS" />
          <Script id="google-analytics">
            {`
              window.dataLayer = window.dataLayer || [];

              function gtag() {
                dataLayer.push(arguments);
              }

              gtag('js', new Date());

              gtag('config', 'G-GXR2MV6WDS');`}
          </Script>
        </div>
        <noscript>
          <strong>
            {`We're sorry, but this app doesn't work properly without JavaScript enabled.`}
            Please enable it to continue.
          </strong>
        </noscript>
        <div id="root">{children}</div>
      </body>
    </html>
  )
}
