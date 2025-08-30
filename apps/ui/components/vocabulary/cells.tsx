import { useClipboard } from 'foxact/use-clipboard'
import ms from 'ms'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function VocabularyMenu({
  word,
}: {
  word: string
}) {
  const { copy, copied, error } = useClipboard({
    timeout: ms('1s'),
  })
  return (
    <Button
      variant="ghost"
      className={cn(
        'size-full min-w-(--leading) flex-wrap content-center items-start p-0 [--sq-r:.5rem]',
      )}
      onClick={() => copy(word)}
    >
      <div className="flex size-(--leading) items-center justify-center *:size-3!">
        <svg
          className={cn('icon-[mingcute--check-fill]', copied ? '' : 'hidden')}
        />
        <svg
          className={cn('icon-[bx--bxs-error-circle] text-red-500', error ? '' : 'hidden')}
        />
        <svg
          className={cn('icon-[ooui--copy-ltr] transition-opacity delay-50 duration-100 group-hover:opacity-100', copied || error ? 'hidden' : '')}
        />
      </div>
    </Button>
  )
}
