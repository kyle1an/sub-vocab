import type { VariantProps } from 'class-variance-authority'

import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { CheckIcon } from '@radix-ui/react-icons'
import { cva } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const checkboxVariants = cva(
  cn(
    'peer size-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
  ),
  {
    variants: {
      variant: {
        default: cn(
          'drop-shadow-md [--sq-r:.425rem] data-[state=checked]:drop-shadow sq:rounded-[--sq-r] sq:shadow-none sq:[corner-shape:superellipse(3)]',
          '[--offset:3px] sq:focus-visible:ring-0 sq:focus-visible:after:absolute sq:focus-visible:after:-left-[--offset] sq:focus-visible:after:-top-[--offset] sq:focus-visible:after:size-[calc(100%+2*var(--offset))] focus-visible:after:sq:rounded-[calc(var(--sq-r)+var(--offset))] focus-visible:after:sq:border focus-visible:after:sq:border-[--ring] focus-visible:after:sq:[corner-shape:superellipse(3)]',
        ),
        radio: 'rounded-full [&_svg]:h-[15px]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Checkbox({
  className,
  variant,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root> & VariantProps<typeof checkboxVariants>) {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        checkboxVariants({ variant, className }),
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className={cn('flex items-center justify-center text-current')}
      >
        <CheckIcon
          data-slot="check-icon"
          className="size-3.5"
        />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
