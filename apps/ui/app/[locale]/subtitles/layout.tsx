import { ContentRoot } from '@/components/content-root'

export default function Layout({ children }: LayoutProps<'/[locale]/subtitles'>) {
  return (
    <ContentRoot className="-mt-1 overflow-hidden pt-1">
      <div className="size-full max-w-(--breakpoint-xl) px-5 pb-7">
        {children}
      </div>
    </ContentRoot>
  )
}
