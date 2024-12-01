import { Toaster as Sonner } from 'sonner'

type ToasterProps = React.ComponentProps<typeof Sonner>

function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: cn(
            'toast group group-[.toaster]:border-border group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:shadow-lg',
            'squircle sq-radius-[--sq-r] sq-outline sq-stroke-[hsl(var(--border))] [--l-w:1px] [--sq-r:9px] group-[.toaster]:sq-fill-[hsl(var(--popover))] sq:!border-0 sq:py-[17px] group-[.toaster]:sq:bg-transparent sq:group-[.toaster]:shadow-none sq:group-[.toaster]:drop-shadow-lg',
          ),
          description: 'group-[.toast]:text-muted-foreground',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton:
            'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
        },
      }}
      position="bottom-center"
      {...props}
    />
  )
}

export { Toaster }
