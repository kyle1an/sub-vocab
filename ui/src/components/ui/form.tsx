import type * as LabelPrimitive from '@radix-ui/react-label'
import type { ControllerProps, FieldPath, FieldValues } from 'react-hook-form'

import { Slot } from '@radix-ui/react-slot'
import { createContext, use, useId } from 'react'
import {
  Controller,
  FormProvider,
  useFormContext,
} from 'react-hook-form'

import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const Form = FormProvider

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName
}

const FormFieldContext = createContext<FormFieldContextValue>(
  {} as FormFieldContextValue,
)

function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ ...props }: ControllerProps<TFieldValues, TName>) {
  return (
    <FormFieldContext value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext>
  )
}

function useFormField() {
  const fieldContext = use(FormFieldContext)
  // eslint-disable-next-line ts/no-use-before-define
  const itemContext = use(FormItemContext)
  const { getFieldState, formState } = useFormContext()

  const fieldState = getFieldState(fieldContext.name, formState)

  if (!fieldContext)
    throw new Error('useFormField should be used within <FormField>')

  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

type FormItemContextValue = {
  id: string
}

const FormItemContext = createContext<FormItemContextValue>(
  {} as FormItemContextValue,
)

function FormItem({
  className,
  ...props
}: React.ComponentProps<'div'> & React.RefAttributes<HTMLDivElement>) {
  const id = useId()

  return (
    <FormItemContext value={{ id }}>
      <div
        className={cn('space-y-2', className)}
        {...props}
      />
    </FormItemContext>
  )
}

function FormLabel({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  const { error, formItemId } = useFormField()

  return (
    <Label
      className={cn(error && 'text-destructive', className)}
      htmlFor={formItemId}
      {...props}
    />
  )
}

function FormControl({
  ...props
}: React.ComponentProps<typeof Slot>) {
  const {
    error,
    formItemId,
    formDescriptionId,
    formMessageId,
  } = useFormField()

  return (
    <Slot
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  )
}

function FormDescription({
  className,
  ...props
}: React.ComponentProps<'p'> & React.RefAttributes<HTMLParagraphElement>) {
  const { formDescriptionId } = useFormField()

  return (
    <p
      id={formDescriptionId}
      className={cn('text-[.8rem] text-muted-foreground', className)}
      {...props}
    />
  )
}

function FormMessage({
  className,
  children,
  ...props
}: React.ComponentProps<'p'> & React.RefAttributes<HTMLParagraphElement>) {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error?.message) : children

  if (!body)
    return null

  return (
    <p
      id={formMessageId}
      className={cn('text-[.8rem] font-medium text-destructive', className)}
      {...props}
    >
      {body}
    </p>
  )
}

export {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
}
