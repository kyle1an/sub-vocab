import { RouterLink, RouterView, useRoute } from 'vue-router'
import { defineComponent } from 'vue'
import { t } from '@/i18n'
import { KeepViewAlive } from '@/components/common/KeepViewAlive'

export const Dashboard = defineComponent(() => {
  const subNav = () => [
    {
      title: t('Vocabulary'),
      path: '/mine',
    },
    {
      title: 'Chart',
      path: '/chart',
    },
  ] as const
  return () => (
    <div class="flex w-full max-w-screen-lg grow flex-col px-5 py-3 pb-9 md:px-8">
      <div class="flex w-full grow flex-col gap-4 md:flex-row md:gap-6">
        <div class="w-48 shrink-0">
          <div class="sticky top-20">
            <nav>
              <ol>
                {subNav().map((nav) => (
                  <li
                    key={nav.path}
                    class={`${useRoute().fullPath === nav.path ? '[&>a]:bg-gray-100' : ''}`}
                  >
                    <RouterLink
                      to={nav.path}
                      class="flex h-full items-center rounded-md px-4 py-2 hover:!bg-gray-200"
                    >
                      <div class="text-sm">
                        {nav.title}
                      </div>
                    </RouterLink>
                  </li>
                ))}
              </ol>
            </nav>
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
