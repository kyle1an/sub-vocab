<script setup>
</script>

<template>
  <el-header class="top-bar flex w-full z-50 items-center justify-center relative min-w-[auto]">
    <nav class="flex w-full box-border justify-center max-w-[600px]">
      <div class="flex nav-main justify-between w-full">
        <div><a class="nav-entry" href="#/">Home</a></div>
        <div><a class="nav-entry" href="#/mine">Common</a></div>
        <div><a class="nav-entry" href="#/mine">Log in/Sign up</a></div>
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
