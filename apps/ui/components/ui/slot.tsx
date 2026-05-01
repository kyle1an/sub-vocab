import { mergeProps } from '@base-ui/react/merge-props'
import * as React from 'react'

type SlotProps = React.HTMLAttributes<HTMLElement> & {
  children?: React.ReactNode
}

function Slot({ children, ...props }: SlotProps) {
  if (!React.isValidElement(children)) {
    return null
  }

  const childProps = children.props as React.HTMLAttributes<HTMLElement>

  return React.cloneElement(
    children,
    mergeProps(props, childProps),
  )
}

export { Slot }
