import { GuestRoute } from '@/app/[locale]/(auth)/_components/GuestRoute'
import { ContentRoot } from '@/components/content-root'
import { Card } from '@/components/ui/card'

export default function Layout({ children }: LayoutProps<'/[locale]/reset-password'>) {
  return (
    <GuestRoute>
      <ContentRoot className="items-start">
        <div className="mx-auto py-6">
          <section className="py-5">
            <div className="mx-auto flex flex-col items-center justify-center px-6 py-8 lg:py-0">
              <Card className="w-full sm:max-w-md md:mt-0 xl:p-0">
                <div className="max-w-80 space-y-4 p-6 sm:px-8 sm:py-7 md:w-80 md:space-y-6">
                  <h1 className="text-xl/tight font-bold md:text-2xl">
                    Reset Your Password
                  </h1>
                  {children}
                </div>
              </Card>
            </div>
          </section>
        </div>
      </ContentRoot>
    </GuestRoute>
  )
}
