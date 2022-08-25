<script setup lang="ts">
import Cookies from 'js-cookie'
import TopBar from '@/components/TopBar.vue'
import { useUserStore } from '@/store/useState'

const useStore = useUserStore()
const userName = Cookies.get('_user')
if (userName) {
  useStore.user.name = userName
}
</script>

<template>
  <TopBar class="ffs-pre fixed h-12" />
  <div class="ffs-pre flex min-h-[100vh] flex-col items-center pt-12">
    <router-view />
  </div>
</template>

<style lang="scss">
@import '@/style/utils.scss';

html {
  height: 100%;
  background-color: white;
}

body {
  min-height: 100%;
}

#app {
  display: flex;
  flex-direction: column;
  @apply antialiased;
}

@media only screen and (max-width: 768px) {
  html,
  body {
    -webkit-overflow-scrolling: touch;
  }

  body {
    overflow: auto;
  }
}
</style>
