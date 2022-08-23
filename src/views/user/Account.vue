<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Footer from '@/components/Footer.vue'
import { useUserStore } from '@/store/useState'

const { t } = useI18n()
const currentPath = computed(() => useRoute().fullPath)
const userStore = useUserStore()
const username = computed(() => userStore.user.name)
const subNav = computed(() => [
  {
    id: 1,
    title: t('Profile'),
    path: '/users',
  },
  {
    id: 2,
    title: t('Password'),
    path: '/users/password',
  },
])
</script>

<template>
  <div class="flex w-full max-w-screen-lg grow flex-col p-6">
    <div>
      <div class="text-2xl">
        {{ username }}
      </div>
    </div>
    <div class="flex w-full grow flex-col sm:flex-row">
      <div class="mr-6 w-52 shrink-0">
        <div class="sticky top-12 pt-6">
          <nav>
            <ol>
              <li
                v-for="nav in subNav"
                :key="nav.id"
                :class="`${currentPath===nav.path?'navActive ':''}[.navActive&>a]:bg-gray-100`"
              >
                <router-link
                  :to="nav.path"
                  class="flex h-full items-center rounded-md px-4 py-2 hover:!bg-gray-200"
                >
                  <div class="text-sm">
                    {{ nav.title }}
                  </div>
                </router-link>
              </li>
            </ol>
          </nav>
        </div>
      </div>
      <div class="w-full flex-1 p-4">
        <router-view />
      </div>
    </div>
  </div>
  <Footer />
</template>
