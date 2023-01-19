<script setup lang="ts">
import TopBar from '@/components/TopBar.vue'
</script>

<template>
  <TopBar class="ffs-pre fixed h-12" />
  <div class="ffs-pre flex min-h-[100vh] flex-col items-center pt-12">
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
</template>
