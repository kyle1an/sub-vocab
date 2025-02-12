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
        'rounded-xl border bg-card text-card-foreground shadow [--b-g:var(--card)]',
        'sq-radius-[--sq-r] sq-outline-[--l-w] sq-stroke-[--border] sq-fill-[--card] [--l-w:1px] [--sq-r:8px] sq:relative sq:!border-0 sq:bg-transparent sq:shadow-none sq:drop-shadow sq:[background:paint(squircle)]',
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
