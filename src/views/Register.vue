<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { login } from '../api/user';
import router from '../router';
import type { FormInstance } from 'element-plus'

const ruleFormRef = ref<FormInstance>()

const checkAge = (rule: any, value: any, callback: any) => {
  const username = String(value)
  if (!username.length) {
    return callback(new Error('Please input name'))
  }

  if (username.length > 20) {
    return callback(new Error('Please use shorter name'))
  }

  if (username.length < 3) {
    return callback(new Error('Name must be longer than 2'))
  }

  callback()
}

const validatePass = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('Please input the password'))
  } else {
    if (ruleForm.checkPass !== '') {
      if (!ruleFormRef.value) return
      ruleFormRef.value.validateField('checkPass', () => null)
    }
    callback()
  }
}

const validatePass2 = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('Please input the password again'))
  } else if (value !== ruleForm.pass) {
    callback(new Error("Two inputs don't match!"))
  } else {
    callback()
  }
}

const ruleForm = reactive({
  pass: '',
  checkPass: '',
  username: '',
})

const rules = reactive({
  pass: [{ validator: validatePass, trigger: 'blur' }],
  checkPass: [{ validator: validatePass2, trigger: 'blur' }],
  username: [{ validator: checkAge, trigger: 'blur' }],
})

const submitForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.validate((valid) => {
    if (valid) {
      console.log('submit!')
    } else {
      console.log('error submit!')
      return false
    }
  })
}

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
}

function authenticate() {
  login({
    username: ruleForm.username,
    password: ruleForm.pass,
  }).then(() => {
    router.push('/')
  })
}
</script>

<template>
  <div>
    <el-container>
      <el-main class="mx-auto">
        <el-card shadow="always" class="w-80 flex justify-center mx-auto">
          <el-form
            ref="ruleFormRef"
            :model="ruleForm"
            :rules="rules"
            label-position="top"
            label-width="100px"
            class="demo-ruleForm"
            style="max-width: 460px"
            status-icon
          >
            <el-form-item label="Name" prop="username">
              <el-input v-model.number="ruleForm.username" />
            </el-form-item>
            <el-form-item label="Password" prop="pass">
              <el-input v-model="ruleForm.pass" type="password" autocomplete="off" />
            </el-form-item>
            <el-form-item label="Confirm" prop="checkPass">
              <el-input v-model="ruleForm.checkPass" type="password" autocomplete="off" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submitForm(ruleFormRef)">Submit</el-button>
              <el-button @click="resetForm(ruleFormRef)">Reset</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-main>
    </el-container>
  </div>
</template>

<style scoped>
 :deep(.el-form-item label) {
  font-weight: bold;
}
</style>
