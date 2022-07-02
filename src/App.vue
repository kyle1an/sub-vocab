<script setup lang="ts">
import TopBar from './components/TopBar.vue'
import { useUserStore } from './store/useState';
import { getCookie } from './utils/cookie';

const useStore = useUserStore()
const userName = getCookie('_user')
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

//.el-table__header {
//  th.el-table__cell > .cell {
//    font-size: 10px;
//    display: inline-flex !important;
//    align-items: center;
//  }
//
//  th.el-table__cell.is-right > .cell {
//    justify-content: flex-end;
//  }
//}

@media only screen and (max-width: 640px) {
  :deep(.el-main) {
    padding-right: 0 !important;
    padding-left: 0 !important;
  }
}
</style>
<style lang="scss">
:root {
  --theme-topbar-accent-border: 3px solid var(--theme-primary-color);
  --theme-topbar-height: 50px;
  --black-025: hsl(210, 8%, 97.5%);
  --bs-sm: 0 1px 2px hsla(0, 0%, 0%, 0.05), 0 1px 4px hsla(0, 0%, 0%, 0.05), 0 2px 8px hsla(0, 0%, 0%, 0.05);
  --theme-topbar-background-color: white;
}

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

@media only screen and (min-width: 768px) {
  body {
    height: 100%;
  }
}

@media only screen and (max-width: 768px) {
  html {
    //overflow: hidden;
    //height: 100%;
    -webkit-overflow-scrolling: touch;
  }

  body {
    //height: 100%;
    overflow: auto;
    -webkit-overflow-scrolling: touch;
    margin: 0 !important;
  }
}
</style>
