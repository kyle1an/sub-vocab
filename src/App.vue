<template>
  <div id="app">
    <Sub />
  </div>
</template>

<script>
import Sub from './components/Sub.vue'

export default {
  name: 'App',
  components: {
    Sub,
  }
}
</script>

<style>
#app {
  font-family: -apple-system, Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
