<script lang="tsx" setup>
import { existsUsername, register } from '../api/user'
import router from '../router'
import type { FormInstance } from 'element-plus'
import { userInfo } from '../types/user'
import { ElNotification } from 'element-plus/es'
import { ref } from 'vue'

const { t } = useI18n()
const ruleFormRef = ref<FormInstance>()

async function checkUsername(rule: any, value: any, callback: any) {
  const username = String(value)
  if (!username.length) {
    return callback(new Error(t('Please input name')))
  }

  if (username.length > 20) {
    return callback(new Error(t('Please use a shorter name')))
  }

  if (username.length < 2) {
    return callback(new Error(t('NameLimitMsg')))
  }

  if ((await existsUsername({ username })).has) {
    return callback(new Error(`${username}${t('alreadyTaken')}`))
  }

  callback()
}

function validatePass(rule: any, value: any, callback: any) {
  if (value === '') {
    return callback(new Error(t('Please input the password')))
  }

  if (ruleForm.checkPass !== '') {
    if (!ruleFormRef.value) return
    ruleFormRef.value.validateField('checkPass', () => null)
  }

  callback()
}

const validatePass2 = (rule: any, value: any, callback: any) => {
  if (value === '') {
    return callback(new Error(t('Please input the password again')))
  }

  if (value !== ruleForm.password) {
    return callback(new Error(t('inputsNotMatch')))
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
        message:
          <span style={{ color: 'teal' }}>Something went wrong.</span>
      })
    }

    await router.push('/login')
  })
}

async function registerStatus(form: userInfo) {
  const signUpRes = await register(form)
  return signUpRes[0].result === 1
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
        <el-card
          shadow="always"
          class="mx-auto flex w-80 justify-center"
        >
          <el-form
            ref="ruleFormRef"
            :model="ruleForm"
            :rules="rules"
            label-position="top"
            label-width="100px"
            class="max-w-[460px]"
            status-icon
          >
            <el-form-item
              :label="t('Name')"
              prop="username"
            >
              <el-input
                v-model.number="ruleForm.username"
                class="!text-base md:!text-xs"
              />
            </el-form-item>
            <el-form-item
              :label="t('Password')"
              prop="password"
            >
              <el-input
                v-model="ruleForm.password"
                type="password"
                autocomplete="off"
                class="!text-base md:!text-xs"
              />
            </el-form-item>
            <el-form-item
              :label="t('Confirm')"
              prop="checkPass"
            >
              <el-input
                v-model="ruleForm.checkPass"
                type="password"
                autocomplete="off"
                class="!text-base md:!text-xs"
              />
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                @click="submitForm(ruleFormRef)"
              >
                {{ t('Create Account') }}
              </el-button>
              <el-button @click="resetForm(ruleFormRef)">
                {{ t('Reset') }}
              </el-button>
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
