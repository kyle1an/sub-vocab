import type { RouterView } from 'vue-router'
import { KeepAlive } from 'vue'

type RouterViewSlotsDefault = Parameters<NonNullable<InstanceType<typeof RouterView>['$slots']['default']>>[0]

export const KeepViewAlive = ({ Component, route }: RouterViewSlotsDefault) => (
  <>
    <KeepAlive>
      {route.meta?.keepAlive && Component}
    </KeepAlive>
    {!route.meta?.keepAlive && Component}
  </>
)
