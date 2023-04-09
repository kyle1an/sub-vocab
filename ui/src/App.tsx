import { defineComponent } from 'vue'
import { RouterView } from 'vue-router'
import { TopBar } from '@/components/TopBar'
import { KeepViewAlive } from '@/components/common/KeepViewAlive'
import '@/styles/index.scss'

export const App = defineComponent(() => {
  return () => (
    <div class="flex h-full min-h-full flex-col bg-white antialiased">
      <TopBar class="ffs-pre fixed h-12" />
      <div class="ffs-pre flex min-h-[100vh] flex-col items-center pt-12">
        <RouterView>
          {KeepViewAlive}
        </RouterView>
      </div>
    </div>
  )
})
