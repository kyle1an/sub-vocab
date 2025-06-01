import type { VariantProps } from 'class-variance-authority'

import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { CheckIcon } from '@radix-ui/react-icons'
import { cva } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const checkboxVariants = cva(
  cn(
    'peer size-4 shrink-0 rounded-sm border border-primary shadow-sm focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
  ),
  {
    variants: {
      variant: {
        default: cn(
          'drop-shadow-md [--sq-r:.425rem] data-[state=checked]:drop-shadow-xs sq:rounded-(--sq-r) sq:shadow-none sq:superellipse-[3.4]',
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
