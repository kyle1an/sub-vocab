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
        <el-button type="" text class="!h-full !rounded-none">
          <router-link to="/">Home</router-link>
        </el-button>
        <el-button type="" text class="!rounded-full">
          <router-link to="/about">About</router-link>
        </el-button>
        <el-button v-show="username||isWide" type="primary" text class="!h-full !rounded-none">
          <router-link to="/mine">{{ acquaintedSection }}</router-link>
        </el-button>
        <el-button v-show="username" type="" text class="!h-full !rounded-none">
          <router-link to="/user">{{ username }}</router-link>
        </el-button>
        <el-button v-show="!username" type="primary" plain class="!px-[13px]">
          <router-link to="/login">Log in</router-link>
        </el-button>
        <el-button v-show="!username" type="primary" class="!px-[13px]">
          <router-link to="/register">Sign up</router-link>
        </el-button>
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
