<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { t } from '@/i18n'
import { Footer } from '@/components/Footer'
import { useVocabStore } from '@/store/useVocab'

const currentPath = computed(() => useRoute().fullPath)
const username = computed(() => useVocabStore().user)
const subNav = computed(() => [
  {
    title: t('Profile'),
    path: '/user',
  },
  {
    title: t('Password'),
    path: '/user/password',
  },
] as const)
</script>

<template>
  <div class="flex w-full max-w-screen-lg grow flex-col p-6">
    <div class="pb-5">
      <div class="text-2xl">
        {{ username }}
      </div>
    </div>
    <div class="flex w-full grow flex-col sm:flex-row">
      <div class="mr-6 w-52 shrink-0">
        <div class="sticky top-28">
          <nav>
            <ol>
              <li
                v-for="nav in subNav"
                :key="nav.path"
                :class="`${currentPath===nav.path?'[&>a]:bg-gray-100':''}`"
              >
                <RouterLink
                  :to="nav.path"
                  class="flex h-full items-center rounded-md px-4 py-2 hover:!bg-gray-200"
                >
                  <div class="text-sm">
                    {{ nav.title }}
                  </div>
                </RouterLink>
              </li>
            </ol>
          </nav>
        </div>
      </div>
      <div class="w-full flex-1 p-4">
        <RouterView />
      </div>
    </div>
  </div>
  <Footer />
</template>
