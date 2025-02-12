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
            'sq-radius-[--sq-r] sq-outline sq-stroke-[--border] [--l-w:1px] [--sq-r:9px] group-[.toaster]:sq-fill-[--popover] sq:!border-0 sq:py-[17px] sq:![background:paint(squircle)] group-[.toaster]:sq:bg-transparent sq:group-[.toaster]:shadow-none sq:group-[.toaster]:drop-shadow-lg',
          ),
          content: 'w-full',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton:
            'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
          closeButton:
            '!bg-background !text-muted-foreground !border-border opacity-0 group-[.toast:hover]:opacity-100',
        },
      }}
      position="bottom-center"
      {...props}
    />
  )
}

export { Toaster }
