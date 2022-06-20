<script lang="ts" setup>
import { reactive } from 'vue';
import { login } from '../api/user';
import router from '../router';

const formData = reactive({
  username: '',
  password: '',
})

function submitForm() {
  if (formData.username === 'admin' && formData.password === 'admin') {
  } else {
    alert('Invalid username or password')
  }
}

function authenticate() {
  login({
    username: formData.username,
    password: formData.password,
  }).then(() => {
    router.push('/')
  })
}
</script>

<template>
  <div class="common-layout">
    <el-container>
      <el-main class="mx-auto">
        <el-card shadow="always" class="w-80 flex justify-center mx-auto">
          <el-form
            label-position="top"
            label-width="100px"
            :model="formData"
            style="max-width: 460px">
            <el-form-item class="font-bold" label="Name">
              <el-input v-model="formData.username" />
            </el-form-item>
            <el-form-item class="font-bold" label="Password">
              <el-input v-model="formData.password" type="password" />
            </el-form-item>
          </el-form>
          <el-form-item>
            <el-button class="w-full" type="primary" @click="submitForm()">Log in</el-button>
          </el-form-item>
        </el-card>
      </el-main>
    </el-container>
  </div>
</template>

<style scoped>

</style>
