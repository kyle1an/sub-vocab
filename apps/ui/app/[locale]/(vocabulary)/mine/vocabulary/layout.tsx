export default function Layout({ children }: LayoutProps<'/[locale]/mine/vocabulary'>) {
  return (
    <div className="flex h-full flex-col [[data-slot=content-root]:has(&)]:overflow-hidden">
      <div className="pb-3">
        <div className="flex">
          <div className="h-8 flex-auto grow" />
        </div>
      </div>
      <div className="flex grow items-center justify-center overflow-hidden rounded-xl border sq:rounded-3xl">
        <div className="flex size-full">
          {children}
        </div>
      </div>
    </div>
  )
}
