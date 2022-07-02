<script setup>
import { useUserStore } from '../store/useState';
import { computed } from 'vue';

const userStore = useUserStore()
const username = computed(() => userStore.user.name)
const acquaintedSection = computed(() => userStore.user.name ? 'Mine' : 'Common')
const isWide = window.innerWidth >= 460
</script>

<template>
  <el-header class="top-bar flex w-full z-50 items-center justify-center relative min-w-[auto]">
    <nav class="flex w-full h-full box-border justify-center max-w-[600px]">
      <div class="flex items-center nav-main justify-between w-full ">
        <router-link to="/" class="h-full">
          <el-button type="" text class="!h-full !rounded-none">Home</el-button>
        </router-link>
        <router-link to="/about">
          <el-button type="" text class="!rounded-full">About</el-button>
        </router-link>
        <router-link to="/mine" v-show="username||isWide" class="h-full">
          <el-button type="primary" text class="!h-full !rounded-none">{{ acquaintedSection }}</el-button>
        </router-link>
        <router-link to="/user" v-show="username" class="h-full">
          <el-button type="" text class="!h-full !rounded-none">{{ username }}</el-button>
        </router-link>
        <router-link to="/login">
          <el-button v-show="!username" type="primary" plain class="!px-[13px]">Log in</el-button>
        </router-link>
        <router-link to="/register">
          <el-button v-show="!username" type="primary" class="!px-[13px]">Sign up</el-button>
        </router-link>
      </div>
    </nav>
  </el-header>
</template>

<style lang="scss" scoped>
.top-bar {
  box-shadow: var(--bs-sm);
  background-color: var(--theme-topbar-background-color);
  height: var(--theme-topbar-height) !important;

  :deep([href]) {
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  }
}
</style>
