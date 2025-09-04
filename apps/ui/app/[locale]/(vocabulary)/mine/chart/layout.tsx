export default function Layout({ children }: LayoutProps<'/[locale]/mine/chart'>) {
  return (
    <div className="flex justify-center">
      <div className="max-w-3xl grow">
        <div className="flex h-14">
          <div className="flex flex-auto grow items-center justify-center font-bold text-neutral-700 dark:text-stone-300">
            Acquainted Vocabulary
          </div>
        </div>
        <div className="flex flex-col gap-3">
          {children}
        </div>
      </div>
    </div>
  )
}
