import type { ToasterProps } from 'sonner'

import { Toaster as Sonner } from 'sonner'

import { cn } from '@/lib/utils'
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      style={{
        '--normal-bg': 'var(--popover)',
        '--normal-text': 'var(--popover-foreground)',
        '--normal-border': 'var(--border)',
      }}
      toastOptions={{
        classNames: {
          // eslint-disable-next-line tailwindcss/no-custom-classname
          toast: cn(
            'toast group group-[.toaster]:border-border group-[.toaster]:bg-background group-[.toaster]:text-foreground',
            '[--sq-r:1.25rem] sq:[--border-radius:var(--sq-r)]',
          ),
          content: 'w-full',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton:
            'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
          closeButton:
            'bg-background! text-muted-foreground! border-border! opacity-0 group-[.toast:hover]:opacity-100',
        },
      }}
      position="bottom-center"
      {...props}
    />
  )
}

export { Toaster }
