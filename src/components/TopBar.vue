<script lang="ts" setup>
import { useUserStore } from '../store/useState'
import Cookies from 'js-cookie'
import { CaretBottom } from '@element-plus/icons-vue'
import en from 'element-plus/es/locale/lang/en'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

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

function handleCommand(command: string) {
  Cookies.set('lang', command, { expires: 365, })
  locale.value = command
}
</script>

<template>
  <header class="top-bar relative z-50 box-border flex h-12 w-full min-w-[auto] items-center justify-center bg-white shadow-sm">
    <nav class="box-border flex h-full w-full max-w-screen-xl justify-center">
      <div class="flex w-full items-center text-[14px]">
        <router-link
          to="/"
          class="flex h-full items-center px-4 hover:bg-gray-100"
        >
          {{ t('home') }}
        </router-link>
        <router-link
          to="/about"
          class="flex items-center rounded-full py-1 px-4 hover:bg-gray-100"
        >
          {{ t('about') }}
        </router-link>
        <div class="grow" />
        <router-link
          v-show="username||isWide"
          to="/mine"
          class="flex h-full items-center px-4 hover:bg-gray-100"
        >
          {{ acquaintedSection }}
        </router-link>
        <router-link
          v-show="username"
          to="/user"
          class="flex h-full items-center px-4 hover:bg-gray-100"
        >
          {{ username }}
        </router-link>
        <router-link
          v-show="!username"
          to="/login"
          class="flex items-center rounded-md py-1 px-4 hover:bg-gray-100"
        >
          {{ t('login') }}
        </router-link>
        <router-link
          v-show="!username"
          to="/register"
          class="s-btn ml-2 flex rounded py-2 px-3 text-white"
        >
          {{ t('signup') }}
        </router-link>
        <el-dropdown @command="handleCommand">
          <div class="el-dropdown-link flex px-4 outline-none">
            文/Aa
            <el-icon class="el-icon--right">
              <CaretBottom class="text-slate-300" />
            </el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu class="outline-none">
              <el-dropdown-item command="zh">
                中文
              </el-dropdown-item>
              <el-dropdown-item command="en">
                English
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-config-provider :locale="elLocale" />
      </div>
    </nav>
  </header>
</template>

<style lang="scss" scoped>
.top-bar :deep([href]) {
  -webkit-tap-highlight-color: transparent;
}
</style>
