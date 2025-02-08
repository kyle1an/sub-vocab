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
        'aspect-square max-h-full p-0 [--sq-r:4.5px]',
      )}
      onClick={() => refetch()}
    >
      <IconLucideLoader2
        className={clsx(
          'size-3.5 animate-spin',
          isFetching ? '' : 'hidden',
        )}
      />
      <IconIonRefresh
        className={clsx(
          'size-4',
          isFetching ? 'hidden' : '',
        )}
      />
    </Button>
  )
}
