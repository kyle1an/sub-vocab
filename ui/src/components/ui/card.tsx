export interface HeadingProps extends
  React.HTMLAttributes<HTMLHeadingElement>,
  React.RefAttributes<HTMLHeadingElement> {}

export interface ParagraphProps extends
  React.HTMLAttributes<HTMLParagraphElement>,
  React.RefAttributes<HTMLParagraphElement> {}

function Card({
  ref,
  className,
  ...props
}: DivProps) {
  return (
    <div
      ref={ref}
      className={cn(
        'rounded-xl border bg-card text-card-foreground shadow [--b-g:hsl(var(--card))]',
        'squircle sq-radius-[--sq-r] sq-outline-[--l-w] sq-stroke-[hsl(var(--border))] sq-fill-[hsl(var(--card))] [--l-w:1px] [--sq-r:8px] sq:relative sq:!border-0 sq:bg-transparent sq:shadow-none sq:drop-shadow',
        className,
      )}
      {...props}
    />
  )
}
Card.displayName = 'Card'

function CardHeader({
  ref,
  className,
  ...props
}: DivProps) {
  return (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 p-6', className)}
      {...props}
    />
  )
}
CardHeader.displayName = 'CardHeader'

function CardTitle({
  ref,
  className,
  ...props
}: HeadingProps) {
  return (
    <h3
      ref={ref}
      className={cn('font-semibold leading-none', className)}
      {...props}
    />
  )
}
CardTitle.displayName = 'CardTitle'

function CardDescription({
  ref,
  className,
  ...props
}: ParagraphProps) {
  return (
    <p
      ref={ref}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
}
CardDescription.displayName = 'CardDescription'

function CardContent({
  ref,
  className,
  ...props
}: DivProps) {
  return (
    <div
      ref={ref}
      className={cn('p-6 pt-0', className)}
      {...props}
    />
  )
}
CardContent.displayName = 'CardContent'

function CardFooter({
  ref,
  className,
  ...props
}: DivProps) {
  return (
    <div
      ref={ref}
      className={cn('flex items-center p-6 pt-0', className)}
      {...props}
    />
  )
}
CardFooter.displayName = 'CardFooter'

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle }
