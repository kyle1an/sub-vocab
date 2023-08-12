import { defineComponent } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

export const SideNav = defineComponent((props: {
  nav: Readonly<{
    title: string,
    path: string,
  }[]>
}) => {
  return () => (
    <nav>
      <ol>
        {props.nav.map((nav) => (
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
  )
})
