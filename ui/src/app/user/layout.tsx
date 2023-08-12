import { defineComponent } from 'vue'
import { RouterView } from 'vue-router'
import { t } from '@/i18n'
import { Footer } from '@/components/Footer'
import { useVocabStore } from '@/store/useVocab'
import { SideNav } from '@/components/SideNav'

export default defineComponent(() => {
  const subNav = () => [
    {
      title: t('Profile'),
      path: '/user',
    },
    {
      title: t('Password'),
      path: '/user/password',
    },
  ] as const
  return () => (
    <>
      <div class="flex w-full max-w-screen-lg grow flex-col p-6">
        <div class="pb-5">
          <div class="text-2xl">
            {useVocabStore().user()}
          </div>
        </div>
        <div class="flex w-full grow flex-col sm:flex-row">
          <div class="mr-6 w-52 shrink-0">
            <div class="sticky top-28">
              <SideNav nav={subNav()}></SideNav>
            </div>
          </div>
          <div class="w-full flex-1 p-4">
            <RouterView />
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
})
