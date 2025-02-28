export function VocabularyMenu({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="flex max-h-full gap-1 p-2 [--sq-r:4px]"
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
