<script lang="ts" setup>
import type { FormInstance, FormItemRule } from 'element-plus'
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElButton, ElForm, ElFormItem, ElInput } from 'element-plus'
import router from '@/router'
import { changePassword } from '@/api/user'
import { useVocabStore } from '@/store/useVocab'
import { resetForm } from '@/utils/elements'

const { t } = useI18n()
const store = useVocabStore()
const ruleFormRef = ref<FormInstance>()

function validatePass(rule: FormItemRule | FormItemRule[], value: string, callback: () => void) {
  if (value === '') {
    return callback()
  }

  if (ruleForm.checkPass !== '') {
    if (!ruleFormRef.value) return
    ruleFormRef.value.validateField('checkPass', () => null)
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

const errorMsg = ref('')

async function alterInfo(form: typeof ruleForm) {
  if (form.password !== '') {
    form.password = form.password.trim()
    const res = await changePassword({
      username: store.user,
      oldPassword: form.oldPassword,
      newPassword: form.password,
    })

    if (res.success) {
      useVocabStore().logout()
      requestAnimationFrame(() => router.push('/'))
    } else {
      errorMsg.value = res.message || 'something went wrong'
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
          :label="t('Old Password')"
          prop="oldPassword"
          :error="errorMsg"
        >
          <el-input
            v-model="ruleForm.oldPassword"
            type="password"
            autocomplete="off"
            class="!text-base md:!text-xs"
          />
        </el-form-item>
        <el-form-item
          :label="t('New Password')"
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
          :label="t('New Password Confirm')"
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
            {{ t('Confirm Changes') }}
          </el-button>
          <el-button @click="resetForm(ruleFormRef)">
            {{ t('Reset') }}
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
