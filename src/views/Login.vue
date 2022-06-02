<script lang="ts" setup>
import { reactive } from 'vue';

const formData = reactive({
  name: '',
  password: '',
})

function submitForm() {
  if (formData.name === 'admin' && formData.password === 'admin') {
  } else {
    alert('Invalid username or password')
  }
}
</script>

<template>
  <div class="common-layout">
    <el-container>
      <el-main class="mx-auto">
        <el-card shadow="always" class="w-96 flex justify-center">
          <div style="margin: 20px" />
          <el-form
            label-position="top"
            label-width="100px"
            :model="formData"
            style="max-width: 460px">
            <el-form-item class="font-bold" label="Name">
              <el-input v-model="formData.name" />
            </el-form-item>
            <el-form-item class="font-bold" label="Password">
              <el-input v-model="formData.password" type="password" show-password />
            </el-form-item>
          </el-form>
          <el-form-item>
            <el-button type="primary" @click="submitForm(ruleFormRef)">Log in</el-button>
          </el-form-item>
        </el-card>
      </el-main>
      <el-footer>Footer</el-footer>
    </el-container>
  </div>
</template>

<style scoped>

</style>
