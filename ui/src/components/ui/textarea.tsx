import * as React from 'react'
import { useId } from 'react'

import { cn } from '@/lib/utils'

const Textarea = ({ ref, className, ...props }: React.ComponentProps<'textarea'>) => {
  const id = useId()
  return (
    <textarea
      className={cn(
        'flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs [scrollbar-width:thin] placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        className,
      )}
      ref={ref}
      id={id}
      {...props}
    />
  )
}
Textarea.displayName = 'Textarea'

export { Textarea }
