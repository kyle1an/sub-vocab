import { RouterView } from 'vue-router'
import { KeepAlive } from 'vue'

type RouterViewSlotsDefault = Parameters<NonNullable<InstanceType<typeof RouterView>['$slots']['default']>>[0]

export const KeepViewAlive = ({ Component, route }: RouterViewSlotsDefault) => (
  route.meta?.keepAlive ? (
    <KeepAlive>
      {Component}
    </KeepAlive>
  ) : (
    <>
      {Component}
    </>
  )
)
