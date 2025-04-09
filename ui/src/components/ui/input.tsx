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
      className={cn(
        'relative z-0 [--offset:1px] [--sq-r:.9375rem] focus-within:after:-z-10 sq:focus-within:ring-0 sq:focus-within:after:absolute sq:focus-within:after:-left-[--offset] sq:focus-within:after:-top-[--offset] sq:focus-within:after:size-[calc(100%+2*var(--offset))] focus-within:after:sq:rounded-[calc(var(--sq-r)+var(--offset)-0.5px)] focus-within:after:sq:border focus-within:after:sq:border-[--ring] focus-within:after:sq:[corner-shape:squircle]',
        'sq:[:has(>&_input:is(:autofill,[data-com-onepassword-filled]))]:signal/filled',
        'signal/filled:sq:rounded-[--sq-r] signal/filled:sq:bg-[--internal-autofill] signal/filled:sq:[corner-shape:squircle]',
        className,
      )}
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
        'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        'sq:rounded-[--sq-r] sq:shadow-none sq:drop-shadow-sm sq:[corner-shape:squircle] sq:hover:bg-transparent sq:focus-visible:ring-0',
        'signal/filled:[-webkit-text-fill-color:black] signal/filled:[caret-color:black] signal/filled:![transition:background-color_9999999s_ease-in-out_0s] sq:signal/filled:shadow-sm sq:signal/filled:drop-shadow-none',
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
