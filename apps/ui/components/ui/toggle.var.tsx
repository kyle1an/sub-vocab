import { cva } from 'class-variance-authority'
import clsx from 'clsx'

const toggleVariants = cva(
  clsx(
    "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-[color,box-shadow,border-color] outline-none hover:bg-muted hover:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    'sq:rounded-(--sq-r)',
  ),
  {
    variants: {
      variant: {
        default: clsx(
          'bg-transparent',
          '[--sq-r:.375rem]',
        ),
        outline: clsx(
          'border border-input bg-transparent shadow-xs hover:bg-accent hover:text-accent-foreground',
          '[--sq-r:1rem] sq:shadow-none sq:drop-shadow-xs',
        ),
      },
      size: {
        default: 'h-9 min-w-9 px-2',
        sm: 'h-8 min-w-8 px-1.5',
        lg: 'h-10 min-w-10 px-2.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export { toggleVariants }
