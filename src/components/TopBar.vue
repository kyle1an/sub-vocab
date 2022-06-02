<script setup>
</script>

<template>
  <el-header class="top-bar flex w-full z-50 items-center justify-center relative min-w-[auto]">
    <nav class="flex w-full box-border justify-center max-w-[600px]">
      <div class="flex nav-main justify-between w-full">
        <router-link class="nav-entry" to="/">Home</router-link>
        <router-link class="nav-entry" to="/mine">Common</router-link>
        <router-link class="nav-entry" to="/login">Log in</router-link>
        <router-link to="/about">About</router-link>
      </div>
    </nav>
  </el-header>
</template>

<style lang="scss" scoped>
.top-bar {
  box-shadow: var(--bs-sm);
  background-color: var(--theme-topbar-background-color);
  height: var(--theme-topbar-height) !important;
}

.nav-entry {
  @apply rounded mx-2;
  &:hover {
    background-color: rgba(147, 135, 0, 0.19);
    color: rgb(175, 161, 0);
    text-decoration: none;
  }
}
</style>
