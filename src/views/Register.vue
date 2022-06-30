<script lang="ts" setup>
import { h, reactive, ref } from 'vue'
import { existsUsername, register } from '../api/user';
import router from '../router';
import type { FormInstance } from 'element-plus'
import { userInfo } from '../types/user';
import { ElNotification } from 'element-plus/es';

const ruleFormRef = ref<FormInstance>()

async function checkUsername(rule: any, value: any, callback: any) {
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

  if ((await existsUsername({ username })).has) {
    return callback(new Error(`${username} is already taken`))
  }

  callback()
}

function validatePass(rule: any, value: any, callback: any) {
  if (value === '') {
    return callback(new Error('Please input the password'))
  }

  if (ruleForm.checkPass !== '') {
    if (!ruleFormRef.value) return
    ruleFormRef.value.validateField('checkPass', () => null)
  }

  callback()
}

const validatePass2 = (rule: any, value: any, callback: any) => {
  if (value === '') {
    return callback(new Error('Please input the password again'))
  }

  if (value !== ruleForm.password) {
    return callback(new Error("Two inputs don't match!"))
  }

  callback()
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
  formEl.validate(async (valid) => {
    if (!valid) {
      return false
    }

    if (!await registerStatus(ruleForm)) {
      ElNotification({
        message: h(
          'span',
          { style: 'color: teal' },
          'The username/password is incorrect.'
        )
      })
    }

    await router.push('/login')
  })
}

async function registerStatus(form: userInfo) {
  const signUpRes = await register(form)
  return signUpRes[0].result === 1;
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
            <el-form-item label="Name" prop="username">
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
