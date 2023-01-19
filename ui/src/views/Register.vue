<script lang="tsx" setup>
import type { FormInstance, FormItemRule } from 'element-plus'
import { ElButton, ElForm, ElFormItem, ElInput } from 'element-plus'
import { reactive } from 'vue'
import { t } from '@/i18n'
import type { userInfo } from '@/types'
import router from '@/router'
import { register } from '@/api/user'
import { resetForm } from '@/utils/elements'
import { checkUsername, checkUsernameTaken, noEmptyPassword } from '@/utils/validation'

const ruleFormRef = $ref<FormInstance>()

async function checkUsernameRegister(rule: FormItemRule | FormItemRule[], username: string, callback: (arg0?: Error) => void) {
  checkUsername(rule, username, callback)
  await checkUsernameTaken(rule, username, callback)
  callback()
}

function validatePass(rule: FormItemRule | FormItemRule[], value: string, callback: (arg0?: Error) => void) {
  noEmptyPassword(rule, value, callback)

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
  username: [{ validator: checkUsernameRegister, trigger: 'blur' }],
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
      <section class="py-5">
        <div class="mx-auto flex flex-col items-center justify-center px-6 lg:py-0">
          <div class="w-full rounded-lg bg-white shadow dark:border sm:max-w-md md:mt-0 xl:p-0">
            <div class="max-w-80 space-y-4 p-6 sm:p-8 md:w-80 md:space-y-6">
              <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                {{ t('signup') }}
              </h1>
              <ElForm
                ref="ruleFormRef"
                :model="ruleForm"
                :rules="rules"
                label-position="top"
                label-width="100px"
                class="[&>.el-form-item_label]:font-bold"
                status-icon
              >
                <ElFormItem
                  :label="t('Name')"
                  prop="username"
                  :error="errorMsg"
                >
                  <ElInput
                    v-model.number="ruleForm.username"
                    class="!text-base md:!text-xs"
                  />
                </ElFormItem>
                <ElFormItem
                  :label="t('Password')"
                  prop="password"
                >
                  <ElInput
                    v-model="ruleForm.password"
                    type="password"
                    autocomplete="off"
                    class="!text-base md:!text-xs"
                  />
                </ElFormItem>
                <ElFormItem
                  :label="t('Confirm')"
                  prop="checkPass"
                >
                  <ElInput
                    v-model="ruleForm.checkPass"
                    type="password"
                    autocomplete="off"
                    class="!text-base md:!text-xs"
                  />
                </ElFormItem>
                <ElFormItem>
                  <ElButton
                    type="primary"
                    @click="submitForm(ruleFormRef)"
                  >
                    {{ t('Create Account') }}
                  </ElButton>
                  <ElButton @click="resetForm(ruleFormRef)">
                    {{ t('Reset') }}
                  </ElButton>
                </ElFormItem>
              </ElForm>
              <p class="text-sm font-light text-gray-500 dark:text-gray-400">
                Already have an account?
                <RouterLink
                  to="/login"
                  class="text-primary-600 dark:text-primary-500 font-medium hover:underline"
                >
                  {{ t('login') }}
                </RouterLink>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
