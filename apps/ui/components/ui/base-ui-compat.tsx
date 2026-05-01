import * as React from 'react'

export type AsChildProps = {
  asChild?: boolean
  children?: React.ReactNode
}

export function getRenderProp(asChild: boolean | undefined, children: React.ReactNode) {
  return asChild && React.isValidElement(children) ? children : undefined
}

export function getRenderChildren(asChild: boolean | undefined, children: React.ReactNode) {
  return getRenderProp(asChild, children) ? undefined : children
}

export function getNativeButtonProp(asChild: boolean | undefined, children: React.ReactNode) {
  const render = getRenderProp(asChild, children)

  if (!render) {
    return undefined
  }

  const elementType = getIntrinsicElementType(render)

  if (!elementType) {
    return undefined
  }

  return elementType === 'button' ? undefined : false
}

function getIntrinsicElementType(element: React.ReactElement): string | undefined {
  if (typeof element.type === 'string') {
    return element.type
  }

  const props = element.props as {
    asChild?: boolean
    children?: React.ReactNode
  }

  if (props.asChild && React.isValidElement(props.children)) {
    return getIntrinsicElementType(props.children)
  }

  return undefined
}
