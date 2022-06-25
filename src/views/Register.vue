<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { register } from '../api/user';
import router from '../router';
import type { FormInstance } from 'element-plus'
import { userInfo } from '../types/user';

const ruleFormRef = ref<FormInstance>()

function checkUsername(rule: any, value: any, callback: any) {
  const username = String(value)
  if (!username.length) {
    return callback(new Error('Please input name'))
  }

  if (username.length > 20) {
    return callback(new Error('Please use a shorter name'))
  }

  if (username.length < 2) {
    return callback(new Error('Name must be longer than 1'))
  }

  callback()
}

function validatePass(rule: any, value: any, callback: any) {
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
  } else if (value !== ruleForm.password) {
    callback(new Error("Two inputs don't match!"))
  } else {
    callback()
  }
}

const ruleForm = reactive({
  username: '',
  password: '',
  checkPass: '',
})

const rules = reactive({
  username: [{ validator: checkUsername, trigger: 'blur' }],
  password: [{ validator: validatePass, trigger: 'blur' }],
  checkPass: [{ validator: validatePass2, trigger: 'blur' }],
})

function submitForm(formEl: FormInstance | undefined) {
  if (!formEl) return
  formEl.validate((valid) => {
    if (valid) {
      console.log('submit!', formEl)
      checkValidity(ruleForm)
    } else {
      console.log('error submit!')
      return false
    }
  })
}

const errorMsg = ref('')

async function checkValidity(form: userInfo) {
  const signUpRes = await register(form)
  console.log('signUpRes', signUpRes)
  if (signUpRes[0].result === 1) {
    await router.push('/login')
  } else {
    errorMsg.value = 'Register failed: username already exists'
  }
}

function resetForm(formEl: FormInstance | undefined) {
  if (!formEl) return
  formEl.resetFields()
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
            <el-form-item label="Name" prop="username" :error="errorMsg">
              <el-input v-model.number="ruleForm.username" class="!text-base md:!text-xs" />
            </el-form-item>
            <el-form-item label="Password" prop="password">
              <el-input v-model="ruleForm.password" type="password" autocomplete="off" class="!text-base md:!text-xs" />
            </el-form-item>
            <el-form-item label="Confirm" prop="checkPass">
              <el-input v-model="ruleForm.checkPass" type="password" autocomplete="off" class="!text-base md:!text-xs" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submitForm(ruleFormRef)">Create Account</el-button>
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
