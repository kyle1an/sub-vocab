import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

export function VocabularyMenu({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="vocabulary menu"
        asChild
      >
        <Button
          className="flex max-h-full gap-1 p-2! [--sq-r:.75rem]"
          variant="ghost"
        >
          <svg
            className="icon-[ion--ellipsis-horizontal-circle-outline] size-[19px]"
          />
          <svg
            className="icon-[lucide--chevron-down] size-3.5"
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
