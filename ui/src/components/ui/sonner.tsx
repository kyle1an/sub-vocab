import { useTheme } from 'next-themes'
import { Toaster as Sonner } from 'sonner'
import { cn } from '@/lib/utils'

type ToasterProps = React.ComponentProps<typeof Sonner>

function Toaster({ ...props }: ToasterProps) {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: cn(
            'toast group group-[.toaster]:border-border group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:shadow-lg',
            'squircle sq-radius-[--sq-r] sq-outline sq-stroke-border [--l-w:1px] [--sq-r:9px] group-[.toaster]:sq-fill-popover sq:!border-0 sq:py-[17px] sq:group-[.toaster]:shadow-none sq:group-[.toaster]:drop-shadow-lg',
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
