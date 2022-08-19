<script lang="tsx" setup>
import Footer from '../components/Footer.vue'

const sidebarNav = [
  {
    id: 1,
    name: 'usersProfile',
    path: '/users',
  },
  {
    id: 2,
    name: 'password',
    path: '/users/password',
  },
]
</script>

<template>
  <div class="flex w-full max-w-screen-xl grow flex-row">
    <div class="w-52 shrink-0">
      <div class="sticky top-12 pt-6">
        <nav>
          <ol>
            <li
              v-for="nav in sidebarNav"
              :key="nav.id"
            >
              <a>
                <router-link
                  :to="nav.path"
                  class="flex h-full items-center px-4 hover:bg-gray-100"
                >
                  <div>
                    {{ nav.name }}
                  </div>
                </router-link>
              </a>
            </li>
          </ol>
        </nav>
      </div>
    </div>
    <div class="w-full flex-1 p-4">
      <router-view />
    </div>
  </div>
  <Footer />
</template>

<style scoped>

</style>
