<script setup lang="ts">
import TopBar from './components/TopBar.vue'
import Sub from './components/Sub.vue'
import Mine from './components/Mine.vue'
import { ref, computed, onBeforeMount } from 'vue'
// import Editor from './components/Editor.vue'
import { queryWords } from './api/vocab-service';

const routes: any = {
  '/mine': Mine,
}

const currentPath = ref(window.location.hash)
window.addEventListener('hashchange', () => currentPath.value = window.location.hash)
const currentView = computed(() => routes[currentPath.value.slice(1) || '/'] || Sub)
const commonWords = queryWords()
// onBeforeMount(async () => commonWords.value = await queryWords())
</script>

<template>
  <TopBar />
  <component :commonWords="commonWords" :is="currentView" />
</template>

<style lang="scss">
:root {
  --theme-topbar-accent-border: 3px solid var(--theme-primary-color);
  --theme-topbar-height: 50px;
  --black-025: hsl(210, 8%, 97.5%);
  --bs-sm: 0 1px 2px hsla(0, 0%, 0%, 0.05), 0 1px 4px hsla(0, 0%, 0%, 0.05), 0 2px 8px hsla(0, 0%, 0%, 0.05);
  --theme-topbar-background-color: white;
}

html {
  height: 100%;
  background-color: white;
}

body {
  //height: 100%;
  margin-top: 0;
  background-color: rgb(243 241 246);

  &::-webkit-scrollbar {
    display: none; /* Safari and Chrome */
  }
}

#app {
  @apply antialiased;
  //text-align: center;
  color: #2c3e50;
}
</style>
