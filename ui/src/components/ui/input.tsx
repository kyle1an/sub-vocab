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
      className={cn(
        'relative z-0 [--offset:1px] [--sq-r:6px] focus-within:after:-z-10 focus-within:after:sq-radius-[calc(var(--sq-r)+var(--offset)-0.5px)] focus-within:after:sq-outline focus-within:after:sq-stroke-[--ring] focus-within:after:sq-fill-transparent sq:focus-within:ring-0 sq:focus-within:after:absolute sq:focus-within:after:-left-[--offset] sq:focus-within:after:-top-[--offset] sq:focus-within:after:size-[calc(100%+2*var(--offset))] focus-within:after:sq:[background:paint(squircle)]',
        'sq:[:has(>&_input:is(:autofill,[data-com-onepassword-filled]))]:signal/filled',
        '[--l-w:1px] signal/filled:border-0 signal/filled:shadow-none signal/filled:drop-shadow-sm signal/filled:sq-radius-[--sq-r] signal/filled:sq-outline-[--l-w] signal/filled:sq-stroke-[--input] signal/filled:sq-fill-[--internal-autofill] signal/filled:sq:bg-transparent signal/filled:sq:[background:paint(squircle)]',
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
      type={type}
      className={cn(
        'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        'sq-radius-[--sq-r] sq-outline-[--l-w] sq-stroke-[--input] sq-fill-transparent [--l-w:1px] sq:rounded-none sq:border-0 sq:shadow-none sq:drop-shadow-sm sq:[background:paint(squircle)] sq:hover:bg-transparent sq:focus-visible:ring-0',
        'signal/filled:[-webkit-text-fill-color:black] signal/filled:[caret-color:black] signal/filled:![transition:background-color_9999999s_ease-in-out_0s]',
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
