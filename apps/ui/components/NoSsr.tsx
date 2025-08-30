import dynamic from 'next/dynamic'
import { Fragment } from 'react'

// https://stackoverflow.com/a/57173209
const NoSsr = ({ children }: { children: React.ReactNode }) => (
  <Fragment>{children}</Fragment>
)

export const ClientOnly = dynamic(() => Promise.resolve(NoSsr), {
  ssr: false,
})
