import clsx from 'clsx'

import { Button } from '@/components/ui/button'

export function RefetchButton({
  isFetching,
  refetch,
}: {
  isFetching: boolean
  refetch: () => void
}) {
  return (
    <Button
      variant="ghost"
      disabled={isFetching}
      className={clsx(
        'aspect-square max-h-full p-0 [--sq-r:.625rem]',
      )}
      onClick={() => refetch()}
    >
      <svg
        className={clsx(
          'icon-[lucide--loader-2] size-3.5 animate-spin',
          isFetching ? '' : 'hidden',
        )}
      />
      <svg
        className={clsx(
          'icon-[ion--refresh] size-4',
          isFetching ? 'hidden' : '',
        )}
      />
    </Button>
  )
}
