<script lang="ts" setup>
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import { t } from '@/i18n'

const currentPath = computed(() => useRoute().fullPath)
const subNav = computed(() => [
  {
    title: t('Vocabulary'),
    path: '/mine',
  },
  {
    title: 'Chart',
    path: '/chart',
  },
])
</script>

<template>
  <div class="flex w-full max-w-screen-lg grow flex-col py-3 px-5 pb-9 md:px-8">
    <div class="flex w-full grow flex-col gap-4 md:flex-row md:gap-6">
      <div class="w-48 shrink-0">
        <div class="sticky top-20">
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
      <div class="w-full flex-1">
        <RouterView v-slot="{ Component, route }">
          <KeepAlive>
            <component
              :is="Component"
              v-if="route.meta.keepAlive"
              :key="route.path"
            />
          </KeepAlive>
          <component
            :is="Component"
            v-if="!route.meta.keepAlive"
            :key="route.path"
          />
        </RouterView>
      </div>
    </div>
  </div>
</template>
