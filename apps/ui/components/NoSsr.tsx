'use client'

import dynamic from 'next/dynamic'
import { Fragment } from 'react'

// https://stackoverflow.com/a/57173209
const Component = ({ children }: { children: React.ReactNode }) => (
  <Fragment>{children}</Fragment>
)

export const NoSSR = dynamic(() => Promise.resolve(Component), {
  ssr: false,
})
