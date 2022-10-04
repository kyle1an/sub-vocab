<script lang="ts" setup>
import type { FormInstance, FormItemRule } from 'element-plus'
import { ElButton, ElForm, ElFormItem, ElInput } from 'element-plus'
import { reactive } from 'vue'
import { t } from '@/i18n'
import { changePassword } from '@/api/user'
import { useVocabStore } from '@/store/useVocab'
import { resetForm } from '@/utils/elements'

const { user } = $(useVocabStore())
const ruleFormRef = $ref<FormInstance>()

function validatePass(rule: FormItemRule | FormItemRule[], value: string, callback: () => void) {
  if (value === '') {
    return callback()
  }

  if (ruleForm.checkPass !== '') {
    if (!ruleFormRef) return
    ruleFormRef.validateField('checkPass', () => null)
  }

  callback()
}

function validatePass2(rule: FormItemRule | FormItemRule[], value: string, callback: (arg0?: Error) => void) {
  if (value === '' && ruleForm.password === '') {
    return callback()
  }

  if (value !== ruleForm.password) {
    return callback(new Error(t('inputsNotMatch')))
  }

  callback()
}

const ruleForm = reactive({
  oldPassword: '',
  password: '',
  checkPass: '',
})
const rules = reactive({
  password: [{ validator: validatePass, trigger: 'blur' }],
  checkPass: [{ validator: validatePass2, trigger: 'blur' }],
})

function submitForm(formEl: FormInstance | undefined) {
  if (!formEl) return
  formEl.validate((valid) => {
    if (!valid) {
      console.log('error submit!')
      return false
    }

    alterInfo(ruleForm)
  })
}

let errorMsg = $ref('')

async function alterInfo(form: typeof ruleForm) {
  if (form.password !== '') {
    form.password = form.password.trim()
    const res = await changePassword({
      username: user,
      oldPassword: form.oldPassword,
      newPassword: form.password,
    })

    if (res.success) {
      useVocabStore().logout()
    } else {
      errorMsg = res.message || 'something went wrong'
    }
  }
}
</script>

<template>
  <div class="flex flex-col">
    <div class="mb-3 border-b pb-1.5 text-xl">
      {{ t('changePassword') }}
    </div>
    <div class="flex w-80">
      <ElForm
        ref="ruleFormRef"
        :model="ruleForm"
        :rules="rules"
        label-position="top"
        label-width="100px"
        class="max-w-[460px] [&>.el-form-item_label]:font-bold"
        status-icon
      >
        <ElFormItem
          :label="t('Old Password')"
          prop="oldPassword"
          :error="errorMsg"
        >
          <ElInput
            v-model="ruleForm.oldPassword"
            type="password"
            autocomplete="off"
            class="!text-base md:!text-xs"
          />
        </ElFormItem>
        <ElFormItem
          :label="t('New Password')"
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
          :label="t('New Password Confirm')"
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
            {{ t('Confirm Changes') }}
          </ElButton>
          <ElButton @click="resetForm(ruleFormRef)">
            {{ t('Reset') }}
          </ElButton>
        </ElFormItem>
      </ElForm>
    </div>
  </div>
</template>
