<script setup lang="ts">
import Cookies from 'js-cookie'
import TopBar from './components/TopBar.vue'
import { useUserStore } from './store/useState'

const useStore = useUserStore()
const userName = Cookies.get('_user')
if (userName) {
  useStore.user.name = userName
}
</script>

<template>
  <TopBar />
  <router-view />
</template>

<style lang="scss">
@import './style/utils.scss';

html {
  height: 100%;
  background-color: white;
}

body {
  min-height: 100%;
  margin: 0;
  background-color: rgb(243 241 246);

  &::-webkit-scrollbar {
    display: none; /* Safari and Chrome */
  }
}

#app {
  @apply antialiased;
}

@media only screen and (max-width: 768px) {
  html,
  body {
    -webkit-overflow-scrolling: touch;
  }

  body {
    overflow: auto;
    margin: 0 !important;
  }
}
</style>
