import type { DivProps } from '@/components/ui/html-elements'

import { cn } from '@/lib/utils'

export interface HeadingProps extends
  React.ComponentProps<'h3'> {}

export interface ParagraphProps extends
  React.ComponentProps<'p'> {}

function Card({
  className,
  ...props
}: DivProps) {
  return (
    <div
      className={cn(
        'rounded-xl border bg-card text-card-foreground drop-shadow sq:rounded-3xl sq:[corner-shape:squircle]',
        className,
      )}
      {...props}
    />
  )
}

function CardHeader({
  className,
  ...props
}: DivProps) {
  return (
    <div
      className={cn('flex flex-col space-y-1.5 p-6', className)}
      {...props}
    />
  )
}

function CardTitle({
  className,
  ...props
}: HeadingProps) {
  return (
    <h3
      className={cn('font-semibold leading-none', className)}
      {...props}
    />
  )
}

function CardDescription({
  className,
  ...props
}: ParagraphProps) {
  return (
    <p
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
}

function CardContent({
  className,
  ...props
}: DivProps) {
  return (
    <div
      className={cn('p-6 pt-0', className)}
      {...props}
    />
  )
}

function CardFooter({
  className,
  ...props
}: DivProps) {
  return (
    <div
      className={cn('flex items-center p-6 pt-0', className)}
      {...props}
    />
  )
}

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle }
