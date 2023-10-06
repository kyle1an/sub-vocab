import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { changeUsername, isUsernameTaken } from '@/api/user'
import { useBearStore } from '@/store/useVocab'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type FormValues = {
  newUsername: string
}

export const UserPage = () => {
  const { t } = useTranslation()
  const user = useBearStore((state) => state.username)
  const setUsername = useBearStore((state) => state.setUsername)
  const form = useForm<FormValues>({
    defaultValues: {
      newUsername: user,
    },
    reValidateMode: 'onSubmit',
  })

  const {
    register, trigger, handleSubmit, formState: { errors }, setError,
  } = form
  async function submitForm(values: FormValues) {
    if (values.newUsername === user) {
      setError('newUsername', {
        message: 'The new username is the same as the current username.',
      })
      return
    }

    try {
      const usernameTaken = await isUsernameTaken({
        username: values.newUsername,
      })
      if (usernameTaken.has) {
        setError('newUsername', {
          message: 'The username is taken.',
        })
        return
      }

      const res = await changeUsername({
        username: user,
        newUsername: values.newUsername,
      })

      if (res.success) {
        setUsername(values.newUsername)
      } else {
        setError('newUsername', {
          message: 'Something went wrong',
        })
      }
    } catch (e) {
      setError('root.serverError', {
        message: 'Something went wrong, please try again later',
      })
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <div className="mb-3 border-b pb-1.5 text-xl">
          {t('changeUsername')}
        </div>
        <div className="flex w-80" >
          <Form {...form}>
            <form
              onSubmit={handleSubmit(submitForm)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="newUsername"
                rules={{
                  required: 'The Username is required.',
                  minLength: { value: 3, message: 'The Username must be at least 3 characters.' },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('Name')}</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder=""
                        autoComplete="off"
                        {...field}
                        {...register('newUsername')}
                        className="text-base md:text-sm"
                      />
                    </FormControl>
                    <FormMessage>{errors.newUsername?.message ?? ''}</FormMessage>
                  </FormItem>
                )}
              />
              <FormMessage>{errors.root?.serverError.message}</FormMessage>
              <Button
                className="mt-8"
                type="submit"
              >
                {t('Confirm Changes')}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}
