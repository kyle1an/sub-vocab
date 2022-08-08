<script setup lang="ts">
import Cookies from 'js-cookie'
import TopBar from './components/TopBar.vue'
import { useUserStore } from './store/useState'

const useStore = useUserStore()
const userName = Cookies.get('_user')
if (userName) {
  useStore.user.name = userName
}
</script>

<template>
  <TopBar />
  <router-view />
</template>
<style lang="scss" scoped>
:deep(.el-switch__core) {
  width: 32px !important;
}

:deep(.el-switch__label *) {
  font-size: 14px !important;
  letter-spacing: -0.01em;
}

:deep(table),
:deep(.el-table),
:deep(.el-table__header-wrapper),
:deep(.el-table__body-wrapper),
:deep(.el-table__empty-block) {
  margin: auto;
}

@media only screen and (max-width: 640px) {
  :deep(.el-main) {
    padding-right: 0 !important;
    padding-left: 0 !important;
  }
}
</style>
<style lang="scss">
@import './style/utils.scss';

html {
  height: 100%;
  background-color: white;
}

body {
  min-height: 100%;
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

@media only screen and (max-width: 768px) {
  html,
  body {
    -webkit-overflow-scrolling: touch;
  }

  body {
    overflow: auto;
    margin: 0 !important;
  }
}
</style>
