<script lang="tsx" setup>
import type { FormInstance, FormItemRule } from 'element-plus'
import { ElButton, ElForm, ElFormItem, ElInput } from 'element-plus'
import { reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { userInfo } from '@/types/user'
import router from '@/router'
import { isUsernameTaken, register } from '@/api/user'
import { resetForm } from '@/utils/elements'

const { t } = useI18n()
const ruleFormRef = $ref<FormInstance>()

async function checkUsername(rule: FormItemRule | FormItemRule[], username: string, callback: (arg0?: Error) => void) {
  if (!username.length) {
    return callback(new Error(t('Please input name')))
  }

  if (username.length > 20) {
    return callback(new Error(t('Please use a shorter name')))
  }

  if (username.length < 2) {
    return callback(new Error(t('NameLimitMsg')))
  }

  if ((await isUsernameTaken({ username })).has) {
    return callback(new Error(`${username}${t('alreadyTaken')}`))
  }

  callback()
}

function validatePass(rule: FormItemRule | FormItemRule[], value: string, callback: (arg0?: Error) => void) {
  if (value === '') {
    return callback(new Error(t('Please input the password')))
  }

  if (ruleForm.checkPass !== '') {
    if (!ruleFormRef) return
    ruleFormRef.validateField('checkPass', () => null)
  }

  callback()
}

function validatePass2(rule: FormItemRule | FormItemRule[], value: string, callback: (arg0?: Error) => void) {
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
let errorMsg = $ref('')

function submitForm(formEl: FormInstance | undefined) {
  if (!formEl) return
  formEl.validate(async (valid) => {
    if (!valid) {
      return false
    }

    if (!await registerStatus(ruleForm)) {
      errorMsg = 'Something went wrong.'
      return
    }

    await router.push('/login')
  })
}

async function registerStatus(form: userInfo) {
  const signUpRes = await register(form)
  return signUpRes[0].result === 1
}
</script>

<template>
  <div class="flex flex-row">
    <div class="mx-auto py-6">
      <div class="flex w-80 justify-center rounded-md bg-white py-5 shadow-lg ">
        <el-form
          ref="ruleFormRef"
          :model="ruleForm"
          :rules="rules"
          label-position="top"
          label-width="100px"
          class="max-w-[460px] [&>.el-form-item_label]:font-bold"
          status-icon
        >
          <el-form-item
            :label="t('Name')"
            prop="username"
            :error="errorMsg"
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
      </div>
    </div>
  </div>
</template>
