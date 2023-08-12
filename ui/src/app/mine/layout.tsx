import { defineComponent } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { t } from '@/i18n'
import { KeepViewAlive } from '@/components/common/KeepViewAlive'
import { SideNav } from '@/components/SideNav'

export default defineComponent(() => {
  const subNav = () => [
    {
      title: t('Vocabulary'),
      path: '/mine',
    },
    {
      title: 'Chart',
      path: '/mine/chart',
    },
  ] as const
  return () => (
    <div class="flex w-full max-w-screen-lg grow flex-col px-5 py-3 pb-9 md:px-8">
      <div class="flex w-full grow flex-col gap-4 md:flex-row md:gap-6">
        <div class="w-48 shrink-0">
          <div class="sticky top-20">
            <SideNav nav={subNav()} />
          </div>
        </div>
        <div class="w-full flex-1">
          <RouterView>
            {KeepViewAlive}
          </RouterView>
        </div>
      </div>
    </div>
  )
})
