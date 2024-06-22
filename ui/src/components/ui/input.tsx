import * as React from 'react'

import { cn } from '@/lib/utils'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export interface DivProps
  extends React.HTMLAttributes<HTMLDivElement> {}

function InputWrapper({
  className,
  ref,
  children,
  ...props
}: DivProps & React.RefAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'relative [--offset:1px] [--sq-r:6px] focus-within:after:-z-10 focus-within:after:squircle focus-within:after:sq-radius-[calc(var(--sq-r)+var(--offset)-0.5px)] focus-within:after:sq-outline focus-within:after:sq-stroke-ring sq:focus-within:ring-0 sq:focus-within:after:absolute sq:focus-within:after:-left-[--offset] sq:focus-within:after:-top-[--offset] sq:focus-within:after:size-[calc(100%+2*var(--offset))]',
        'sq:[:has(>&_input:is(:autofill,[data-com-onepassword-filled]))]:signal/filled',
        '[--l-w:1px] signal/filled:border-0 signal/filled:shadow-none signal/filled:drop-shadow-sm signal/filled:squircle signal/filled:sq-radius-[--sq-r] signal/filled:sq-outline-[--l-w] signal/filled:sq-stroke-input signal/filled:sq-fill-internal-autofill',
        className,
      )}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  )
}

function Input({
  className,
  type,
  ref,
  ...props
}: InputProps & React.RefAttributes<HTMLInputElement>) {
  return (
    <input
      type={type}
      className={cn(
        'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        'squircle sq-radius-[--sq-r] sq-outline-[--l-w] sq-stroke-input [--l-w:1px] sq:border-0 sq:shadow-none sq:drop-shadow-sm sq:hover:bg-transparent sq:focus-visible:ring-0',
        'signal/filled:[-webkit-text-fill-color:black] signal/filled:[caret-color:black] signal/filled:![transition:background-color_9999999s_ease-in-out_0s]',
        className,
      )}
      ref={ref}
      {...props}
    />
  )
}
Input.displayName = 'Input'

export {
  Input,
  InputWrapper,
}
