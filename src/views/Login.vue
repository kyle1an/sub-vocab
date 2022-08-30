<script lang="tsx" setup>
import type { FormInstance, FormItemRule } from 'element-plus'
import { ElButton, ElForm, ElFormItem, ElInput, ElNotification } from 'element-plus'
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useVocabStore } from '@/store/useVocab'
import router from '@/router'
import { login } from '@/api/user'
import { resetForm } from '@/utils/elements'

const { t } = useI18n()
const store = useVocabStore()
const ruleFormRef = ref<FormInstance>()

function checkUsername(rule: FormItemRule | FormItemRule[], username: string, callback: (arg0?: Error) => void) {
  if (!username.length) {
    return callback(new Error(t('Please input name')))
  }

  if (username.length > 20) {
    return callback(new Error(t('Please use a shorter name')))
  }

  if (username.length < 2) {
    return callback(new Error(t('NameLimitMsg')))
  }

  callback()
}

function validatePass(rule: FormItemRule | FormItemRule[], password: string, callback: (arg0?: Error) => void) {
  if (password === '') {
    return callback(new Error(t('Please input the password')))
  }

  callback()
}

const ruleForm = reactive({
  username: '',
  password: '',
})
const rules = reactive({
  username: [{ validator: checkUsername, trigger: 'blur' }],
  password: [{ validator: validatePass, trigger: 'blur' }],
})

function submitForm(formEl: FormInstance | undefined) {
  if (!formEl) return
  formEl.validate(async (valid) => {
    if (!valid) return

    const resAuth = await login(ruleForm)
    if (!resAuth.length) {
      return ElNotification({
        message:
          <span style={{ color: 'teal' }}>{t('incorrectUserPassword')}</span>
      })
    }

    store.login(ruleForm.username, resAuth[1])
    requestAnimationFrame(() => router.push('/'))
  })
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
          <el-form-item>
            <el-button
              type="primary"
              @click="submitForm(ruleFormRef)"
            >
              {{ t('Submit') }}
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
