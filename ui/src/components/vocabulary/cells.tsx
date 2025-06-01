import { useClipboard } from 'foxact/use-clipboard'
import BxBxsErrorCircle from '~icons/bx/bxs-error-circle'
import MingcuteCheckFill from '~icons/mingcute/check-fill'
import OouiCopyLtr from '~icons/ooui/copy-ltr'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function VocabularyMenu({
  word,
}: {
  word: string
}) {
  const { copy, copied, error } = useClipboard({
    timeout: 1000,
  })
  return (
    <Button
      variant="ghost"
      className={cn(
        'size-full min-w-(--leading) flex-wrap content-center items-start p-0 [--sq-r:.5rem]',
      )}
      onClick={() => copy(word)}
    >
      <div className="flex size-(--leading) items-center justify-center *:size-3">
        <MingcuteCheckFill
          className={cn('', copied ? '' : 'hidden')}
        />
        <BxBxsErrorCircle
          className={cn('text-red-500', error ? '' : 'hidden')}
        />
        <OouiCopyLtr
          className={cn('transition-opacity delay-50 duration-100 group-hover:opacity-100', copied || error ? 'hidden' : '')}
        />
      </div>
    </Button>
  )
}
