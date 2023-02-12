import { KeepAlive, defineComponent } from 'vue'
import { RouterView } from 'vue-router'
import { TopBar } from '@/components/TopBar'

export const App = defineComponent({
  setup() {
    return () => (
      <div class="flex h-full min-h-full flex-col bg-white antialiased">
        <TopBar class="ffs-pre fixed h-12" />
        <div class="ffs-pre flex min-h-[100vh] flex-col items-center pt-12">
          <RouterView>
            {({ Component, route }: any) => (
              route.meta?.keepAlive ? (
                <KeepAlive>
                  {Component}
                </KeepAlive>
              ) : (
                <>
                  {Component}
                </>
              )
            )}
          </RouterView>
        </div>
      </div>
    )
  }
})
