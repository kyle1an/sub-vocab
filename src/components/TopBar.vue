<script lang="ts" setup>
import Cookies from 'js-cookie'
import { CaretBottom } from '@element-plus/icons-vue'
import en from 'element-plus/es/locale/lang/en'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import type { Language } from 'element-plus/es/locale'
import { ElConfigProvider, ElDropdown, ElDropdownItem, ElDropdownMenu, ElIcon } from 'element-plus'
import { i18n, t } from '@/i18n'
import { useVocabStore } from '@/store/useVocab'

let { locale } = $(i18n.global)
const localeMap: Record<string, Language> = {
  'en': en,
  'zh': zhCn,
}
const elLocale = $computed(() => localeMap[locale])
const { user } = $(useVocabStore())
const isLoggedIn = $computed(() => !!user)
const isWide = window.innerWidth >= 460

function handleCommand(command: typeof locale) {
  Cookies.set('_locale', command, { expires: 365, })
  locale = command
}
</script>

<template>
  <header class="z-50 box-border flex w-full min-w-[auto] items-center justify-center bg-white tracking-wide shadow [&_[href]]:tap-transparent">
    <nav class="box-border flex h-full w-full max-w-screen-xl justify-center">
      <div class="flex w-full items-center text-[14px]">
        <RouterLink
          to="/"
          class="flex h-full items-center px-4 hover:bg-gray-100"
        >
          {{ t('home') }}
        </RouterLink>
        <RouterLink
          to="/about"
          class="flex items-center rounded-full py-1 px-4 hover:bg-gray-100"
        >
          {{ t('about') }}
        </RouterLink>
        <div class="grow" />
        <RouterLink
          v-if="isLoggedIn||isWide"
          to="/mine"
          class="flex h-full items-center px-4 hover:bg-gray-100"
        >
          {{ user ? t('mine') : t('common') }}
        </RouterLink>
        <RouterLink
          v-if="isLoggedIn"
          to="/user"
          class="flex h-full items-center px-4 hover:bg-gray-100"
        >
          {{ user }}
        </RouterLink>
        <template v-else>
          <RouterLink
            to="/login"
            class="flex items-center rounded-md py-1 px-4 hover:bg-gray-100"
          >
            {{ t('login') }}
          </RouterLink>
          <RouterLink
            to="/register"
            class="s-btn ml-2 flex rounded py-2 px-3 text-white"
          >
            {{ t('signup') }}
          </RouterLink>
        </template>
        <ElDropdown @command="handleCommand">
          <div class="flex px-4 outline-none">
            文/Aa
            <ElIcon class="el-icon--right">
              <CaretBottom class="text-slate-300" />
            </ElIcon>
          </div>
          <template #dropdown>
            <ElDropdownMenu class="outline-none">
              <ElDropdownItem command="zh">
                中文
              </ElDropdownItem>
              <ElDropdownItem command="en">
                English
              </ElDropdownItem>
            </ElDropdownMenu>
          </template>
        </ElDropdown>
        <ElConfigProvider :locale="elLocale" />
      </div>
    </nav>
  </header>
</template>
