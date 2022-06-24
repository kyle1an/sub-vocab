<script lang="ts" setup>
import { useUserStore } from '../store/useState';
import { eraseCookie } from '../utils/cookie';
import router from '../router';

const userStore = useUserStore()

function logOut() {
  eraseCookie('user')
  userStore.user.name = ''
  router.push('/login')
}
</script>

<template>
  <div class="common-layout">
    <el-container>
      <el-main class="mx-auto">
        <el-card shadow="always" class="w-80 flex justify-center mx-auto">
          <el-button @click="logOut">log out</el-button>
        </el-card>
      </el-main>
    </el-container>
  </div>
</template>

<style scoped>
</style>
