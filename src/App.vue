<script setup>
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
import Sub from './components/Sub.vue'
</script>

<template>
  <Sub />
</template>

<style lang="scss">
html > body {
  background-color: rgb(243 241 246);

  &::-webkit-scrollbar {
    display: none; /* Safari and Chrome */
  }
}

#app {
  /*font-family: -apple-system, Avenir, Helvetica, Arial, sans-serif;*/
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
