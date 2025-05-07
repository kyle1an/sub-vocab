import type { DivProps } from '@/components/ui/html-elements'

import { cn } from '@/lib/utils'

export interface InputProps extends
  React.InputHTMLAttributes<HTMLInputElement>,
  React.RefAttributes<HTMLInputElement> {}

function InputWrapper({
  className,
  children,
  ...props
}: DivProps) {
  return (
    <div
      data-slot="input-wrapper"
      className={className}
      {...props}
    >
      {children}
    </div>
  )
}

function Input({
  className,
  type,
  ...props
}: InputProps) {
  return (
    <input
      data-slot="input"
      type={type}
      className={cn(
        'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        '[--sq-r:.875rem] sq:rounded-[--sq-r] sq:shadow-none sq:drop-shadow-sm sq:[corner-shape:squircle]',
        className,
      )}
      {...props}
    />
  )
}

export {
  Input,
  InputWrapper,
}
