<script lang="ts" setup>
import { useUserStore } from '../store/useState';
import { setCookie } from '../utils/cookie';
import { CaretBottom } from '@element-plus/icons-vue'
import en from 'element-plus/es/locale/lang/en'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

const { t, locale } = useI18n({ useScope: 'global' }) // call `useI18n`, and spread `t` from  `useI18n` returning
const localeMap: Record<string, any> = {
  'en': en,
  'zh': zhCn,
}
const elLocale = computed(() => localeMap[locale.value])
const userStore = useUserStore()
const username = computed(() => userStore.user.name)
const acquaintedSection = computed(() => userStore.user.name ? t('mine') : t('common'))
const isWide = window.innerWidth >= 460

const handleCommand = (command: string) => {
  setCookie('lang', command, 365)
  locale.value = command
}
</script>

<template>
  <el-header class="top-bar flex w-full z-50 items-center justify-center relative min-w-[auto]">
    <nav class="flex w-full h-full box-border justify-center max-w-[600px]">
      <div class="flex items-center nav-main justify-between w-full ">
        <router-link to="/" class="h-full">
          <el-button type="" text class="!h-full !rounded-none">{{ t('home') }}</el-button>
        </router-link>
        <router-link to="/about">
          <el-button type="" text class="!rounded-full">{{ t('about') }}</el-button>
        </router-link>
        <router-link to="/mine" v-show="username||isWide" class="h-full">
          <el-button type="primary" text class="!h-full !rounded-none">{{ acquaintedSection }}</el-button>
        </router-link>
        <router-link to="/user" v-show="username" class="h-full">
          <el-button type="" text class="!h-full !rounded-none">{{ username }}</el-button>
        </router-link>
        <router-link to="/login" v-show="!username">
          <el-button type="primary" plain class="!px-[13px]">{{ t('login') }}</el-button>
        </router-link>
        <router-link to="/register" v-show="!username">
          <el-button type="primary" class="!px-[13px]">{{ t('signup') }}</el-button>
        </router-link>
        <el-dropdown @command="handleCommand">
          <div class="el-dropdown-link flex outline-none">文/Aa
            <el-icon class="el-icon--right">
              <CaretBottom class="text-slate-300" />
            </el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu class="outline-none">
              <el-dropdown-item command="zh">中文</el-dropdown-item>
              <el-dropdown-item command="en">English</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-config-provider :locale="elLocale" />
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
