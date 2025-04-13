import IconIonEllipsisHorizontalCircleOutline from '~icons/ion/ellipsis-horizontal-circle-outline'
import IconLucideChevronDown from '~icons/lucide/chevron-down'

import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

export function VocabularyMenu({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="flex max-h-full gap-1 p-2 [--sq-r:.75rem]"
          variant="ghost"
        >
          <IconIonEllipsisHorizontalCircleOutline
            className="size-[19px]"
          />
          <IconLucideChevronDown
            className="size-[14px]"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-52"
        align="start"
      >
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
